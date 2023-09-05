import React, { FC, useState } from "react";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MapIcon from "@mui/icons-material/Map";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import FieldView from "../../routes/field-view";
import ColorCameraView from "../../routes/color-camera-view";
import DepthCameraView from "../../routes/depth-camera-view";
import { Image } from "mui-image";
import { images } from "../../util/images";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { openSettings } from "../../state/app-slice";
import SettingsModal from "../modals/settings-modal";
import SettingsIcon from "@mui/icons-material/Settings";
import { Grid, Toolbar, Tooltip } from "@mui/material";
import Typography from "@mui/material/Typography";
import { config } from "../../util/config";
import Drawer from "@mui/material/Drawer";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SwitchVideoIcon from "@mui/icons-material/SwitchVideo";
import VideoCameraBackIcon from "@mui/icons-material/VideoCameraBack";
import SatelliteIcon from "@mui/icons-material/Satellite";
import Stats from "../stats";
import FieldAndCameraView from "../../routes/field-and-camera-view";

/**
 * Opened drawer width
 */
const drawerWidth = 230;

/**
 * Style values for the open state of the custom drawer
 *
 * ! @param theme Mui Theme object has not been created for this app
 * @returns CSSObject
 */
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

/**
 * Style values for the closed state of the custom drawer
 *
 * ! @param theme Mui Theme object has not been created for this app
 * @returns CSSObject
 */
