import React from "react";
import { useAppSelector } from "../../state/hooks";
import Camera from "./camera";

/**
 * Specific camera for color image data
 *
 * @returns JSX.Element
 */
const ColorCamera = () => {
  const response = useAppSelector((state) => state.data.response);

  return (
    <Camera
      img={response && response.color ? response.color.image : null}
      detections={response ? response.detections : null}
    />
  );
};

export default ColorCamera;
