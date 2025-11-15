import { configureStore } from "@reduxjs/toolkit";
import viewModeReducer from "./slices/viewModeSlice";
import sidebarReducer from "./slices/sidebarSlice";

export const store = configureStore({
  reducer: {
    viewMode: viewModeReducer,
    sidebar: sidebarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
