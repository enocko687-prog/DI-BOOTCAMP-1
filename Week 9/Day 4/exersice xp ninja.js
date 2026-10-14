import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  configureStore,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import "./styles.css";

const h = React.createElement;

const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    const response = await fetch("https://fakestoreapi.com/products?limit=12");
    if (!response.ok) {
      return rejectWithValue(
        `The product service returned an error (${response.status}).`,
      );
    }

    const products = await response.json();
    if (!Array.isArray(products)) {
      return rejectWithValue("The product service returned invalid data.");
    }

    return products;
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null },
  reducers: {
    login(state, action) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
});

const productsSlice = createSlice({
  name: "products",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ||
          action.error.message ||
          "Unable to fetch products. Check your connection and try again.";
      });
  },
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    addToCart(state, action) {
      const item = state.items.find(
        (cartItem) => cartItem.product.id === action.payload.id,
      );
      if (item) {
        item.quantity += 1;
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
      }
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload,
      );
    },
    updateCartQuantity(state, action) {
      const item = state.items.find(
        (cartItem) => cartItem.product.id === action.payload.id,
      );
      if (!item || !Number.isInteger(action.payload.quantity)) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter(
          (cartItem) => cartItem.product.id !== action.payload.id,
        );
        return;
      }
      item.quantity = action.payload.quantity;
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

const { login, logout } = authSlice.actions;
const { addToCart, removeFromCart, updateCartQuantity, clearCart } =
  cartSlice.actions;

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    products: productsSlice.reducer,
    cart: cartSlice.reducer,
  },
});

function AuthForm() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Enter a name with at least 2 characters.");
      return;
    }
    dispatch(login({ name: trimmedName }));
    setName("");
    setError("");
  }

  if (user) {
    return h("div", { className: "shop-account" }, [
      h(
        "span",
        { className: "shop-welcome", key: "welcome" },
        `Welcome, ${user.name}`,
      ),
      h(
        "button",
        {
          className: "shop-logout-button",
          type: "button",
          onClick: () => dispatch(logout()),
          key: "logout",
        },
        "Sign out",
      ),
    ]);
  }

  return h(
    "form",
    { className: "shop-login-form", onSubmit: handleSubmit },
    h("label", { className: "sr-only", htmlFor: "shop-name" }, "Your name"),
    h("input", {
      id: "shop-name",
      type: "text",
      value: name,
      onChange: (event) => {
        setName(event.target.value);
        setError("");
      },
      placeholder: "Enter your name to sign in",
      autoComplete: "name",
      required: true,
    }),
    h("button", { className: "shop-signin-button", type: "submit" }, "Sign in"),
    error ? h("span", { className: "shop-login-error", role: "alert" }, error) : null,
  );
}

function ProductListing() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items, status, error } = useSelector((state) => state.products);

  useEffect(() => {
    if (status === "idle") dispatch(fetchProducts());
  }, [dispatch, status]);

  return h(
    "section",
    { className: "shop-catalog", "aria-labelledby": "catalog-heading" },
    h("div", { className: "shop-section-heading" }, [
      h("div", { key: "title" }, [
        h("p", { className: "shop-eyebrow", key: "eyebrow" }, "Curated for you"),
        h("h2", { id: "catalog-heading", key: "heading" }, "Shop the collection"),
      ]),
      h(
        "span",
        { className: "shop-product-count", key: "count" },
        status === "loading" ? "Loading products..." : `${items.length} products`,
      ),
    ]),
    error
      ? h("div", { className: "shop-error", role: "alert" }, [
          h("p", { key: "error" }, error),
          h(
            "button",
            {
              className: "shop-retry-button",
              type: "button",
              onClick: () => dispatch(fetchProducts()),
              key: "retry",
            },
            "Try again",
          ),
        ])
      : null,
    status === "loading" && items.length === 0
      ? h("p", { className: "shop-loading", role: "status" }, "Loading the collection...")
      : null,
    items.length
      ? h(
          "div",
          { className: "product-grid" },
          items.map((product) =>
            h("article", { className: "product-card", key: product.id }, [
              h("div", { className: "product-image-frame", key: "image-frame" }, [
                h("img", {
                  src: product.image,
                  alt: product.title,
                  loading: "lazy",
                  key: "image",
                }),
                h("span", { className: "product-category", key: "category" }, product.category),
              ]),
              h("div", { className: "product-info", key: "info" }, [
                h("h3", { key: "title" }, product.title),
                h(
                  "p",
                  { className: "product-rating", key: "rating" },
                  `★ ${product.rating?.rate ?? "New"} · ${product.rating?.count ?? 0} reviews`,
                ),
                h("div", { className: "product-buy-row", key: "buy" }, [
                  h("span", { className: "product-price", key: "price" }, `$${Number(product.price).toFixed(2)}`),
                  h(
                    "button",
                    {
                      className: "shop-add-button",
                      type: "button",
                      onClick: () => dispatch(addToCart(product)),
                      disabled: !user,
                      title: user ? "Add to cart" : "Sign in to add products",
                      key: "add",
                    },
                    user ? "Add to cart" : "Sign in to shop",
                  ),
                ]),
              ]),
            ]),
          ),
        )
      : status !== "loading" && !error
        ? h("p", { className: "shop-empty" }, "No products are available right now.")
        : null,
  );
}

