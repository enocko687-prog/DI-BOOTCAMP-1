import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [
    { id: 1, name: "Wireless Headphones", category: "Electronics", price: 129.99, inStock: true },
    { id: 2, name: "Classic Backpack", category: "Accessories", price: 79.5, inStock: true },
    { id: 3, name: "Running Shoes", category: "Fashion", price: 94.99, inStock: false },
    { id: 4, name: "Smartwatch", category: "Electronics", price: 219.0, inStock: true },
    { id: 5, name: "Sunglasses", category: "Accessories", price: 49.0, inStock: true },
    { id: 6, name: "Office Chair", category: "Furniture", price: 249.0, inStock: false },
    { id: 7, name: "Coffee Grinder", category: "Home", price: 59.99, inStock: true },
    { id: 8, name: "Cotton Tee", category: "Fashion", price: 24.5, inStock: true },
  ],
  filters: {
    category: "All",
    maxPrice: 300,
    inStockOnly: false,
    sortBy: "name-asc",
  },
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setCategoryFilter(state, action) {
      state.filters.category = action.payload;
    },
    setMaxPrice(state, action) {
      state.filters.maxPrice = Number(action.payload) || 0;
    },
    toggleInStockOnly(state) {
      state.filters.inStockOnly = !state.filters.inStockOnly;
    },
    setSortBy(state, action) {
      state.filters.sortBy = action.payload;
    },
  },
});

export const {
  setCategoryFilter,
  setMaxPrice,
  toggleInStockOnly,
  setSortBy,
} = productsSlice.actions;

export default productsSlice.reducer;
