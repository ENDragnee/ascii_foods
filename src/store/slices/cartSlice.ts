import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuItem } from "@/types";
import { OrderType } from "@/generated/prisma/enums";

interface CartState {
  items: { [id: string]: number }; // An object mapping item ID to quantity
  isVisible: boolean;
  orderType: OrderType;
}

const initialState: CartState = {
  items: {},
  isVisible: false,
  orderType: OrderType.ONSITE,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Action to add an item to the cart
    addItem: (state, action: PayloadAction<MenuItem>) => {
      const id = action.payload.id;
      state.items[id] = (state.items[id] || 0) + 1;
    },
    // Action to remove an item from the cart
    removeItem: (state, action: PayloadAction<MenuItem>) => {
      const id = action.payload.id;
      if (state.items[id] > 1) {
        state.items[id] -= 1;
      } else {
        delete state.items[id];
      }
    },
    // Action to clear the entire cart
    clearCart: (state) => {
      state.items = {};
      state.isVisible = false;
    },
    // Actions to control visibility
    showCart: (state) => {
      state.isVisible = true;
    },
    hideCart: (state) => {
      state.isVisible = false;
    },

    changeOrderType: (state, action: PayloadAction<OrderType>) => {
      state.orderType = action.payload;
    },
  },
});

export const {
  addItem,
  removeItem,
  clearCart,
  showCart,
  hideCart,
  changeOrderType,
} = cartSlice.actions;

// ✅ FIX: This selector now correctly accesses `state.cart.items`.
// It correctly calculates the number of unique items in the cart.
export const selectCartSize = (state: { cart: CartState }) =>
  Object.keys(state.cart.items).length;

// ❌ REMOVED: The flawed `selectCartItems` selector is gone.
// The logic to combine `menuItems` with the cart quantities
// is correctly handled inside the `MainLayout` component.

export default cartSlice.reducer;
