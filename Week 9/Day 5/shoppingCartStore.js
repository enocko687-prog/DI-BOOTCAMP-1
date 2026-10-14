import { configureStore, createSelector, createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [
    { id: 1, name: "Canvas Tote", description: "Everyday carry, sturdy cotton.", price: 18.5 },
    { id: 2, name: "Ceramic Mug", description: "A quiet start to the morning.", price: 14 },
    { id: 3, name: "Desk Notebook", description: "Lay-flat pages for big ideas.", price: 9.75 },
    { id: 4, name: "Reading Light", description: "Warm, focused light for late pages.", price: 26 },
  ],
  cart: [],
};

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const productId = action.payload;
      const productExists = state.products.some((product) => product.id === productId);

      if (!productExists) {
        return;
      }

      const cartItem = state.cart.find((item) => item.productId === productId);
      if (cartItem) {
        cartItem.quantity += 1;
      } else {
        state.cart.push({ productId, quantity: 1 });
      }
    },
  },
});

export const store = configureStore({
  reducer: {
    shoppingCart: shoppingCartSlice.reducer,
  },
});

export const { addToCart } = shoppingCartSlice.actions;

export const selectProducts = (state) => state.shoppingCart.products;
const selectCart = (state) => state.shoppingCart.cart;

export const selectCartItems = createSelector(
  [selectCart, selectProducts],
  (cart, products) =>
    cart.map((item) => ({
      ...products.find((product) => product.id === item.productId),
      quantity: item.quantity,
    })),
);

export const calculateTotalPrice = createSelector(
  [selectCartItems],
  (items) => items.reduce((total, item) => total + item.price * item.quantity, 0),
);
