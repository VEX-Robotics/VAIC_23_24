import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import ConnectingToCameraProgress from "./connecting-to-camera-progress";
import { Detection, Image } from "../../lib/data-response";
import useWindowDimensions from "../../lib/hooks";
import { Layer, Rect, Stage, Text } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import { config } from "../../util/config";

interface CameraProps {
  img: Image;
  detections: Detection[];
}

/**
 * Displays an image and draws detection boxes around elements
 *
 * @param param0 Camera properties
 * @returns JSX.Element
 */
const Camera = ({ img, detections }: CameraProps) => {
  const ref = useRef();
  const { height } = useWindowDimensions();
  const [sorted, setSorted] = useState<Detection[]>(null);

  /**
   * Sort the list of detections based on detection depth to get proper on screen layering on top of the displayed image
   */
  useEffect(() => {
    if (detections) {
      setSorted(detections.slice(0).sort((a, b) => b.depth - a.depth));
    }
  }, [detections]);

  return (
    <Box>
      {img ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* display the image */}
          <img
            alt=""
            src={`data:image/jpeg;base64,${img.data}`}
            height="100%"
            width="100%"
            style={{
              maxHeight: height - 50,
              maxWidth: height * 1.35,
            }}
            ref={ref}
          />

          {/* add the canvas stage for element detections on top of the image  */}
          <Stage
            height={ref.current ? ref.current["clientHeight"] : 1} // using the image dimensions
            width={ref.current ? ref.current["clientWidth"] : 1} // using the image dimensions
            style={{ position: "absolute" }}
          >
            {sorted ? (
              <>
                {sorted.map((detection) => {
                  const widthRatio =
                    img.width / (ref.current ? ref.current["clientWidth"] : 1);
                  const heightRatio =
                    img.height /
                    (ref.current ? ref.current["clientHeight"] : 1);

                  const bboxWidth = detection.screenLocation.width / widthRatio;
                  const bboxHeight =
                    detection.screenLocation.height / heightRatio;

                  const bboxX =
                    (detection.screenLocation.x *
                      (ref.current ? ref.current["clientWidth"] : 1)) /
                    config.SCALE_X;
                  const bboxY =
                    (detection.screenLocation.y *
                      (ref.current ? ref.current["clientHeight"] : 1)) /
                    config.SCALE_Y;

                  const classBoxWidth = bboxWidth;
                  const classBoxHeight = bboxHeight * 0.23;
                  const classBoxY = bboxY - classBoxHeight * 1.04;

                  return (
                    <>
                      {detection.depth !== -1 ? ( // depth is -1 if received json detection had a depth of NaN originally
                        <Layer key={uuidv4()}>
                          {/* class box */}
                          <Rect
                            x={bboxX}
                            y={classBoxY}
                            height={classBoxHeight}
                            width={classBoxWidth}
                            fill="rgba(95, 95, 95, 0.75)"
                            stroke={config.colors.black}
                            strokeWidth={2}
                            cornerRadius={0}
                          />
                          {/* class name */}
                          <Text
                            fill={config.elements.label.textColors.white}
                            text={`${
                              config.elements.label.text[detection.class]
                            }`}
                            x={bboxX}
                            y={bboxY - classBoxHeight}
                            fontStyle="bold"
                            align="center"
                            verticalAlign="middle"
                            width={classBoxWidth}
                            height={classBoxHeight}
                            fontSize={classBoxHeight * 0.6}
                          />
                          {/* bounding box */}
                          <Rect
                            x={bboxX}
                            y={bboxY}
                            height={bboxHeight > 0 ? bboxHeight : 1}
                            width={bboxWidth > 0 ? bboxWidth : 1}
                            fill={
                              config.elements.backgroundColors[detection.class]
                            }
                            stroke={
                              config.elements.borderColors[detection.class]
                            }
                            strokeWidth={2}
                            cornerRadius={0}
                          />
                          {/* coordinates */}
                          <Text
                            fill={config.elements.label.textColors.white}
                            text={`X ${detection.mapLocation.x[0]
                              .toFixed(2)
                              .toString()}m\nY ${detection.mapLocation.y[0]
                              .toFixed(2)
                              .toString()}m`}
                            align="left"
                            verticalAlign="top"
                            x={bboxX}
                            y={bboxY}
                            padding={8}
                            width={bboxWidth}
                            height={bboxHeight}
                            fontSize={bboxHeight * 0.15}
                          />
                          {/* depth */}
                          <Text
                            fill={config.elements.label.textColors.white}
                            text={`Distance\n${detection.depth
                              .toFixed(2)
                              .toString()}m`}
                            align="right"
                            verticalAlign="bottom"
                            x={bboxX}
                            y={bboxY}
                            padding={8}
                            width={bboxWidth}
                            height={bboxHeight}
                            fontSize={bboxHeight * 0.15}
                          />
                        </Layer>
                      ) : null}
                    </>
                  );
                })}
              </>
            ) : null}
          </Stage>
        </div>
      ) : (
        <ConnectingToCameraProgress />
      )}
    </Box>
  );
};

export default Camera;
