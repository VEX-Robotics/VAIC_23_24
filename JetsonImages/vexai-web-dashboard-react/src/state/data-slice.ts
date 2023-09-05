import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DataResponse } from "../lib/data-response";
import { DataService } from "../services/data-service";

export interface DataState {
  response: DataResponse;
  dataServiceConnected: boolean;
  dataService: DataService;
}

const initialState: DataState = {
  response: null,
  dataServiceConnected: false,
  dataService: null,
};

export const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    updateResponse: (state: DataState, action: PayloadAction<DataResponse>) => {
      state.response = action.payload;
    },
    setDataServiceConnected: (
      state: DataState,
      action: PayloadAction<boolean>
    ) => {
      state.dataServiceConnected = action.payload;
    },
    setDataService: (state: DataState, action: PayloadAction<DataService>) => {
      state.dataService = action.payload;
    },
  },
});

export const { setDataServiceConnected, updateResponse, setDataService } =
  dataSlice.actions;

export default dataSlice.reducer;
