import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import Field from "../components/field/field";
import { commands } from "../lib/commands";
import { useAppSelector } from "../state/hooks";

/**
 * Route that displays the field only
 *
 * @returns JSX.Element
 */
const FieldView = () => {
  const dataService = useAppSelector((state) => state.data.dataService);

  useEffect(() => {
    if (dataService) {
      dataService.command = `${commands.gPos},${commands.gDetect},${commands.gStats}`;
    }
  }, [dataService]);

  return (
    <Grid item xs={12}>
      <Field />
    </Grid>
  );
};

export default FieldView;
