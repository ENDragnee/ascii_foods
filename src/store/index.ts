import { configureStore } from "@reduxjs/toolkit";
import viewModeReducer from "./slices/viewModeSlice";
import menuReducer from "./slices/menuSlice";

export const store = configureStore({
  reducer: {
    viewMode: viewModeReducer,
    menu: menuReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
