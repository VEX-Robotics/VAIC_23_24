from threading import Lock
import json
import cv2
import base64
import numpy as np
from V5Comm import AIRecord
from V5Position import Position
from websocket_server import WebsocketServer
import json
import logging
import os

# Statistics object to report info the the websocket
class Statistics:
    # A class to contain statistics data
    def __init__(self, fps: float, invokeTime: float, cpuTemp: float, videoWidth: int, videoHeight: int, runTime: int, gpsConnected: bool):
        # Initialize statistics attributes such as FPS, CPU temperature, video dimensions, runtime, and GPS connection status
        self.fps = fps
        self.invokeTime = invokeTime
        self.cpuTemp = cpuTemp
        self.videoWidth = videoWidth
        self.videoHeight = videoHeight
        self.runTime = runTime
        self.gpsConnected = gpsConnected

class V5WebData:

    __DEFAULT_PORT = 3030

    def __init__(self, v5Map, v5Pos, port = None):
        # Constructor that initializes the server, offsets, and communication instances.
        # v5Map and v5Pos are objects to update the Intel RealSense Camera and GPS offsets.
        self.__serverPort = V5WebData.__DEFAULT_PORT

        if(port != None):
            self.__serverPort = port

        # Load offsets from JSON files
        self.__gpsOffset = GPSOffset.from_JSON("gps_offsets.json")
        self.__cameraOffset = CameraOffset.from_JSON("camera_offsets.json")
        if(v5Map is not None):
            v5Map.updateOffset(self.__cameraOffset)
        if(v5Pos is not None):
            v5Pos.updateOffset(self.__gpsOffset)
        self.__v5Map = v5Map
        self.__v5Pos = v5Pos
        # We host at 0.0.0.0 to broadcast to all IP addresses, so to connect from an external connection, it would be port 3030 at the IP address of the device running V5Web.py
        self.__server = WebsocketServer(host = '0.0.0.0', port = self.__serverPort, loglevel = logging.INFO) 
        self.__server.set_fn_new_client(self.__new_client)
        self.__server.set_fn_client_left(self.__client_left)
        self.__server.set_fn_message_received(self.__message_received)

    def start(self):
        # Start the WebsocketServer and initialize detection data, images, and statistics.
        self.__detections = AIRecord(Position(0, 0, 0, 0, 0, 0, 0, 0), [])
        self.__colorImage = None 
        self.__depthImage = None 
        self.__stats = Statistics(0, 0, 0, 0, 0, 0, False)
        self.__dataLock = Lock()

        self.__server.run_forever(True)

    def __new_client(self, client, server):
        # Called for every client connecting (after handshake)
        print("New client connected and was given id %d" % client['id'])

    def __getCameraOffset(self):
        # Returns the current camera offset
        return self.__cameraOffset
    
    def __getGpsOffset(self):
        # Returns the current GPS offset
        return self.__gpsOffset

    def __client_left(self, client, server):
        # Callback function for client disconnection
        print("Client(%d) disconnected" % client['id'])

    def __getStatsElement(self):
        # Returns the current statistics elements
        outData = {}
        
        self.__dataLock.acquire()
        nowStats = self.__stats
        self.__dataLock.release()

        outData['FPS'] = nowStats.fps
        outData['InferTime'] = nowStats.invokeTime
        outData['VideoWidth'] = nowStats.videoWidth
        outData['VideoHeight'] = nowStats.videoHeight
        outData['RunTime'] = nowStats.runTime
        outData['GPSConnected'] = nowStats.gpsConnected
        outData['CPUTempurature'] = nowStats.cpuTemp

        return outData
    
    def __getPositionElement(self):
        # Returns the current position elements
        self.__dataLock.acquire()
        nowObjects = self.__detections
        self.__dataLock.release()

        outData = {}
        outData['Status'] = nowObjects.position.status
        outData['X'] = nowObjects.position.x
        outData['Y'] = nowObjects.position.y
        outData['Z'] = nowObjects.position.z
        outData['Azimuth'] = nowObjects.position.azimuth
        outData['Elevation'] = nowObjects.position.elevation
        outData['Rotation'] = nowObjects.position.rotation
        outData['Connected'] = (nowObjects.position.status & Position.STATUS_CONNECTED) != 0

        return outData
    
    def __getDetectionElement(self):
        # Returns a list of detection elements in JSON format
        self.__dataLock.acquire()
        nowObjects = self.__detections
        self.__dataLock.release()

        outList = []

        for detect in nowObjects.detections:
            outList.append(detect.to_JSON())

        return outList
    
    def __getColorElement(self):
        # Returns the color image data encoded in base64
        outData = {}
        imageData = {}
        
        self.__dataLock.acquire()
        pixelData = self.__colorImage
        self.__dataLock.release()

        if(len(pixelData) > 0):
            imageData['Valid'] = True
            imageData['Width'] = pixelData.shape[1]
            imageData['Height'] = pixelData.shape[0]
            imageData['Data'] = base64.b64encode(np.array(cv2.imencode(".jpeg", pixelData)[1]).tobytes()).decode('utf-8')
        else:
            imageData['Valid'] = False
            imageData['Error'] = "Image Unavailable"

        outData['Image'] = imageData

        return outData
    
    def __getDepthElement(self):
        # Returns the depth image data encoded in base64
        outData = {}
        imageData = {}
        
        self.__dataLock.acquire()
        pixelData = self.__depthImage
        self.__dataLock.release()

        if(len(pixelData) > 0):
            imageData['Valid'] = True
            imageData['Width'] = pixelData.shape[1]
            imageData['Height'] = pixelData.shape[0]
            imageData['Data'] = base64.b64encode(np.array(cv2.imencode(".jpeg", pixelData)[1]).tobytes()).decode('utf-8')
        else:
            imageData['Valid'] = False
            imageData['Error'] = "Image Unavailable"

        outData['Image'] = imageData

        return outData

    def __message_received(self, client, server, message):
        # Callback function for receiving a message from the client
        # Processes the message based on the command and sends the requested data
        if (message.startswith("set_gps_offset")):
            new_values = message.split(',')[1:]  # extract the new values from the message
            new_values = [float(new_values[i]) if i != 3 else new_values[i] for i in range(5)]
            # parse the new values and create a new GPSOffset instance to update the GPS Offset
            new_gps_offset = GPSOffset(*new_values)
            self.setGpsOffset(new_gps_offset)
        elif (message.startswith("set_camera_offset")):
            new_values = message.split(',')[1:]  # extract the new values from the message
            new_values = [float(new_values[i]) if i != 3 else new_values[i] for i in range(6)]
            # parse the new values and create a new CameraOffset instance to update the Camera Offset
            new_camera_offset = CameraOffset(*new_values)
            self.setCameraOffset(new_camera_offset)
        else:
            if len(message) > 200:
                message = message[:200]+'..'
            #print("Client(%d) said: %s" % (client['id'], message))

            outData = {}
            outData['Command'] = message
            outData['Valid'] = True


            cmds = message.split(",")
            for cmd in cmds:
                #print("Web Cmd: ", cmd)
                if(cmd == "g_pos"):
                    outData['Position'] = self.__getPositionElement()
                elif(cmd == "g_detect"):
                    outData['Detections'] = self.__getDetectionElement()
                elif(cmd == "g_stats"):
                    outData['Stats'] = self.__getStatsElement()
                elif(cmd == "g_depth"):
                    outData['Depth'] = self.__getDepthElement()
                elif(cmd == "g_color"):
                    outData['Color'] = self.__getColorElement()
                elif(cmd == "get_camera_offset"):
                    outData['CameraOffset'] = self.__getCameraOffset().__dict__
                elif(cmd == "get_gps_offset"):
                    outData['GpsOffset'] = self.__getGpsOffset().__dict__

            outData = self.convert_numpy_to_list(outData)

            # print(json.dumps(outData, indent=3))
            # print(outData)
            server.send_message(client, json.dumps(outData))

    def convert_numpy_to_list(self, obj):
        # Helper function to convert numpy arrays to lists, recursively applied to the entire object
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {key: self.convert_numpy_to_list(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self.convert_numpy_to_list(element) for element in obj]
        else:
            return obj

    def setDetectionData(self, data: AIRecord):
        # Updates the detection data
        self.__dataLock.acquire()
        self.__detections = data
        self.__dataLock.release()

    def setColorImage(self, image):
        # Updates the color image data
        self.__dataLock.acquire()
        self.__colorImage = image
        self.__dataLock.release()

    def setDepthImage(self, image):
        # Updates the depth image data
        self.__dataLock.acquire()
        self.__depthImage = image
        self.__dataLock.release()

    def setStatistics(self, stats: Statistics):
        # Updates the statistics data
        self.__dataLock.acquire()
        self.__stats = stats
        self.__dataLock.release()

    def setGpsOffset(self, gpsOffset):
        # Updates the GPS offset and saves it to a JSON file
        self.__dataLock.acquire()
        self.__gpsOffset = gpsOffset
        if(self.__v5Pos is not None):
            self.__v5Pos.updateOffset(gpsOffset)
        self.__gpsOffset.to_JSON("gps_offsets.json")
        self.__dataLock.release()
    
    def setCameraOffset(self, cameraOffset):
        # Updates the camera offset and saves it to a JSON file
        self.__dataLock.acquire()
        self.__cameraOffset = cameraOffset
        if(self.__v5Map is not None):
            self.__v5Map.updateOffset(cameraOffset)
        self.__cameraOffset.to_JSON("camera_offsets.json")
        self.__dataLock.release()

    def isConnected(self):
        # Checks if there are any connected clients
        return len(self.__server.clients) > 0

    def stop(self):
        # Gracefully shuts down the server
        self.__server.shutdown_gracefully()

    def __del__(self):
        # Destructor to call the stop method when the object is deleted
        self.stop


class Offset:
    def __init__(self, x: float, y: float, z: float, unit: str, heading_offset: float):
        # Initialize properties of Offset class, including x, y, z coordinates, unit, and heading offset
        self.x = x
        self.y = y
        self.z = z
        self.unit = unit
        self.heading_offset = heading_offset

class GPSOffset(Offset):
    # Methods specific to GPSOffset, including JSON serialization and deserialization
    def __init__(self, x, y, z, unit, heading_offset):
        super().__init__(x, y, z, unit, heading_offset)

    @classmethod
    def from_JSON(cls, file_name):
        # Loads in the GPSOffset data from a JSON file, creates one with default values if it does not yet exist in the current directory
        try:
            # Get the directory of the current script
            script_dir = os.path.dirname(os.path.realpath(__file__))

            # Combine the script's directory with the file name
            file_path = os.path.join(script_dir, file_name)
            with open(file_path, 'r') as f:
                data = json.load(f)
            return cls(data['x'], data['y'], data['z'], data['unit'], data['heading_offset'])
        except (FileNotFoundError, KeyError, ValueError):
            new_instance = cls(0.0, 0.0, 0.0, "meters", 0.0)
            new_instance.to_JSON(file_name)
            return new_instance

    def to_JSON(self, file_name):
        # Writes the current GPSOffset data to a JSON file, updating the file so the local offset is always current with the stored offset
        # Get the directory of the current script
        script_dir = os.path.dirname(os.path.realpath(__file__))

        # Combine the script's directory with the file name
        file_path = os.path.join(script_dir, file_name)
        data = {'x': self.x, 'y': self.y, 'z': self.z, 'unit': self.unit, 'heading_offset': self.heading_offset}
        with open(file_path, 'w') as f:
            json.dump(data, f)


class CameraOffset(Offset):
    # Methods specific to CameraOffset, including JSON serialization and deserialization
    def __init__(self, x, y, z, unit, heading_offset, elevation_offset):
        super().__init__(x, y, z, unit, heading_offset)
        self.elevation_offset = elevation_offset
    
    @classmethod
    def from_JSON(cls, file_name):
        # Loads in the CameraOffset data from a JSON file, creates one with default values if it does not yet exist in the current directory
        try:
            # Get the directory of the current script
            script_dir = os.path.dirname(os.path.realpath(__file__))

            # Combine the script's directory with the file name
            file_path = os.path.join(script_dir, file_name)
            with open(file_path, 'r') as f:
                data = json.load(f)
            return cls(data['x'], data['y'], data['z'], data['unit'], data['heading_offset'], data['elevation_offset'])
        except (FileNotFoundError, KeyError, ValueError):
            new_instance = cls(0.0, 0.0, 0.0, "meters", 0.0, 0.0)
            new_instance.to_JSON(file_name)
            return new_instance

    def to_JSON(self, file_name):
        # Writes the current CameraOffset data to a JSON file, updating the file so the local offset is always current with the stored offset
           # Get the directory of the current script
        script_dir = os.path.dirname(os.path.realpath(__file__))

        # Combine the script's directory with the file name
        file_path = os.path.join(script_dir, file_name)
        data = {'x': self.x, 'y': self.y, 'z': self.z, 'unit': self.unit, 'heading_offset': self.heading_offset, 'elevation_offset': self.elevation_offset}
        with open(file_path, 'w') as f:
            json.dump(data, f)

