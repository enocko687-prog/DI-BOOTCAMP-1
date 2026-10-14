import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCategoryFilter,
  setMaxPrice,
  setSortBy,
  toggleInStockOnly,
} from "../features/products/productsSlice.js";
import {
  selectCategories,
  selectCategoryFilter,
  selectFilteredProducts,
  selectFilteredProductsCount,
  selectInStockOnly,
  selectMaxPriceFilter,
  selectSortBy,
} from "../features/products/productSelectors.js";
import "../../styles.css";

const h = React.createElement;
const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

export default function ProductList() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const selectedCategory = useSelector(selectCategoryFilter);
  const maxPrice = useSelector(selectMaxPriceFilter);
  const inStockOnly = useSelector(selectInStockOnly);
  const sortBy = useSelector(selectSortBy);
  const products = useSelector(selectFilteredProducts);
  const filteredCount = useSelector(selectFilteredProductsCount);

  const handleCategoryChange = useCallback(
    (category) => dispatch(setCategoryFilter(category)),
    [dispatch],
  );

  const handlePriceChange = useCallback(
    (event) => dispatch(setMaxPrice(event.target.value)),
    [dispatch],
  );

  const handleToggleStock = useCallback(
    () => dispatch(toggleInStockOnly()),
    [dispatch],
  );

  const handleSortChange = useCallback(
    (event) => dispatch(setSortBy(event.target.value)),
    [dispatch],
  );

  return h(
    "main",
    { className: "page-shell" },
    h("section", { className: "inventory product-page", "aria-labelledby": "product-page-title" }, [
      h("header", { className: "page-header", key: "header" }, [
        h("p", { className: "eyebrow", key: "eyebrow" }, "SHOP THE COLLECTION"),
        h("h1", { id: "product-page-title", key: "title" }, "Find what fits your day."),
        h(
          "p",
          { className: "intro", key: "intro" },
          "Filter by category, price, and availability, then sort the results to match your needs.",
        ),
      ]),
      h("div", { className: "product-toolbar", key: "toolbar" }, [
        h("div", { className: "filter-group", key: "category-group" }, [
          h("label", { key: "label" }, "Category"),
          h(
            "div",
            { className: "chip-row", key: "chips" },
            categories.map((category) =>
              h(
                "button",
                {
                  className: `genre-button${selectedCategory === category ? " is-selected" : ""}`,
                  type: "button",
                  key: category,
                  onClick: () => handleCategoryChange(category),
                  "aria-pressed": selectedCategory === category,
                },
                category,
              ),
            ),
          ),
        ]),
        h("div", { className: "filter-group", key: "price-group" }, [
          h("label", { htmlFor: "max-price", key: "label" }, "Max price"),
          h("input", {
            id: "max-price",
            type: "range",
            min: "20",
            max: "300",
            step: "5",
            value: maxPrice,
            onChange: handlePriceChange,
            key: "range",
          }),
          h("span", { className: "price-readout", key: "readout" }, formatPrice(maxPrice)),
        ]),
        h("div", { className: "filter-group inline-toggle", key: "stock-group" }, [
          h("label", { htmlFor: "stock-only", key: "label" }, "In stock only"),
          h("input", {
            id: "stock-only",
            type: "checkbox",
            checked: inStockOnly,
            onChange: handleToggleStock,
            key: "checkbox",
          }),
        ]),
        h("div", { className: "filter-group", key: "sort-group" }, [
          h("label", { htmlFor: "sort-by", key: "label" }, "Sort by"),
          h(
            "select",
            {
              id: "sort-by",
              value: sortBy,
              onChange: handleSortChange,
              key: "select",
            },
            [
              h("option", { value: "name-asc", key: "name-asc" }, "Name"),
              h("option", { value: "price-low", key: "price-low" }, "Price: Low to High"),
              h("option", { value: "price-high", key: "price-high" }, "Price: High to Low"),
              h("option", { value: "stock", key: "stock" }, "Availability"),
            ],
          ),
        ]),
      ]),
      h("div", { className: "list-heading", key: "list-heading" }, [
        h("h2", { key: "title" }, "Products"),
        h("span", { className: "book-count", key: "count" }, `${filteredCount} items`),
      ]),
      products.length
        ? h(
            "ul",
            { className: "product-grid", key: "product-list" },
            products.map((product) =>
              h("li", { className: "product-card-row", key: product.id }, [
                h("div", { className: "product-copy", key: "copy" }, [
                  h("span", { className: "book-genre", key: "category" }, product.category),
                  h("h3", { key: "name" }, product.name),
                  h("p", { className: "product-description", key: "description" }, product.inStock ? "Available now" : "Out of stock"),
                ]),
                h("div", { className: "product-meta", key: "meta" }, [
                  h("strong", { key: "price" }, formatPrice(product.price)),
                  h("span", { className: `stock-badge${product.inStock ? " in-stock" : " out-of-stock"}`, key: "status" }, product.inStock ? "In stock" : "Sold out"),
                ]),
              ]),
            ),
          )
        : h("p", { className: "empty-state", key: "empty" }, "No products match your current filters."),
      h(
        "p",
        { className: "selector-note", key: "note" },
        "Products are filtered and sorted through memoized Redux selectors.",
      ),
    ]),
  );
}
