import cv2
import numpy as np
import tensorrt as trt
import pycuda.driver as cuda
import sys, os
from PIL import ImageDraw
from data_processing import PreprocessYOLO, PostprocessYOLO, ALL_CATEGORIES
import common

# Set print options for NumPy, allowing the full array to be printed
np.set_printoptions(threshold=sys.maxsize)

# Define a constant for explicit batch processing
EXPLICIT_BATCH = 1 << (int)(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH)
# Create a logger instance for TensorRT
TRT_LOGGER = trt.Logger()


class Model:
    @staticmethod
    def get_engine(onnx_file_path, engine_file_path=""):
        # Attempts to load a pre-existing TensorRT engine, otherwise builds and returns a new one.

        def build_engine():
            print("Building engine file from onnx, this could take a while")
            # Builds and returns a TensorRT engine from an ONNX file.
            with trt.Builder(TRT_LOGGER) as builder, \
                    builder.create_network(common.EXPLICIT_BATCH) as network, \
                    builder.create_builder_config() as config, \
                    trt.OnnxParser(network, TRT_LOGGER) as parser, \
                    trt.Runtime(TRT_LOGGER) as runtime:

                config.max_workspace_size = 1 << 28  # Set maximum workspace size to 256MiB
                builder.max_batch_size = 1

                # Check if ONNX file exists
                if not os.path.exists(onnx_file_path):
                    print("ONNX file {} not found.".format(onnx_file_path))
                    exit(0)

                # Load and parse the ONNX file
                with open(onnx_file_path, "rb") as model:
                    if not parser.parse(model.read()):
                        print("ERROR: Failed to parse the ONNX file.")
                        for error in range(parser.num_errors):
                            print(parser.get_error(error))
                        return None

                # Set input shape for the network
                network.get_input(0).shape = [1, 3, 320, 320]

                # Build and serialize the network, then create and return the engine
                plan = builder.build_serialized_network(network, config)
                engine = runtime.deserialize_cuda_engine(plan)
                with open(engine_file_path, "wb") as f:
                    f.write(plan)
                return engine

        # Check if a serialized engine file exists and load it if so, otherwise build a new one
        if os.path.exists(engine_file_path):
            with open(engine_file_path, "rb") as f, trt.Runtime(TRT_LOGGER) as runtime:
                return runtime.deserialize_cuda_engine(f.read())
        else:
            return build_engine()

    @staticmethod
    def image_processing(image):
        # Enhances the image by shifting the hue and adjusting saturation and brightness.

        # Convert the image to HSV color space
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

        # Modify the hue, saturation, and value channels
        hsv[..., 0] = hsv[..., 0] + 12
        hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.2, 0, 255)
        hsv[:, :, 2] = np.clip(hsv[:, :, 2] * 1.1, 0, 255)

        # Convert the image back to BGR color space
        return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

    def __init__(self):
        # Initialize the TensorRT engine and execution context.

        # Define file paths for ONNX and engine files
        current_folder_path = os.path.dirname(os.path.abspath(__file__))
        onnx_file_path = os.path.join(current_folder_path, "VEXOverUnder.onnx")  # If you change the onnx file to your own model, adjust the file name here
        engine_file_path = os.path.join(current_folder_path, "VEXOverUnder.trt")  # This should match the .onnx file name

        # Get the TensorRT engine
        self.engine = Model.get_engine(onnx_file_path, engine_file_path)

        # Create an execution context
        self.context = self.engine.create_execution_context()

        # Allocate buffers for input and output
        self.inputs, self.outputs, self.bindings, self.stream = common.allocate_buffers(self.engine)

    def inference(self, inputImage):
        # Perform inference on the given image and return the bounding boxes, scores, and classes of detected objects.

        # Process the input image
        input_image = Model.image_processing(inputImage)

        # Define input resolution and create preprocessor
        input_resolution_yolov3_HW = (320, 320)
        preprocessor = PreprocessYOLO(input_resolution_yolov3_HW)

        # Process the image and get original shape
        image_raw, image = preprocessor.process(input_image)
        shape_orig_WH = image_raw.size

        # Define output shapes for post-processing
        output_shapes = [(1, 24, 10, 10), (1, 24, 20, 20)]

        # Set the input and perform inference
        self.inputs[0].host = image
        trt_outputs = common.do_inference_v2(self.context, bindings=self.bindings, inputs=self.inputs,
                                             outputs=self.outputs, stream=self.stream)

        # Reshape the outputs for post-processing
        trt_outputs = [output.reshape(shape) for output, shape in zip(trt_outputs, output_shapes)]

        # Define arguments for post-processing
        postprocessor_args = {
            "yolo_masks": [(3, 4, 5), (0, 1, 2)],
            "yolo_anchors": [(10, 14), (23, 27), (37, 58), (81, 82), (135, 169), (344, 319)],
            "obj_threshold": [0.4, 0.90, 0.90],  # Different thresholds for each class label (Green, Red, Blue)
            "nms_threshold": 0.5,
            "yolo_input_resolution": input_resolution_yolov3_HW,
        }

        # Perform post-processing
        postprocessor = PostprocessYOLO(**postprocessor_args)
        boxes, classes, scores = postprocessor.process(trt_outputs, (shape_orig_WH))

        Detections = []

        # Handle case with no detections
        if boxes is None or classes is None or scores is None:
            print("No objects were detected.")
            return input_image, Detections

        # Draw bounding boxes and return detected objects
        obj_detected_img = Model.draw_bboxes(image_raw, boxes, scores, classes, ALL_CATEGORIES, Detections)
        obj_detected_img = obj_detected_img.convert("RGB")
        return np.array(obj_detected_img), Detections

    @staticmethod
    def draw_bboxes(image_raw, bboxes, confidences, categories, all_categories, Detections, bbox_color="white"):
        # Draw bounding boxes on the original image and return it.

        # Create drawing context
        draw = ImageDraw.Draw(image_raw)

        # Draw each bounding box
        for box, score, category in zip(bboxes, confidences, categories):
            x_coord, y_coord, width, height = box
            left = max(0, np.floor(x_coord + 0.5).astype(int))
            top = max(0, np.floor(y_coord + 0.5).astype(int))
            right = min(image_raw.width, np.floor(x_coord + width + 0.5).astype(int))
            bottom = min(image_raw.height, np.floor(y_coord + height + 0.5).astype(int))

            # Draw the rectangle and text
            # draw.rectangle(((left, top), (right, bottom)), outline=bbox_color)
            # draw.text((left, top - 12), "{0} {1:.2f}".format(all_categories[category], score), fill=bbox_color)

            # Create and store the raw detection object
            raw_detection = rawDetection(int(left), int(top), [x_coord, y_coord], int(width), int(height), score,
                                         category)
            Detections.append(raw_detection)

        return image_raw


class rawDetection:
    def __init__(self, x: int, y: int, center: [], width: int, height: int, prob: float, classID: int):
        # Class to store information about a detected object.

        self.x = x
        self.y = y
        self.Center = center
        self.Width = width
        self.Height = height
        self.Prob = prob
        self.ClassID = classID
