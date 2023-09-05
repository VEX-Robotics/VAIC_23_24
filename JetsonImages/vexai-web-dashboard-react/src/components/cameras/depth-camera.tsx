import React from "react";
import { useAppSelector } from "../../state/hooks";
import Camera from "./camera";

/**
 * Specific camera for depth image data
 *
 * @returns JSX.element
 */
const DepthCamera = () => {
  const response = useAppSelector((state) => state.data.response);

  return (
    <Camera
      img={response && response.depth ? response.depth.image : null}
      detections={response ? response.detections : null}
    />
  );
};

export default DepthCamera;
