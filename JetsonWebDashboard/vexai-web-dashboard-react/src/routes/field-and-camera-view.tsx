import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import Field from "../components/field/field";
import { useAppSelector } from "../state/hooks";
import { commands } from "../lib/commands";
import ColorCamera from "../components/cameras/color-camera";

/**
 * Route that displays the field and color camera
 *
 * @returns JSX.Element
 */
const FieldAndCameraView = () => {
  const dataService = useAppSelector((state) => state.data.dataService);

  useEffect(() => {
    if (dataService) {
      dataService.command = `${commands.gColor},${commands.gPos},${commands.gDetect},${commands.gStats}`;
    }
  }, [dataService]);

  return (
    <>
      <Grid item xs={6} justifyContent="flex-end">
        <Field />
      </Grid>
      <Grid item xs={6} justifyContent="flex-start">
        <ColorCamera />
      </Grid>
    </>
  );
};

export default FieldAndCameraView;