function ShoppingCart() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return h(
    "aside",
    { className: "cart-panel", "aria-labelledby": "cart-heading" },
    h("div", { className: "cart-heading-row" }, [
      h("h2", { id: "cart-heading", key: "heading" }, "Your bag"),
      h("span", { className: "cart-count", key: "count" }, itemCount),
    ]),
    !user
      ? h("p", { className: "cart-hint" }, "Sign in to start adding products to your bag.")
      : cartItems.length === 0
        ? h("p", { className: "cart-hint" }, "Your bag is empty. Find something you love.")
        : h(
            "ul",
            { className: "cart-list" },
            cartItems.map((item) =>
              h("li", { className: "cart-item", key: item.product.id }, [
                h("div", { className: "cart-item-details", key: "details" }, [
                  h("span", { className: "cart-item-name", key: "name" }, item.product.title),
                  h(
                    "span",
                    { className: "cart-item-price", key: "price" },
                    `$${(Number(item.product.price) * item.quantity).toFixed(2)}`,
                  ),
                ]),
                h("div", { className: "cart-item-controls", key: "controls" }, [
                  h(
                    "button",
                    {
                      className: "quantity-control",
                      type: "button",
                      onClick: () =>
                        dispatch(
                          updateCartQuantity({
                            id: item.product.id,
                            quantity: item.quantity - 1,
                          }),
                        ),
                      "aria-label": `Decrease ${item.product.title} quantity`,
                      key: "decrease",
                    },
                    "\u2212",
                  ),
                  h("span", { className: "cart-quantity", key: "quantity" }, item.quantity),
                  h(
                    "button",
                    {
                      className: "quantity-control",
                      type: "button",
                      onClick: () =>
                        dispatch(
                          updateCartQuantity({
                            id: item.product.id,
                            quantity: item.quantity + 1,
                          }),
                        ),
                      "aria-label": `Increase ${item.product.title} quantity`,
                      key: "increase",
                    },
                    "+",
                  ),
                  h(
                    "button",
                    {
                      className: "cart-remove",
                      type: "button",
                      onClick: () => dispatch(removeFromCart(item.product.id)),
                      "aria-label": `Remove ${item.product.title} from bag`,
                      key: "remove",
                    },
                    "Remove",
                  ),
                ]),
              ]),
            ),
          ),
    h("div", { className: "cart-subtotal" }, [
      h("span", { key: "label" }, "Subtotal"),
      h("strong", { key: "value" }, `$${subtotal.toFixed(2)}`),
    ]),
    cartItems.length > 0
      ? h(
          "button",
          {
            className: "checkout-button",
            type: "button",
            onClick: () => {
              window.alert("Checkout is simulated for this exercise.");
              dispatch(clearCart());
            },
          },
          "Continue to checkout",
        )
      : null,
  );
}

function App() {
  return h(
    "main",
    { className: "shop-shell" },
    h(
      "header",
      { className: "shop-header" },
      h("a", { className: "shop-logo", href: "?exercise=shop" }, [
        h("span", { className: "shop-logo-mark", key: "mark" }, "S"),
        h("span", { key: "text" }, "STUDIO / STORE"),
      ]),
      h(AuthForm),
    ),
    h("section", { className: "shop-hero" }, [
      h("p", { className: "shop-eyebrow", key: "eyebrow" }, "Thoughtful things, everyday"),
      h("h1", { key: "heading" }, ["Find your ", h("em", { key: "italic" }, "everyday favorite"), "."]),
      h(
        "p",
        { key: "copy" },
        "A little collection of considered essentials, made to bring more joy to your daily routine.",
      ),
    ]),
    h("div", { className: "shop-content" }, [
      h(ProductListing, { key: "products" }),
      h(ShoppingCart, { key: "cart" }),
    ]),
    h("footer", { className: "shop-footer" }, "A simulated storefront powered by Redux Toolkit and async thunks."),
  );
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(App))),
);