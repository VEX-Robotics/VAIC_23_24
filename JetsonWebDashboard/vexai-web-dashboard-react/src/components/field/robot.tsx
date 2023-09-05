import React from "react";
import { Image } from "react-konva";
import { config } from "../../util/config";
import { useAppSelector } from "../../state/hooks";
import useImage from "use-image";

/**
 * Displays the robot on the field based on x,y coordinates, scale, and azimuth
 *
 * @returns JSX.Element
 */
const Robot = () => {
  const [robot] = useImage(config.field.robot.texture);
  const position = useAppSelector((state) => state.data.response.position);
  const scale = useAppSelector((state) => state.app.scale);

  return (
    <>
      {position ? (
        <Image
          alt=""
          image={robot}
          x={position.x * scale}
          y={position.y * scale * -1}
          rotation={position.azimuth}
          width={config.field.robot.width * scale}
          height={config.field.robot.length * scale}
          offsetX={(config.field.robot.width * scale) / 2}
          offsetY={(config.field.robot.length * scale) / 2}
        />
      ) : null}
    </>
  );
};

export default Robot;
