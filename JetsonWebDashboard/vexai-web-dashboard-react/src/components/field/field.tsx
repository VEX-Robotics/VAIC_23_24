import React, { useEffect, useRef } from "react";
import { Layer, Stage } from "react-konva";
import { images } from "../../util/images";
import useWindowDimensions from "../../lib/hooks";
import { Box } from "@mui/system";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import DetectionLayer from "./detection-layer";
import Robot from "./robot";
import Compass from "./compass";
import Fov from "./fov";
import Fog from "./fog";
import Track from "./track";
import { Direction } from "../../lib/types";
import { setScale } from "../../state/app-slice";
import { config } from "../../util/config";

/**
 * Displays a top down view of the game field with visuals for detected elements and moving robot
 *
 * @returns JSX.Element
 */
const Field = () => {
  const ref = useRef();
  const { height } = useWindowDimensions();
  const response = useAppSelector((state) => state.data.response);
  const showCompass = useAppSelector((state) => state.settings.showCompass);
  const showXYTracks = useAppSelector((state) => state.settings.showXYTracks);
  const showFog = useAppSelector((state) => state.settings.showFog);
  const dispatch = useAppDispatch();

  /**
   * Update the field scale every time the field image is resized
   */
  useEffect(() => {
    dispatch(
      setScale(
        (ref.current ? ref.current["clientWidth"] : 1) / config.field.dimension
      )
    );
  }, [ref, ref.current ? ref.current["clientWidth"] : 1]);

  return (
    <Box>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          alt="field-img"
          id="field-img"
          src={images.field}
          width="100%"
          height="100%"
          style={{
            maxHeight: height - 50,
            maxWidth: height - 50,
          }}
          ref={ref}
        />
        <Stage
          height={ref.current ? ref.current["clientHeight"] : 1}
          width={ref.current ? ref.current["clientWidth"] : 1}
          style={{
            position: "absolute",
          }}
          x={(ref.current ? ref.current["clientWidth"] : 1) / 2}
          y={(ref.current ? ref.current["clientHeight"] : 1) / 2}
        >
          {response && response.position ? (
            <>
              <Layer>
                <>
                  {/* fog and fov */}
                  {showFog === "true" ? (
                    <>
                      {/* fog */}
                      <Fog
                        fieldHeight={
                          ref.current ? ref.current["clientHeight"] : 1
                        }
                        fieldWidth={
                          ref.current ? ref.current["clientWidth"] : 1
                        }
                      />
                      {/* fov */}
                      <Fov
                        fieldHeight={
                          ref.current ? ref.current["clientHeight"] : 1
                        }
                      />
                    </>
                  ) : null}

                  {/* xy tracks */}
                  {showXYTracks === "true" ? (
                    <>
                      {/* y coordinates */}
                      <Track
                        fieldHeight={
                          ref.current ? ref.current["clientHeight"] : 1
                        }
                        fieldWidth={
                          ref.current ? ref.current["clientWidth"] : 1
                        }
                        direction={Direction.Y}
                      />
                      {/* x coordinates */}
                      <Track
                        fieldHeight={
                          ref.current ? ref.current["clientHeight"] : 1
                        }
                        fieldWidth={
                          ref.current ? ref.current["clientWidth"] : 1
                        }
                        direction={Direction.X}
                      />
                    </>
                  ) : null}

                  {/* compass */}
                  {showCompass === "true" ? (
                    <Compass
                      fieldHeight={
                        ref.current ? ref.current["clientHeight"] : 1
                      }
                      fieldWidth={ref.current ? ref.current["clientWidth"] : 1}
                    />
                  ) : null}

                  {/* robot */}
                  <Robot />
                </>
              </Layer>

              {/* Detections */}
              <DetectionLayer
                fieldWidth={ref.current ? ref.current["clientWidth"] : 1}
                fieldHeight={ref.current ? ref.current["clientHeight"] : 1}
              />
            </>
          ) : null}
        </Stage>
      </div>
    </Box>
  );
};

export default Field;