const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(8)} + 2px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 2px)`,
  },
});

/**
 * Customized sliding drawer
 */
const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

/**
 * Left side vertical navigation bar that can be expanded or minimized using customized sliding drawer
 *
 * @returns JSX.Element
 */
const Navigator: FC = () => {
  const [open, setOpen] = useState(false);
  const dataServiceConnected = useAppSelector(
    (state) => state.data.dataServiceConnected
  );
  const settingsOpen = useAppSelector((state) => state.app.settingsOpen);
  const theme = useAppSelector((state) => state.settings.theme);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", flexGrow: 1 }}>
      <StyledDrawer
        PaperProps={{
          sx: {
            backgroundColor: theme.componentBackground,
          },
        }}
        variant="permanent"
        open={open}
      >
        <Image
          alt=""
          src={images.logos.vexAILogoWhite}
          height={55}
          style={{ marginTop: 35 }}
          fit="scale-down"
        />
        <div style={{ height: 40 }} />
        <List component="nav">
          <ListItem disablePadding>
            <Tooltip
              title="Field And Camera"
              disableHoverListener={open}
              placement="right"
            >
              <ListItemButton
                sx={{
                  "&.Mui-selected": {
                    bgcolor: theme.control,
                  },
                  "&.Mui-selected.hover": {
                    bgcolor: theme.controlHover,
                  },
                  "&:hover": {
                    bgcolor: theme.controlHover,
                  },
                }}
                selected={location.pathname === "/"}
                onClick={() => {
                  navigate("/");
                }}
              >
                <ListItemIcon>
                  <SatelliteIcon
                    sx={{
                      color: theme.font,
                      paddingLeft: "9px",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    paddingLeft: 1,
                    color: theme.font,
                  }}
                >
                  Field And Camera
                </ListItemText>
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem disablePadding>
            <Tooltip
              title="Color Camera"
              disableHoverListener={open}
              placement="right"
            >
              <ListItemButton
                sx={{
                  "&.Mui-selected": {
                    bgcolor: theme.control,
                  },
                  "&.Mui-selected.hover": {
                    bgcolor: theme.controlHover,
                  },
                  "&:hover": {
                    bgcolor: theme.controlHover,
                  },
                }}
                selected={location.pathname === "/colorCamera"}
                onClick={() => {
                  navigate("/colorCamera");
                }}
              >
                <ListItemIcon>
                  <VideoCameraBackIcon
                    sx={{
                      color: theme.font,
                      paddingLeft: "9px",
                    }}
                  />
                </ListItemIcon>
                <ListItemText sx={{ color: theme.font, paddingLeft: 1 }}>
                  Color Camera
                </ListItemText>
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem disablePadding>
            <Tooltip
              title="Depth Camera"
              disableHoverListener={open}
              placement="right"
            >
              <ListItemButton
                sx={{
                  "&.Mui-selected": {
                    bgcolor: theme.control,
                  },
                  "&.Mui-selected.hover": {
                    bgcolor: theme.controlHover,
                  },
                  "&:hover": {
                    bgcolor: theme.controlHover,
                  },
                }}
                selected={location.pathname === "/depthCamera"}
                onClick={() => {
                  navigate("/depthCamera");
                }}
              >
                <ListItemIcon>
                  <SwitchVideoIcon
                    sx={{
                      color: theme.font,
                      paddingLeft: "9px",
                    }}
                  />
                </ListItemIcon>
                <ListItemText sx={{ paddingLeft: 1, color: theme.font }}>
                  Depth Camera
                </ListItemText>
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem disablePadding sx={{ marginTop: "auto" }}>
            <Tooltip
              title="Field"
              disableHoverListener={open}
              placement="right"
            >
              <ListItemButton
                sx={{
                  "&.Mui-selected": {
                    bgcolor: theme.control,
                  },
                  "&.Mui-selected.hover": {
                    bgcolor: theme.controlHover,
                  },
                  "&:hover": {
                    bgcolor: theme.controlHover,
                  },
                }}
                selected={location.pathname === "/field"}
                onClick={() => {
                  navigate("/field");
                }}
              >
                <ListItemIcon>
                  <MapIcon
                    sx={{
                      color: theme.font,
                      paddingLeft: "9px",
                    }}
                  />
                </ListItemIcon>
                <ListItemText sx={{ paddingLeft: 1, color: theme.font }}>
                  Field
                </ListItemText>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>

        <Toolbar />
        <Stats />

        <Toolbar />
        <List sx={{ marginTop: "auto" }}>
          <ListItem disablePadding>
            <Tooltip
              title="Settings"
              disableHoverListener={open}
              placement="right"
            >
              <ListItemButton
                sx={{
                  "&.Mui-selected": {
                    bgcolor: theme.control,
                  },
                  "&.Mui-selected.hover": {
                    bgcolor: theme.controlHover,
                  },
                  "&:hover": {
                    bgcolor: theme.controlHover,
                  },
                }}
                selected={settingsOpen}
                onClick={() => dispatch(openSettings())}
              >
                <ListItemIcon>
                  <SettingsIcon
                    sx={{
                      color: theme.font,
                      paddingLeft: "9px",
                    }}
                  />
                </ListItemIcon>
                <ListItemText sx={{ paddingLeft: 1, color: theme.font }}>
                  Settings
                </ListItemText>
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                "&.Mui-selected": {
                  bgcolor: theme.control,
                },
                "&.Mui-selected.hover": {
                  bgcolor: theme.controlHover,
                },
                "&:hover": {
                  bgcolor: theme.controlHover,
                },
              }}
              onClick={() => setOpen(!open)}
            >
              <ListItemIcon>
                {open ? (
                  <ArrowBackIosNewIcon
                    sx={{
                      color: theme.font,
                      paddingLeft: "80px",
                    }}
                  />
                ) : (
                  <ArrowForwardIosIcon
                    sx={{
                      color: theme.font,
                      paddingLeft: "9px",
                    }}
                  />
                )}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </List>
      </StyledDrawer>
      <Box component="main" sx={{ flexGrow: 1, p: 2, bgcolor: "black" }}>
        {!dataServiceConnected ? (
          <Box
            sx={{
              backgroundColor: config.colors.red,
              height: 20,
            }}
          >
            <Typography align="center" variant="subtitle2">
              DISCONNECTED
            </Typography>
          </Box>
        ) : null}
        <Grid
          container
          spacing={2}
          sx={{
            paddingTop: 1,
            paddingRight: 2,
            paddingLeft: 2,
          }}
        >
          <Routes>
            <Route path="/" element={<FieldAndCameraView />} />
            <Route path="/depthCamera" element={<DepthCameraView />} />
            <Route path="/colorCamera" element={<ColorCameraView />} />
            <Route path="/field" element={<FieldView />} />
          </Routes>
          <SettingsModal />
        </Grid>
      </Box>
    </Box>
  );
};

export default Navigator;
