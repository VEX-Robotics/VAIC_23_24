import React from "react";
import { CircularProgress, Typography } from "@mui/material";
import { config } from "../../util/config";

/**
 * Displays a progress wheel and text when not connected to the websocket server
 *
 * @returns JSX.Element
 */
const ConnectingToCameraProgress = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        paddingTop: 50,
        marginLeft: 50,
      }}
    >
      <CircularProgress
        sx={{
          color: config.colors.red,
          marginRight: 3,
        }}
      />
      <Typography variant="h4">WAITING FOR CAMERA</Typography>
    </div>
  );
};

export default ConnectingToCameraProgress;
