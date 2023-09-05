import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AppState {
  drawerOpen: boolean;
  settingsOpen: boolean;
  scale: number;
}

const initialState: AppState = {
  drawerOpen: false,
  settingsOpen: false,
  scale: 1,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    openDrawer: (state: AppState) => {
      state.drawerOpen = true;
    },
    closeDrawer: (state: AppState) => {
      state.drawerOpen = false;
    },
    openSettings: (state: AppState) => {
      state.settingsOpen = true;
    },
    closeSettings: (state: AppState) => {
      state.settingsOpen = false;
    },
    setScale: (state: AppState, action: PayloadAction<number>) => {
      state.scale = action.payload;
    },
  },
});

export const {
  openDrawer,
  closeDrawer,
  openSettings,
  closeSettings,
  setScale,
} = appSlice.actions;

export default appSlice.reducer;
