import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MenuItemData {
  date: string;
  foodIds: string[];
  name: string;
  day: string;
}

interface MenuState {
  menus: MenuItemData[];
}

const initialState: MenuState = {
  menus: [],
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenuForDate: (state, action: PayloadAction<MenuItemData>) => {
      const existingIndex = state.menus.findIndex(
        (menu) => menu.date === action.payload.date
      );
      if (existingIndex > -1) {
        state.menus[existingIndex] = action.payload;
      } else {
        state.menus.push(action.payload);
      }
    },

    removeMenuForDate: (state, action: PayloadAction<string>) => {
      state.menus = state.menus.filter((menu) => menu.date !== action.payload);
    },

    setMultipleMenus: (state, action: PayloadAction<MenuItemData[]>) => {
      action.payload.forEach((newMenu) => {
        const existingIndex = state.menus.findIndex(
          (menu) => menu.date === newMenu.date
        );
        if (existingIndex > -1) {
          state.menus[existingIndex] = newMenu;
        } else {
          state.menus.push(newMenu);
        }
      });
    },

    clearAllMenus: (state) => {
      state.menus = [];
    },
  },
});

export const MenuItemData = (
  state: { menu: MenuState },
  date: string
): MenuItemData | undefined => {
  return state.menu.menus.find((menu) => menu.date === date);
};

export const {
  setMenuForDate,
  removeMenuForDate,
  setMultipleMenus,
  clearAllMenus,
} = menuSlice.actions;
export default menuSlice.reducer;
