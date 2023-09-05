import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import { commands } from "../lib/commands";
import { useAppSelector } from "../state/hooks";
import ColorCamera from "../components/cameras/color-camera";

/**
 * Route that only displays the color camera
 *
 * @returns JSX.Element
 */
const ColorCameraView = () => {
  const dataService = useAppSelector((state) => state.data.dataService);

  useEffect(() => {
    if (dataService) {
      dataService.command = `${commands.gColor},${commands.gDetect},${commands.gStats}`;
    }
  }, [dataService]);

  return (
    <Grid item xs={12}>
      <ColorCamera />
    </Grid>
  );
};

export default ColorCameraView;
