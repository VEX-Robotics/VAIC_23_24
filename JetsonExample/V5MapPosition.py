import numpy as np
import math
from V5Position import Position
import V5Comm
import pyrealsense2 as rs

class MapPosition:

    def __init__(self):
        # Constants for camera configuration
        self.MAXSCREENX = 320  # Half of the x framesize
        self.MAXSCREENY = 240  # Half of the y framesize
        self.REALDIST = 610.98  # Screen distance of the camera (focal length in pixels)
        self.UNITS = "meters"
        # When x and y offsets are updated, offsets are automatically converted to meters
        self.CAMERAOFFSETX = 0 # Camera offset in default units (meters) (X-axis)
        self.CAMERAOFFSETY = 0 # Camera offset in default units (meters) (Y-axis)
        self.CAMERAOFFSETZ = 0 # Camera offset in default units (meters) (Z-axis)
        self.CAMERAHEADINGOFFSET = 0 # Offset for camera heading in degrees (difference between GPS and front of camera)
        self.CAMERAELEVATIONOFFSET = 0 # Tilt offset of the camera

    def updateOffset(self, newOffset):
        # Method to update the camera offsets based on the given units
        unitDivisor = 1
        if newOffset.unit in ("CM", "cm"):
            unitDivisor = 100
        elif newOffset.unit in ("MM", "mm"):
            unitDivisor = 1000
        elif newOffset.unit in ("IN", "in", "inches"):
            unitDivisor = 39.3701
        elif newOffset.unit not in ("m", "meters", "M"):
            raise Exception("Invalid argument: Unit not accepted")
        # Update the offset values
        self.CAMERAOFFSETX = newOffset.x / unitDivisor
        self.CAMERAOFFSETY = newOffset.y / unitDivisor
        self.CAMERAOFFSETZ = newOffset.z / unitDivisor
        # Heading and elevation offsets are always in degrees
        self.CAMERAHEADINGOFFSET = newOffset.heading_offset
        self.CAMERAELEVATIONOFFSET = newOffset.elevation_offset
        self.__OFFSETUNITS = "meters"  # Units will always be saved as meters and converted from input units

    def azel2rot(az, el, tw):
        # Convert azimuth, elevation, and twist to rotation matrix
        sp = math.sin(az)
        cp = math.cos(az)
        st = math.sin(el)
        ct = math.cos(el)
        ss = math.sin(tw)
        cs = math.cos(tw)

        aa = cp * cs + sp * st * ss
        ab = sp * ct
        ac = cp * ss - sp * st * cs
        ba = -sp * cs + cp * st * ss
        bb = cp * ct
        bc = -sp * ss - cp * st * cs
        ca = -ct * ss
        cb = st
        cc = ct * cs

        rot = np.array([[aa,ab,ac],[ba,bb,bc],[ca,cb,cc]])
        return rot

    def computeMapLocation(self, detection, depth, position):
        # Constants for calculation
        MAXSCREENX = self.MAXSCREENX
        MAXSCREENY = self.MAXSCREENY
        REALDIST = self.REALDIST

        CAMERAOFFSETX = self.CAMERAOFFSETX
        CAMERAOFFSETY = self.CAMERAOFFSETY
        CAMERAOFFSETZ = self.CAMERAOFFSETZ
        CAMERAHEADINGOFFSET = self.CAMERAHEADINGOFFSET
        CAMERAELEVATIONOFFSET = self.CAMERAHEADINGOFFSET

        # Create a rotation matrix using azimuth, elevation, and rotation
        rot = MapPosition.azel2rot(math.radians(position.azimuth - CAMERAHEADINGOFFSET), math.radians(position.elevation - CAMERAELEVATIONOFFSET), math.radians(position.rotation))
        
        # Compute the object location vector in camera space
        vector = np.zeros(shape=(3, 1))
        vector[0] = depth * (detection.Center[0] - MAXSCREENX) / REALDIST
        vector[1] = depth
        vector[2] = depth * (MAXSCREENY - detection.Center[1]) / REALDIST

        # Rotate the vector to world space
        # By multiplying the relative position of the object in the screen with the information about the the perspective of the robot
        # the matrix multuplication results in the relative physical position of the object to the robot in 3D space
        mapLocation = np.matmul(rot, vector)

        # Translate to world coordinates, by adding current robot position on the field
        mapLocation[0] += position.x
        mapLocation[1] += position.y
        mapLocation[2] += position.z

        # Compute and rotate the camera offset to modify the offsets to be aligned with the global coordinate system based on position and heading of robot
        cameraOffset = np.array([[CAMERAOFFSETX], [CAMERAOFFSETY], [CAMERAOFFSETZ]])
        rotatedCameraOffset = np.matmul(rot, cameraOffset)

        # Add the adjusted camera offset
        mapLocation[0] += rotatedCameraOffset[0]
        mapLocation[1] += rotatedCameraOffset[1]
        mapLocation[2] -= rotatedCameraOffset[2]  # Subtract Z offset since the camera is higher than the center of the robot
        
        return mapLocation

