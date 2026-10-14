import { createSelector } from "@reduxjs/toolkit";

const selectAllProducts = (state) => state.products.items;
export const selectCategoryFilter = (state) => state.products.filters.category;
export const selectMaxPriceFilter = (state) => state.products.filters.maxPrice;
export const selectInStockOnly = (state) => state.products.filters.inStockOnly;
export const selectSortBy = (state) => state.products.filters.sortBy;

export const selectFilteredProducts = createSelector(
  [selectAllProducts, selectCategoryFilter, selectMaxPriceFilter, selectInStockOnly, selectSortBy],
  (products, category, maxPrice, inStockOnly, sortBy) => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesPrice = product.price <= maxPrice;
      const matchesAvailability = !inStockOnly || product.inStock;
      return matchesCategory && matchesPrice && matchesAvailability;
    });

    const sorted = [...filtered];
    if (sortBy === "price-low") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "stock") {
      sorted.sort((a, b) => Number(b.inStock) - Number(a.inStock));
    }

    return sorted;
  },
);

export const selectCategories = createSelector([selectAllProducts], (products) => {
  const categories = [...new Set(products.map((product) => product.category))];
  return ["All", ...categories];
});

export const selectFilteredProductsCount = createSelector(
  [selectFilteredProducts],
  (products) => products.length,
);
