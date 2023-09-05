# Import necessary libraries
import pyrealsense2 as rs
import numpy as np
import cv2
import time
import os

from V5MapPosition import MapPosition

import V5Comm
from V5Comm import V5SerialComms
from V5Position import Position
from V5Position import V5GPS
from V5Web import V5WebData
from V5Web import Statistics

from model import Model


class Camera:
    # Class handles Camera object instantiation and data requests.
    def __init__(self):
        self.pipeline = rs.pipeline()  # Initialize RealSense pipeline
        self.config = rs.config()
        # Enable depth stream at 640x480 in z16 encoding at 30fps
        self.config.enable_stream(rs.stream.depth, 640, 480, rs.format.z16, 30)
        # Enable color stream at 640x480 in bgr8 encoding at 30fps
        self.config.enable_stream(rs.stream.color, 640, 480, rs.format.bgr8, 30)

    def start(self):
        self.profile = self.pipeline.start(self.config)  # Start the pipeline
        # Obtain depth sensor and calculate depth scale
        depth_sensor = self.profile.get_device().first_depth_sensor()
        self.depth_scale = depth_sensor.get_depth_scale()

    def get_frames(self):
        return self.pipeline.wait_for_frames()  # Wait and fetch frames from the pipeline

    def stop(self):
        self.pipeline.stop()  # Stop the pipeline when finished


class Processing:
    # Class to handle camera data processing, preparing for inference, and running inference on camera image.
    def __init__(self, depth_scale):
        self.depth_scale = depth_scale
        self.align_to = rs.stream.color
        self.align = rs.align(self.align_to)  # Align depth frames to color stream
        self.model = Model()  # Initialize the object detection model

    def get_depth(self, detection, depth_img):
        # Compute the bounding box indices for the detection
        height = detection.Height
        width = detection.Width

        # Calculate the indices of the middle 10% of the detection.
        top = int(detection.y) + height * 45 // 100
        bottom = int(detection.y) + height * 55 // 100
        left = int(detection.x) + width * 45 // 100
        right = int(detection.x) + width * 55 // 100

        # Extract depth values and scale them
        depth_img = depth_img[top:bottom, left:right].astype(float)
        depth_img = depth_img * self.depth_scale
        # Filter non-zero depth values
        depth_img = depth_img[depth_img != 0]
        # Compute and return mean depth value
        meanDepth = np.nanmean(depth_img)
        return meanDepth

    def align_frames(self, frames):
        # Align depth frames to color frames
        aligned_frames = self.align.process(frames)
        # Get the aligned frames and validate them
        self.depth_frame_aligned = aligned_frames.get_depth_frame()
        self.color_frame_aligned = aligned_frames.get_color_frame()

        if not self.depth_frame_aligned or not self.color_frame_aligned:
            self.depth_frame_aligned = None
            self.color_frame_aligned = None

    def process_frames(self, frames):
        # Align frames and extract color and depth images
        # Apply a color map to the depth image
        self.align_frames(frames)
        depth_image = np.asanyarray(self.depth_frame_aligned.get_data())
        color_image = np.asanyarray(self.color_frame_aligned.get_data())
        depthImage = cv2.normalize(depth_image, None, alpha=0.01, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8U)
        depth_map = cv2.applyColorMap(depthImage, cv2.COLORMAP_JET)

        return depth_image, color_image, depth_map

    def detect_objects(self, color_image):
        # Perform object detection and return results using the Model class in model.py
        output, detections = self.model.inference(color_image)
        return output, detections

    def compute_detections(self, v5, detections, depth_image):
        # Create AIRecord and compute detections with depth and image data.
        # Each AIRecord contains the ClassID, Probablity, and depth information for each detection
        # In addition to the detection's camera image and map position information.
        aiRecord = V5Comm.AIRecord(v5.get_v5Pos(), [])
        for detection in detections:
            depth = self.get_depth(detection, depth_image)
            imageDet = V5Comm.ImageDetection(
                int(detection.x),
                int(detection.y),
                int(detection.Width),
                int(detection.Height),
            )
            mapPos = v5.v5Map.computeMapLocation(detection, depth, aiRecord.position)
            mapDet = V5Comm.MapDetection(mapPos[0], mapPos[1], mapPos[2])
            detect = V5Comm.Detection(
                int(detection.ClassID),
                float(detection.Prob),
                float(depth),
                imageDet,
                mapDet,
            )
            aiRecord.detections.append(detect)
        return aiRecord


