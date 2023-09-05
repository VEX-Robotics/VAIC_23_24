import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Modal,
  Typography,
  IconButton,
  Toolbar,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  TextField,
  styled,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { closeSettings } from "../../state/app-slice";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import {
  setShowCompass,
  setShowXYTracks,
  setShowFog,
  setSocketIp,
  setSocketPort,
} from "../../state/settings-slice";
import { Offset } from "../../lib/data-response";

const StyledTextField = styled(TextField)({
  "& label": {
    color: "#E0E3E7",
  },
  "& label.Mui-focused": {
    color: "#A0AAB4",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#B2BAC2",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#E0E3E7",
    },
    "&:hover fieldset": {
      borderColor: "#B2BAC2",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#6F7E8C",
    },
  },
});

/**
 * Modal for viewing and changing application settings
 *
 * @returns JSX.Element
 */
const SettingsModal = () => {
  const open = useAppSelector((state) => state.app.settingsOpen);
  const showCompass = useAppSelector((state) => state.settings.showCompass);
  const showXYTracks = useAppSelector((state) => state.settings.showXYTracks);
  const showFog = useAppSelector((state) => state.settings.showFog);
  const theme = useAppSelector((state) => state.settings.theme);
  const cameraOffset = useAppSelector((state) => state.settings.cameraOffset);
  const gpsOffset = useAppSelector((state) => state.settings.gpsOffset);
  const dataService = useAppSelector((state) => state.data.dataService);
  const socketIp = useAppSelector((state) => state.settings.socketIp);
  const socketPort = useAppSelector((state) => state.settings.socketPort);
  const socketConnected = useAppSelector(
    (state) => state.data.dataServiceConnected
  );
  const [tempCameraOffset, setTempCameraOffset] = useState<Offset>({
    x: 0.0,
    y: 0.0,
    z: 0.0,
    unit: "meters",
    headingOffset: 0.0,
    elevationOffset: 0.0,
  });
  const [tempGpsOffset, setTempGpsOffset] = useState<Offset>({
    x: 0.0,
    y: 0.0,
    z: 0.0,
    unit: "meters",
    headingOffset: 0.0,
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (cameraOffset !== null) {
      setTempCameraOffset(cameraOffset);
    }
  }, [cameraOffset]);

  useEffect(() => {
    if (gpsOffset !== null) {
      setTempGpsOffset(gpsOffset);
    }
  }, [gpsOffset]);

  const resetOffsets = () => {
    setTempCameraOffset(cameraOffset);
    setTempGpsOffset(gpsOffset);
  };

  const style = {
    position: "absolute",
    width: "50%",
    height: "60%",
    top: "25%",
    left: "25%",
    bgcolor: theme.componentBackground,
    borderWidth: "5px",
    borderColor: theme.componentBackground,
    borderStyle: "solid",
    borderRadius: "15px",
    paddingLeft: 3,
    maxHeight: "650px",
    maxWidth: "870px",
    minWidth: "500px",
    minHeight: "600px",
    overflow: "auto",
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        resetOffsets();
        dispatch(closeSettings());
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ flexGrow: 1 }}>
              <Toolbar>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.font,
                    width: "100%",
                    fontWeight: "600",
                    paddingLeft: 5,
                  }}
                  align="center"
                >
                  SETTINGS
                </Typography>
                <IconButton
                  size="large"
                  onClick={() => {
                    dispatch(closeSettings());
                    resetOffsets();
                  }}
                  centerRipple
                >
                  <CloseIcon
                    sx={{
                      color: theme.font,
                      "&:hover": {
                        color: theme.control,
                      },
                    }}
                  />
                </IconButton>
              </Toolbar>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showCompass === "true" ? true : false}
                    onChange={(event) =>
                      dispatch(
                        setShowCompass(event.target.checked ? "true" : "false")
                      )
                    }
                    sx={{
                      color: theme.control,
                      "&.Mui-checked": {
                        color: theme.control,
                      },
                    }}
                  />
                }
                label="Show Compass"
                style={{ color: theme.font }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showXYTracks === "true" ? true : false}
                    onChange={(event) =>
                      dispatch(
                        setShowXYTracks(event.target.checked ? "true" : "false")
                      )
                    }
                    sx={{
                      color: theme.control,
                      "&.Mui-checked": {
                        color: theme.control,
                      },
                    }}
                  />
                }
                label="Show X Y Position Tracks"
                style={{ color: theme.font }}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showFog === "true" ? true : false}
                    onChange={(event) =>
                      dispatch(
                        setShowFog(event.target.checked ? "true" : "false")
                      )
                    }
                    sx={{
                      color: theme.control,
                      "&.Mui-checked": {
                        color: theme.control,
                      },
                    }}
                  />
                }
                label="Show Field of View"
                style={{ color: theme.font }}
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <Typography
              id="demo-radio-buttons-group-label"
              sx={{ color: theme.font, marginTop: 2 }}
            >
              Camera Offset
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs>
                <StyledTextField
                  onChange={(e) => {
                    setTempCameraOffset({
                      x: parseFloat(e.target.value),
                      y: tempCameraOffset.y,
                      z: tempCameraOffset.z,
                      unit: "meters",
                      headingOffset: tempCameraOffset.headingOffset,
                      elevationOffset: tempCameraOffset.elevationOffset,
                    });
                  }}
                  id="camera-offset-x"
                  label="X (meters)"
                  variant="outlined"
                  value={tempCameraOffset.x}
                  InputProps={{
                    type: "number",
                  }}
                  sx={{ marginTop: 1, input: { color: "#E0E3E7" } }}
                />
              </Grid>
              <Grid item xs>
                <StyledTextField
                  onChange={(e) => {
                    setTempCameraOffset({
                      x: tempCameraOffset.x,
                      y: parseFloat(e.target.value),
                      z: tempCameraOffset.z,
                      unit: "meters",
                      headingOffset: tempCameraOffset.headingOffset,
                      elevationOffset: tempCameraOffset.elevationOffset,
                    });
                  }}
                  id="camera-offset-y"
                  label="Y (meters)"
                  variant="outlined"
                  value={tempCameraOffset.y}
                  InputProps={{
                    type: "number",
                  }}
                  sx={{ marginTop: 1, input: { color: "#E0E3E7" } }}
                />
              </Grid>
              <Grid item xs>
                <StyledTextField
                  onChange={(e) => {
                    setTempCameraOffset({
                      x: tempCameraOffset.x,
                      y: tempCameraOffset.y,
                      z: parseFloat(e.target.value),
                      unit: "meters",
                      headingOffset: tempCameraOffset.headingOffset,
                      elevationOffset: tempCameraOffset.elevationOffset,
                    });
                  }}
                  id="camera-offset-z"
                  label="Z (meters)"
                  variant="outlined"
                  value={tempCameraOffset.z}
                  InputProps={{
                    type: "number",
                  }}
                  sx={{ marginTop: 1, input: { color: "#E0E3E7" } }}
                />
              </Grid>
              <Grid item xs>
                <StyledTextField
                  onChange={(e) => {
                    setTempCameraOffset({
                      x: tempCameraOffset.x,
                      y: tempCameraOffset.y,
                      z: tempCameraOffset.z,
                      unit: "meters",
                      headingOffset: parseFloat(e.target.value),
                      elevationOffset: tempCameraOffset.elevationOffset,
                    });
                  }}
                  id="camera-offset-heading"
                  label="Heading (degrees)"
                  variant="outlined"
                  value={tempCameraOffset.headingOffset}
                  InputProps={{
                    type: "number",
                  }}
                  sx={{ marginTop: 1, input: { color: "#E0E3E7" } }}
                />
              </Grid>
              <Grid item xs>
                <StyledTextField
                  onChange={(e) => {
                    setTempCameraOffset({
                      x: tempCameraOffset.x,
                      y: tempCameraOffset.y,
                      z: tempCameraOffset.z,
                      unit: "meters",
                      headingOffset: tempCameraOffset.headingOffset,
                      elevationOffset: parseFloat(e.target.value),
                    });
                  }}
                  id="camera-offset-elevation"
                  label="Elevation (degrees)"
                  variant="outlined"
                  value={tempCameraOffset.elevationOffset}
                  InputProps={{
                    type: "number",
                  }}
                  sx={{ marginTop: 1, input: { color: "#E0E3E7" } }}
                />
              </Grid>
              <Grid item xs>
                <Button
                  onClick={() => {
                    dataService.setCameraOffset(
                      `${tempCameraOffset.x.toString()},${tempCameraOffset.y.toString()},${tempCameraOffset.z.toString()},meters,${tempCameraOffset.headingOffset.toString()},${tempCameraOffset.elevationOffset.toString()}`
                    );
                    dataService.getCameraOffset();
                  }}
                  variant="contained"
                  sx={{
                    marginTop: 2,
                    color: theme.font,
                    backgroundColor: theme.control,
                    "&:hover": {
                      backgroundColor: theme.controlHover,
                    },
                  }}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
            <Typography
              id="demo-radio-buttons-group-label"
              sx={{ color: theme.font, marginTop: 2 }}
            >
              GPS Offset
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs>
                <StyledTextField
                  onChange={(e) => {
                    setTempGpsOffset({
                      x: parseFloat(e.target.value),
                      y: tempGpsOffset.y,
                      z: tempGpsOffset.z,
                      unit: "meters",
                      headingOffset: tempGpsOffset.headingOffset,
                    });
                  }}
                  id="gps-offset-x"
                  label="X (meters)"
                  variant="outlined"
                  value={tempGpsOffset.x}
                  InputProps={{
                    type: "number",
                  }}
                  sx={{ marginTop: 1, input: { color: "#E0E3E7" } }}
                />
              </Grid>
              <Grid item xs>
                <StyledTextField
                  onChange={(e) => {
                    setTempGpsOffset({
                      x: tempGpsOffset.x,
                      y: parseFloat(e.target.value),
                      z: tempGpsOffset.z,
                      unit: "meters",
                      headingOffset: tempGpsOffset.headingOffset,
                    });
                  }}
                  id="gps-offset-y"
                  label="Y (meters)"
                  variant="outlined"
                  value={tempGpsOffset.y}
                  InputProps={{
                    type: "number",
                  }}
                  sx={{ marginTop: 1, input: { color: "#E0E3E7" } }}
                />
              </Grid>
              <Grid item xs>
                <StyledTextField
                  onChange={(e) => {
                    setTempGpsOffset({
                      x: tempGpsOffset.x,
                      y: tempGpsOffset.y,
                      z: parseFloat(e.target.value),
                      unit: "meters",
                      headingOffset: tempGpsOffset.headingOffset,
                    });
                  }}
                  id="gps-offset-z"
                  label="Z (meters)"
                  variant="outlined"
                  value={tempGpsOffset.z}
                  InputProps={{
                    type: "number",
                  }}
                  sx={{ marginTop: 1, input: { color: "#E0E3E7" } }}
                />
              </Grid>
              <Grid item xs>
                <StyledTextField
                  onChange={(e) => {
                    setTempGpsOffset({
                      x: tempGpsOffset.x,
                      y: tempGpsOffset.y,
                      z: tempGpsOffset.z,
                      unit: "meters",
                      headingOffset: parseFloat(e.target.value),
                    });
                  }}
                  id="gps-offset-z"
                  label="Heading (degrees)"
                  variant="outlined"
                  value={tempGpsOffset.headingOffset}
                  InputProps={{
                    type: "number",
                  }}
                  sx={{ marginTop: 1, input: { color: "#E0E3E7" } }}
                />
              </Grid>
              <Grid item xs>
                <Button
                  onClick={() => {
                    dataService.setGpsOffset(
                      `${tempGpsOffset.x.toString()},${tempGpsOffset.y.toString()},${tempGpsOffset.z.toString()},meters,${tempGpsOffset.headingOffset.toString()}`
                    );
                    dataService.getGpsOffset();
                  }}
                  variant="contained"
                  sx={{
                    marginTop: 2,
                    color: theme.font,
                    backgroundColor: theme.control,
                    "&:hover": {
                      backgroundColor: theme.controlHover,
                    },
                  }}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{ marginTop: 3 }}>
            <Grid container spacing={1}>
              <Grid item>
                <StyledTextField
                  onChange={(e) => {
                    dispatch(setSocketIp(e.target.value));
                  }}
                  error={!socketConnected}
                  id="socket-ip"
                  label="Socket IP"
                  variant="outlined"
                  value={socketIp ? socketIp : ""}
                  sx={{ marginTop: 1, input: { color: "#E0E3E7" } }}
                />
              </Grid>
              <Grid item>
                <StyledTextField
                  onChange={(e) => {
                    dispatch(setSocketPort(e.target.value));
                  }}
                  error={!socketConnected}
                  id="socket-port"
                  label="Socket Port"
                  variant="outlined"
                  value={socketPort ? socketPort : ""}
                  sx={{ marginTop: 1, input: { color: "#E0E3E7" } }}
                />
              </Grid>
              <Grid item xs>
                <Button
                  onClick={() => {
                    dataService.ip = socketIp;
                    dataService.port = socketPort;
                    dataService.restart();
                  }}
                  variant="contained"
                  sx={{
                    marginTop: 2,
                    color: theme.font,
                    backgroundColor: theme.control,
                    "&:hover": {
                      backgroundColor: theme.controlHover,
                    },
                  }}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default SettingsModal;
