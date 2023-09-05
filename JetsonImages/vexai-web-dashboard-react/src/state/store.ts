import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./app-slice";
import dataReducer from "./data-slice";
import settingsReducer from "./settings-slice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    data: dataReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;
