import React from "react";
import { Arrow, Image, Rect } from "react-konva";
import { images } from "../../util/images";
import { useAppSelector } from "../../state/hooks";
import useImage from "use-image";
import { config } from "../../util/config";
import { Direction } from "../../lib/types";

interface SidebarProps {
  fieldHeight: number;
  fieldWidth: number;
  direction: Direction;
}

/**
 * Displays a vertical or horizontal ruler to show the robot's location
 *
 * @param param0 Sidebar properties
 * @returns JSX.Element
 */
const Sidebar = ({ fieldHeight, fieldWidth, direction }: SidebarProps) => {
  const position = useAppSelector((state) => state.data.response.position);
  const theme = useAppSelector((state) => state.settings.theme);
  const scale = useAppSelector((state) => state.app.scale);
  const [ruler] = useImage(images.map.ruler);

  return (
    <>
      {direction === Direction.X ? (
        <>
          <Rect
            x={0 - fieldWidth / 2}
            y={
              0 -
              (fieldHeight / 2) * 0.75 -
              config.field.ruler.xySidebarOffset * (fieldHeight / 2)
            }
            width={fieldWidth}
            height={config.field.ruler.xySidebarSizeMultiplier * fieldHeight}
            fill={theme.componentBackground}
            cornerRadius={5}
          />
          <Image
            alt=""
            image={ruler}
            x={0 - fieldWidth / 2}
            y={
              0 -
              fieldHeight * 0.75 -
              config.field.ruler.xySidebarMarkersOffset * (fieldHeight / 2)
            }
            width={fieldWidth}
            height={fieldHeight * 0.75}
          />
          <Arrow
            x={position.x * scale}
            y={
              0 -
              (fieldHeight / 2) * 0.75 -
              config.field.ruler.xySidebarArrowOffset * (fieldHeight / 2)
            }
            points={[]}
            fill={theme.control}
            pointerWidth={20}
            pointerLength={20}
            rotation={90}
          />
        </>
      ) : (
        <>
          <Rect
            x={
              0 -
              (fieldWidth / 2) * 0.75 -
              config.field.ruler.xySidebarOffset * (fieldWidth / 2)
            }
            y={0 - fieldHeight / 2}
            width={config.field.ruler.xySidebarSizeMultiplier * fieldHeight}
            height={fieldHeight}
            fill={theme.componentBackground}
            cornerRadius={0}
          />
          <Image
            alt=""
            image={ruler}
            x={
              0 -
              fieldWidth * 0.75 -
              config.field.ruler.xySidebarMarkersOffset * (fieldWidth / 2)
            }
            y={fieldHeight * 0.75}
            width={fieldWidth * 0.75}
            height={fieldHeight * 0.75}
            rotation={270}
          />
          <Arrow
            x={
              0 -
              (fieldWidth / 2) * 0.75 -
              config.field.ruler.xySidebarArrowOffset * (fieldWidth / 2)
            }
            y={position.y * scale}
            points={[]}
            fill={theme.control}
            pointerWidth={20}
            pointerLength={20}
            rotation={0}
          />
        </>
      )}
    </>
  );
};

export default Sidebar;
