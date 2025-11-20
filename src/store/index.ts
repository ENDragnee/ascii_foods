import { configureStore } from "@reduxjs/toolkit";
import viewModeReducer from "./slices/viewModeSlice";
import sidebarReducer from "./slices/sidebarSlice";
import menuReducer from "./slices/menuSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    viewMode: viewModeReducer,
    sidebar: sidebarReducer,
    menu: menuReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
