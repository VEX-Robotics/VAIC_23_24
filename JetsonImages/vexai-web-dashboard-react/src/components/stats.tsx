import React, { useEffect, useState } from "react";
import { List, Tooltip, ListItem, Typography } from "@mui/material";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import GpsOffIcon from "@mui/icons-material/GpsOff";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import AutofpsSelectIcon from "@mui/icons-material/AutofpsSelect";
import VideocamIcon from "@mui/icons-material/Videocam";
import TimerIcon from "@mui/icons-material/Timer";
import { useAppSelector } from "../state/hooks";

/**
 * Displays application statistics received from the websocket server
 *
 * @returns JSX.Element
 */
const Stats = () => {
  const [cpuTempColor, setCpuTempColor] = useState<string>("green");
  const [runTime, setRunTime] = useState<string>("00:00:00");
  const response = useAppSelector((state) => state.data.response);

  useEffect(() => {
    if (response && response.stats) {
      const h = Math.floor(response.stats.runTime / 3600);
      const m = Math.floor(response.stats.runTime / 60) - h * 60;
      const s = Math.floor(response.stats.runTime % 60);
      setRunTime(
        `${h < 10 ? "0" : ""}${h}:${m < 10 ? "0" : ""}${m}:${
          s < 10 ? "0" : ""
        }${s}`
      );
      if (response.stats.cpuTempurature < 40) {
        setCpuTempColor("green");
      } else if (
        response.stats.cpuTempurature >= 40 &&
        response.stats.cpuTempurature < 50
      ) {
        setCpuTempColor("yellow");
      } else if (
        response.stats.cpuTempurature >= 50 &&
        response.stats.cpuTempurature < 60
      ) {
        setCpuTempColor("orange");
      } else {
        setCpuTempColor("red");
      }
    } else {
      setCpuTempColor("white");
    }
  }, [response]);

  return (
    <List sx={{ marginTop: "auto", paddingLeft: 0.3 }}>
      {response && response.stats ? (
        <>
          <Tooltip
            title={
              response.stats.gpsConnected ? "GPS Connected" : "GPS Disconnected"
            }
            placement="right"
          >
            <ListItem>
              {response.stats.gpsConnected ? (
                <GpsFixedIcon sx={{ color: "green", paddingLeft: "3.7px" }} />
              ) : (
                <GpsOffIcon sx={{ color: "red", paddingLeft: "3.7px" }} />
              )}
            </ListItem>
          </Tooltip>
          <Tooltip title="CPU Temp" placement="right">
            <ListItem disablePadding sx={{ paddingBottom: "7px" }}>
              <DeviceThermostatIcon
                sx={{ color: cpuTempColor }}
                fontSize="small"
              />
              <Typography sx={{ color: cpuTempColor }}>
                {`${response.stats.cpuTempurature.toFixed(
                  0
                )}${String.fromCharCode(176)}C`}
              </Typography>
            </ListItem>
          </Tooltip>
          <Tooltip title="FPS" placement="right">
            <ListItem disablePadding sx={{ paddingBottom: "7px" }}>
              <VideocamIcon sx={{ color: "white" }} fontSize="small" />
              <Typography variant="caption" sx={{ color: "white" }}>
                {`${response.stats.fps.toFixed(0)} fps`}
              </Typography>
            </ListItem>
          </Tooltip>
          <Tooltip title="Infer Time" placement="right">
            <ListItem disablePadding sx={{ paddingBottom: "7px" }}>
              <AutofpsSelectIcon sx={{ color: "white" }} fontSize="small" />
              <Typography variant="caption" sx={{ color: "white" }}>{`${(
                response.stats.inferTime * 100
              ).toFixed(1)}ms`}</Typography>
            </ListItem>
          </Tooltip>
          <Tooltip title="Run Time" placement="right">
            <ListItem disablePadding sx={{ paddingBottom: "7px" }}>
              <TimerIcon sx={{ color: "white" }} fontSize="small" />
              <Typography variant="caption" sx={{ color: "white" }}>
                {runTime}
              </Typography>
            </ListItem>
          </Tooltip>
        </>
      ) : (
        <>
          <Tooltip title={"GPS Disconnected"} placement="right">
            <ListItem>
              <GpsOffIcon sx={{ color: "red", paddingLeft: "3px" }} />
            </ListItem>
          </Tooltip>
          <Tooltip title="CPU Temp" placement="right">
            <ListItem disablePadding sx={{ paddingBottom: "7px" }}>
              <DeviceThermostatIcon sx={{ color: "white" }} />
              <Typography sx={{ color: "white" }}>{`--`}</Typography>
            </ListItem>
          </Tooltip>
          <Tooltip title="FPS" placement="right">
            <ListItem disablePadding sx={{ paddingBottom: "7px" }}>
              <AutofpsSelectIcon sx={{ color: "white" }} />
              <Typography variant="caption" sx={{ color: "white" }}>
                {`--`}
              </Typography>
            </ListItem>
          </Tooltip>
          <Tooltip title="Run Time" placement="right">
            <ListItem disablePadding>
              <TimerIcon sx={{ color: "white" }} />
              <Typography
                variant="caption"
                sx={{ color: "white" }}
              >{`--`}</Typography>
            </ListItem>
          </Tooltip>
        </>
      )}
    </List>
  );
};

export default Stats;