class Rendering:
    # Class to handle rendering camera data and process stat data to the webserver.
    def __init__(self, web_data):
        self.web_data = web_data

    def set_images(self, output, depth_image):
        # Update web data with color and depth images
        self.web_data.setColorImage(output)
        self.web_data.setDepthImage(depth_image)

    def set_detection_data(self, aiRecord):
        # Update web data with detection information
        self.web_data.setDetectionData(aiRecord)
    
    def set_stats(self, stats, v5Pos, start_time, invoke_time, run_time):
        # Set the statistics for FPS, invoke time, run time, and CPU temp
        stats.fps = 1.0 / (time.time() - start_time)
        stats.gpsConnected = v5Pos.isConnected()
        stats.invokeTime = invoke_time
        stats.runTime = time.time() - run_time
        temp_str = os.popen("cat /sys/devices/virtual/thermal/thermal_zone1/temp").read().rstrip("\n")
        temp = float(temp_str) / 1000
        stats.cpuTemp = temp
        self.web_data.setStatistics(stats)

    def display_output(self, output):
        # Display the output image in a window
        # Handle window closing with 'q' or 'esc' keys
        cv2.namedWindow("VEX OverUnder", cv2.WINDOW_AUTOSIZE)
        cv2.imshow("VEX OverUnder", output)
        key = cv2.waitKey(1)
        if key & 0xFF == ord("q") or key == 27:
            cv2.destroyAllWindows()


class MainApp:
    def __init__(self):
        # Initialize various components including camera, processing, and rendering
        print("Starting Intialization...")
        self.camera = Camera()
        self.camera.start()
        self.v5 = V5SerialComms()
        self.v5Map = MapPosition()
        self.v5Pos = V5GPS()
        self.v5Web = V5WebData(self.v5Map, self.v5Pos)
        self.stats = Statistics(0, 0, 0, 640, 480, 0, False)

        self.processing = Processing(self.camera.depth_scale)
        self.rendering = Rendering(self.v5Web)
        time.sleep(1)
        print("Initialized")

    def get_v5Pos(self):
        # Return V5Position object if GPS is connected but default values if not connected
        if self.v5Pos is None:
            return Position(0, 0, 0, 0, 0, 0, 0, 0)
        return self.v5Pos.getPosition()

    def set_v5(self, aiRecord):
        # Set detection data to the Brain if it is connected but does not set any data if None
        if self.v5 is not None:
            self.v5.setDetectionData(aiRecord)

    def run(self):
        # Start main loop: capture frames, process, detect objects, compute detections, render and display
        self.v5.start()
        self.v5Pos.start()
        self.v5Web.start()
        run_time = time.time()
        print("\nStarting Loop")
        try:
            while True:
                start_time = time.time()  # start time of the loop
                frames = self.camera.get_frames()
                depth_image, color_image, depth_map = self.processing.process_frames(frames)
                invoke_time = time.time()
                output, detections = self.processing.detect_objects(color_image)
                invoke_time = time.time() - invoke_time
                aiRecord = self.processing.compute_detections(self, detections, depth_image)
                self.set_v5(aiRecord)
                self.rendering.set_images(output, depth_map)
                self.rendering.set_detection_data(aiRecord)
                self.rendering.set_stats(self.stats, self.v5Pos, start_time, invoke_time, run_time)
                # self.rendering.display_output(output)
        finally:
            self.camera.stop()


if __name__ == "__main__":
    app = MainApp()  # Create the main application
    app.run()  # Run the application
