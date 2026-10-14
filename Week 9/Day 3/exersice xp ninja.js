import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import "./styles.css";

const h = React.createElement;

const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    products: [],
    error: "",
  },
  reducers: {
    addProduct: {
      reducer(state, action) {
        const duplicate = state.products.some(
          (product) =>
            product.name.toLowerCase() === action.payload.name.toLowerCase(),
        );

        if (duplicate) {
          state.error = "A product with that name is already in your inventory.";
          return;
        }

        state.products.push(action.payload);
        state.error = "";
      },
      prepare(name, quantity) {
        return {
          payload: {
            id: crypto.randomUUID(),
            name: name.trim(),
            quantity,
          },
        };
      },
    },
    updateQuantity(state, action) {
      const product = state.products.find(
        (item) => item.id === action.payload.id,
      );

      if (!product) {
        state.error = "That product could not be found.";
        return;
      }

      if (
        !Number.isInteger(action.payload.quantity) ||
        action.payload.quantity < 0
      ) {
        state.error = "Quantity must be a whole number of zero or more.";
        return;
      }

      product.quantity = action.payload.quantity;
      state.error = "";
    },
    removeProduct(state, action) {
      const exists = state.products.some(
        (product) => product.id === action.payload,
      );

      if (!exists) {
        state.error = "That product could not be found.";
        return;
      }

      state.products = state.products.filter(
        (product) => product.id !== action.payload,
      );
      state.error = "";
    },
    clearInventoryError(state) {
      state.error = "";
    },
  },
});

const {
  addProduct,
  updateQuantity,
  removeProduct,
  clearInventoryError,
} = inventorySlice.actions;

const store = configureStore({
  reducer: {
    inventory: inventorySlice.reducer,
  },
});

function AddProduct() {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const error = useSelector((state) => state.inventory.error);

  function handleSubmit(event) {
    event.preventDefault();
    const productName = name.trim();
    const parsedQuantity = Number(quantity);

    if (!productName) {
      return;
    }
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      return;
    }

    dispatch(addProduct(productName, parsedQuantity));

    if (!store.getState().inventory.error) {
      setName("");
      setQuantity("1");
    }
  }

  return h(
    "form",
    { className: "inventory-add-form", onSubmit: handleSubmit },
    h("label", { className: "inventory-field" }, [
      h("span", { key: "label" }, "Product name"),
      h("input", {
        key: "input",
        type: "text",
        value: name,
        onChange: (event) => {
          setName(event.target.value);
          if (error) dispatch(clearInventoryError());
        },
        placeholder: "e.g. Notebook",
        maxLength: 80,
        required: true,
      }),
    ]),
    h("label", { className: "inventory-field quantity-field" }, [
      h("span", { key: "label" }, "Starting quantity"),
      h("input", {
        key: "input",
        type: "number",
        min: "0",
        step: "1",
        value: quantity,
        onChange: (event) => setQuantity(event.target.value),
        required: true,
      }),
    ]),
    h("button", { className: "add-button inventory-add-button", type: "submit" }, "Add product"),
    error ? h("p", { className: "error-message inventory-error", role: "alert" }, error) : null,
  );
}

function UpdateQuantity({ product }) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(String(product.quantity));
  const error = useSelector((state) => state.inventory.error);

  function handleSubmit(event) {
    event.preventDefault();
    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      return;
    }

    dispatch(updateQuantity({ id: product.id, quantity: parsedQuantity }));
  }

  return h(
    "form",
    { className: "quantity-update-form", onSubmit: handleSubmit },
    h("label", { className: "sr-only", htmlFor: `quantity-${product.id}` }, `Quantity for ${product.name}`),
    h("input", {
      id: `quantity-${product.id}`,
      className: "inventory-quantity-input",
      type: "number",
      min: "0",
      step: "1",
      value: quantity,
      onChange: (event) => {
        setQuantity(event.target.value);
        if (error) dispatch(clearInventoryError());
      },
      required: true,
    }),
    h("button", { className: "quantity-save-button", type: "submit" }, "Update"),
  );
}

function InventoryList() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.inventory.products);
  const error = useSelector((state) => state.inventory.error);
  const totalUnits = products.reduce(
    (total, product) => total + product.quantity,
    0,
  );

  return h(
    "section",
    { className: "inventory-list-section", "aria-labelledby": "inventory-list-title" },
    h("div", { className: "inventory-heading" }, [
      h("div", { key: "heading" }, [
        h("p", { className: "eyebrow", key: "eyebrow" }, "Stock overview"),
        h("h2", { id: "inventory-list-title", key: "title" }, "Your inventory"),
      ]),
      h(
        "span",
        { className: "inventory-summary", key: "summary" },
        `${products.length} ${products.length === 1 ? "product" : "products"} · ${totalUnits} ${
          totalUnits === 1 ? "unit" : "units"
        }`,
      ),
    ]),
    error ? h("p", { className: "error-message inventory-list-error", role: "alert" }, error) : null,
    products.length === 0
      ? h("p", { className: "empty-state" }, "No products yet. Add your first product above.")
      : h(
          "div",
          { className: "inventory-table-wrap" },
          h(
            "table",
            { className: "inventory-table" },
            [
              h(
                "thead",
                { key: "head" },
                h("tr", null, [
                  h("th", { scope: "col", key: "product" }, "Product"),
                  h("th", { scope: "col", key: "quantity" }, "In stock"),
                  h("th", { scope: "col", key: "actions" }, "Actions"),
                ]),
              ),
              h(
                "tbody",
                { key: "body" },
                products.map((product) =>
                  h(
                    "tr",
                    { key: product.id },
                    h("th", { scope: "row", className: "inventory-product-name" }, product.name),
                    h("td", null, h(UpdateQuantity, { product })),
                    h(
                      "td",
                      null,
                      h(
                        "button",
                        {
                          className: "remove-button inventory-remove-button",
                          type: "button",
                          onClick: () => dispatch(removeProduct(product.id)),
                          "aria-label": `Remove ${product.name}`,
                        },
                        "Remove",
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
  );
}

function App() {
  return h(
    "main",
    { className: "app-shell" },
    h(
      "section",
      { className: "todo-card inventory-card", "aria-labelledby": "page-title" },
      h("p", { className: "eyebrow" }, "React + Redux Toolkit"),
      h("h1", { id: "page-title" }, "Store inventory"),
      h(
        "p",
        { className: "intro" },
        "Track products in stock. Add products, update quantities, or remove items when they are no longer available.",
      ),
      h(
        "section",
        { className: "inventory-add-section", "aria-labelledby": "add-product-title" },
        h("h2", { id: "add-product-title", className: "inventory-subtitle" }, "Add a product"),
        h(AddProduct),
      ),
      h(InventoryList),
    ),
  );
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(App))),
);