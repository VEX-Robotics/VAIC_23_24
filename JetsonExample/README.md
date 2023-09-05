## Running VEX AI Example Programs on Jetson
**How it works and how to use them together.**

Make sure you have `VAIC_23_24` pulled from GitHub **AND** ensure you followed steps 18-20 above to install the vexai service.

**Upon start up, your Jetson (if installed with the correct image) will automatically run `overunder.py` in the background. If you wish to stop it from running in the background, open a terminal and enter: `sudo systemctl stop vexai`. This will stop this session of the service but if you restart your Jetson, it will restart the code in the background again. 

**Make sure all of your files are in the same folder.** This folder should include: `common.py, data_processing.py, labels.txt, model.py, overunder.py, requirements.txt, V5Comm.py, V5MapPosition.py, V5Position.py, V5Web.py`.

The primary Python program that runs is `overunder.py`, it ties together all of the helper classes to run inference and return object information from the Intel RealSense camera.

To manually start the program, use the terminal in the root directory containing `overunder.py` and run: 

`python3 overunder.py`

In the MainApp class, this will instantiate the Intel RealSense pipeline that handles camera input in the Camera class. We take in the camera resolution for depth and color as 640x480, at 30 fps. 


Next, there are 4 more classes that are instantiated, the v5 object is a V5SerialComms class from V5Comm.py that handles serial communicaton to the V5 Brain. The v5Map object uses the MapPosition class to process the inferred objects from the 2D camera image into a projection onto 3D space to return the location of each object on the field. The v5Pos object is a v5GPS class from v5Position.py that handles serial communication to the GPS Sesnor. v5Web is the websocket server that the web dashboard communicates to, this object handles the get requests for the camera, depth, and object data, in addition to setting the offsets for the GPS and Intel RealSense camera for the Jetson.

**NOTE: THE V5 GPS OFFSET IN THE JETSON WILL NOT AUTOMATICALLY REFLECT TO YOUR BRAIN CODE. YOU HAVE TO MANUALLY ENSURE THE TWO OFFSETS ARE ALIGNED SO YOUR ROBOT POSITION IS THE SAME FOR THE JETSON AND V5 BRAIN.**

To run inference on the camera image to detect VEX OverUnder Triballs, we use the Model class in model.py. The Model class relies on two helper programs, common.py is provided by NVIDIA and has some common methods simplified to user with Tensor RT, and data_processsing.py handles much of the array resizing and processing. Our VEX OverUnder object model is based off of the YOLOv3 network, you can read more here: https://arxiv.org/pdf/1804.02767.pdf.

The *image_processing* method in model.py handles a weird quirk of the Intel RealSense D435 camera, under some lighting conditions, the colors of the triball will be read incorrectly, and the model will be unable to detect the blue or red triballs accurately. We reccommend tuning the hue, saturation, and value components of the image before running inference on it, this will color correct the RGB image from the RealSense camera to allow the object detection model to process images with greater color accuracy.

You can see below a sample of the rendering the model was trained off of to better understand the range of green, blue, and red colors it will look for in real life.  

![Over Under](Images/image.jpg)

**GPS and Intel RealSense Camera Offsets:**

We handle the offsets in V5Web.py The GPSOffset and CameraOffset classes intialize an empty JSON at first and process and read from an existing JSON file. They are saved to the directory that V5Web.py is in. This should be the source directory where all of your other source files are in (JetsonExample), but the exact path depends on where you cloned the GitHub repository into.

You can manually adjust your offsets without having to use the Web Dashboard by changing the values stored in the .JSON files directory. Be careful of units when editing here, but this method should change your respective offsets the next time you start the program using this method.

If you adjust using the Web Dashboard, V5Web.py already handles updating the V5MapPosition and V5Pos objects with the new offsets live, while the programs are still running. This means you can update the offsets through the dashboard and see the changes on the Jetson instantly. However, they will not reflect into your V5 Brain program, and that must still be updated manually. The reason this is possible, is because when overunder.py instantiates the v5Web object, v5Pos and v5Map must be passed in as parameters, thereby these objects can be called directly within the v5Web.py instance, updating the actual instance of the offset variables within the objects that calculate Robot position and detection positions.
