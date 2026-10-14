import React, { useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  calculateTotalPrice,
  selectCartItems,
  selectProducts,
  store,
} from "./shoppingCartStore.js";
import "./styles.css";

const h = React.createElement;
const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

function ShoppingCart() {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(calculateTotalPrice);

  const handleAddToCart = useCallback(
    (productId) => dispatch(addToCart(productId)),
    [dispatch],
  );

  return h(
    "main",
    { className: "page-shell" },
    h("section", { className: "inventory", "aria-labelledby": "page-title" }, [
      h("header", { className: "page-header", key: "header" }, [
        h("p", { className: "eyebrow", key: "eyebrow" }, "THE READING ROOM · SHOP"),
        h("h1", { id: "page-title", key: "title" }, "A few good things."),
        h(
          "p",
          { className: "intro", key: "intro" },
          "Choose an item to add it to your cart. Your order total updates as you shop.",
        ),
      ]),
      h("div", { className: "cart-layout", key: "cart-layout" }, [
        h("section", { className: "shop-products", "aria-labelledby": "products-title", key: "products" }, [
          h("h2", { className: "section-heading", id: "products-title", key: "heading" }, "Available products"),
          h(
            "ul",
            { className: "product-list", key: "list" },
            products.map((product) =>
              h("li", { className: "product-card", key: product.id }, [
                h("div", { key: "details" }, [
                  h("h3", { key: "name" }, product.name),
                  h("p", { className: "product-description", key: "description" }, product.description),
                  h("span", { className: "product-price", key: "price" }, formatPrice(product.price)),
                ]),
                h(
                  "button",
                  {
                    className: "add-button",
                    type: "button",
                    onClick: () => handleAddToCart(product.id),
                    key: "button",
                  },
                  "Add to Cart",
                ),
              ]),
            ),
          ),
        ]),
        h("aside", { className: "cart-panel", "aria-labelledby": "cart-title", key: "cart" }, [
          h("h2", { className: "section-heading", id: "cart-title", key: "heading" }, "Your cart"),
          cartItems.length
            ? h(
                "ul",
                { className: "cart-items", key: "items" },
                cartItems.map((item) =>
                  h("li", { className: "cart-item", key: item.id }, [
                    h("div", { key: "details" }, [
                      h("h3", { key: "name" }, item.name),
                      h("p", { className: "product-description", key: "price" }, formatPrice(item.price)),
                    ]),
                    h("span", { className: "cart-quantity", key: "quantity" }, `Qty ${item.quantity}`),
                  ]),
                ),
              )
            : h("p", { className: "cart-empty", key: "empty" }, "Your cart is empty. Add something you like."),
          h("div", { className: "cart-total", key: "total" }, [
            h("span", { key: "label" }, "Total"),
            h("strong", { key: "amount" }, formatPrice(totalPrice)),
          ]),
        ]),
      ]),
      h(
        "p",
        { className: "selector-note", key: "note" },
        "Cart items and the total are derived with Redux Toolkit's createSelector.",
      ),
    ]),
  );
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(ShoppingCart))),
);