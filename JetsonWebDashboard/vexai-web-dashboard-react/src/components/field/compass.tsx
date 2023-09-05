import React from "react";
import { Image } from "react-konva";
import { config } from "../../util/config";
import { useAppSelector } from "../../state/hooks";
import useImage from "use-image";

interface CompassProps {
  fieldHeight: number;
  fieldWidth: number;
}

/**
 * Compass for displaying robot azimuth
 *
 * @param param0 Compass properties
 * @returns JSX.Element
 */
const Compass = ({ fieldHeight, fieldWidth }: CompassProps) => {
  const [compass] = useImage(config.field.compass.texture);
  const position = useAppSelector((state) => state.data.response.position);
  const scale = useAppSelector((state) => state.app.scale);

  return (
    <Image
      alt=""
      image={compass}
      x={position.x * scale}
      y={position.y * scale * -1}
      width={config.field.compass.scale * fieldWidth}
      height={config.field.compass.scale * fieldHeight}
      offsetX={(config.field.compass.scale * fieldWidth) / 2}
      offsetY={(config.field.compass.scale * fieldHeight) / 2}
    />
  );
};

export default Compass;
