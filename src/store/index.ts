import { configureStore } from "@reduxjs/toolkit";
import viewModeReducer from "./slices/viewModeSlice";
import sidebarReducer from "./slices/sidebarSlice";
import menuReducer from "./slices/menuSlice";

export const store = configureStore({
  reducer: {
    viewMode: viewModeReducer,
    sidebar: sidebarReducer,
    menu: menuReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
