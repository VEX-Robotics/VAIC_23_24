import React from "react";
import { Rect } from "react-konva";
import { config } from "../../util/config";

interface FogProps {
  fieldHeight: number;
  fieldWidth: number;
}

/**
 * Applies a dark mask to the field for area outside the robot's field of view
 *
 * @param param0 Fog properties
 * @returns JSX.Element
 */
const Fog = ({ fieldHeight, fieldWidth }: FogProps) => {
  return (
    <Rect
      x={0 - fieldWidth / 2}
      y={0 - fieldHeight / 2}
      width={fieldWidth}
      height={fieldHeight}
      fill="black"
      opacity={config.field.fog.opacity}
    />
  );
};

export default Fog;
