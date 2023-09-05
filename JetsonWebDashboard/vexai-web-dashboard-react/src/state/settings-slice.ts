import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { themes } from "../lib/themes";
import { Theme } from "../lib/types";
import { Offset } from "../lib/data-response";
import { config } from "../util/config";

export interface SettingsState {
  /**
   * How many times the site asks the websocket server for data (in milliseconds)
   */
  pollingInterval: number;
  showFog: string;
  showCompass: string;
  showXYTracks: string;
  theme: Theme;
  cameraOffset: Offset;
  gpsOffset: Offset;
  socketIp: string;
  socketPort: string;
}

const getTheme = (t: string) => {
  switch (t) {
    case themes.red.id:
      return themes.red;
    case themes.blue.id:
      return themes.blue;
    default:
      return themes.red;
  }
};

const initialState: SettingsState = {
  pollingInterval: config.pollingInterval,
  showFog: localStorage.getItem("showFog") || "true",
  showCompass: localStorage.getItem("showCompass") || "true",
  showXYTracks: localStorage.getItem("showXYTracks") || "false",
  theme: getTheme(localStorage.getItem("theme") || themes.red.id),
  cameraOffset: { x: 0, y: 0, z: 0, headingOffset: 0, elevationOffset: 0 },
  gpsOffset: { x: 0, y: 0, z: 0, headingOffset: 0 },
  socketIp: config.socketIP,
  socketPort: config.socketPort,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setPollingInterval: (
      state: SettingsState,
      action: PayloadAction<number>
    ) => {
      state.pollingInterval = action.payload;
    },
    setShowFog: (state: SettingsState, action: PayloadAction<string>) => {
      localStorage.setItem("showFog", action.payload);
      state.showFog = action.payload;
    },
    setShowCompass: (state: SettingsState, action: PayloadAction<string>) => {
      localStorage.setItem("showCompass", action.payload);
      state.showCompass = action.payload;
    },
    setShowXYTracks: (state: SettingsState, action: PayloadAction<string>) => {
      localStorage.setItem("showXYTracks", action.payload);
      state.showXYTracks = action.payload;
    },
    setTheme: (state: SettingsState, action: PayloadAction<Theme>) => {
      localStorage.setItem("theme", action.payload.id);
      state.theme = action.payload;
    },
    setCameraOffset: (state: SettingsState, action: PayloadAction<Offset>) => {
      state.cameraOffset = action.payload;
    },
    setGpsOffset: (state: SettingsState, action: PayloadAction<Offset>) => {
      state.gpsOffset = action.payload;
    },
    setSocketIp: (state: SettingsState, action: PayloadAction<string>) => {
      state.socketIp = action.payload;
    },
    setSocketPort: (state: SettingsState, action: PayloadAction<string>) => {
      state.socketPort = action.payload;
    },
  },
});

export const {
  setShowFog,
  setShowCompass,
  setShowXYTracks,
  setPollingInterval,
  setTheme,
  setCameraOffset,
  setGpsOffset,
  setSocketIp,
  setSocketPort,
} = settingsSlice.actions;

export default settingsSlice.reducer;
