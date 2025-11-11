// /store/slices/viewModeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ViewMode = "grid" | "table";

interface ViewModeState {
  mode: ViewMode;
}

const initialState: ViewModeState = {
  mode: "grid",
};

const viewModeSlice = createSlice({
  name: "viewMode",
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.mode = action.payload;
    },
    toggleViewMode: (state) => {
      state.mode = state.mode === "grid" ? "table" : "grid";
    },
  },
});

export const { setViewMode, toggleViewMode } = viewModeSlice.actions;
export default viewModeSlice.reducer;
