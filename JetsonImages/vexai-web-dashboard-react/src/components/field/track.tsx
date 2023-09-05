import React from "react";
import { Line } from "react-konva";
import { useAppSelector } from "../../state/hooks";
import { Direction } from "../../lib/types";

interface TrackProps {
  fieldHeight: number;
  fieldWidth: number;
  direction: Direction;
}

/**
 * Displays vertical and horizontal bars on the field to display the robot's position
 *
 * @param param0 Track properties
 * @returns JSX.Element
 */
const Track = ({ fieldHeight, fieldWidth, direction }: TrackProps) => {
  const position = useAppSelector((state) => state.data.response.position);
  const theme = useAppSelector((state) => state.settings.theme);
  const scale = useAppSelector((state) => state.app.scale);

  return (
    <>
      {direction === Direction.X ? (
        <Line
          points={[
            position.x * scale,
            0 - fieldHeight / 2,
            position.x * scale,
            fieldHeight / 2,
          ]}
          stroke={theme.control}
          strokeWidth={3}
          opacity={1}
        />
      ) : (
        <Line
          points={[
            0 - fieldWidth / 2,
            position.y * scale * -1,
            fieldWidth / 2,
            position.y * scale * -1,
          ]}
          stroke={theme.control}
          strokeWidth={3}
          opacity={1}
        />
      )}
    </>
  );
};

export default Track;
