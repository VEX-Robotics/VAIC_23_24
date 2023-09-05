import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import { commands } from "../lib/commands";
import { useAppSelector } from "../state/hooks";
import DepthCamera from "../components/cameras/depth-camera";

/**
 * Route that only displays the depth camera
 *
 * @returns JSX.Element
 */
const DepthCameraView = () => {
  const dataService = useAppSelector((state) => state.data.dataService);

  useEffect(() => {
    if (dataService) {
      dataService.command = `${commands.gDepth},${commands.gDetect},${commands.gStats}`;
    }
  }, [dataService]);

  return (
    <Grid item xs={12}>
      <DepthCamera />
    </Grid>
  );
};

export default DepthCameraView;
