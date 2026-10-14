import React from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import "./styles.css";

const h = React.createElement;
const updateDelay = () =>
  new Promise((resolve) => window.setTimeout(resolve, 700));

const ageUpAsync = createAsyncThunk("age/ageUpAsync", async () => {
  await updateDelay();
  return 1;
});

const ageDownAsync = createAsyncThunk("age/ageDownAsync", async () => {
  await updateDelay();
  return -1;
});

const ageSlice = createSlice({
  name: "age",
  initialState: {
    age: 20,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(ageUpAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ageUpAsync.fulfilled, (state, action) => {
        state.age += action.payload;
        state.loading = false;
      })
      .addCase(ageUpAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unable to update the age.";
      })
      .addCase(ageDownAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(ageDownAsync.fulfilled, (state, action) => {
        state.age = Math.max(0, state.age + action.payload);
        state.loading = false;
      })
      .addCase(ageDownAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unable to update the age.";
      });
  },
});

const store = configureStore({
  reducer: {
    age: ageSlice.reducer,
  },
});

function AgeDisplay() {
  const { age, loading } = useSelector((state) => state.age);

  return h(
    "div",
    { className: "age-display", "aria-busy": loading },
    h("span", { className: "age-caption" }, "Current age"),
    h("p", { className: "age-value", "aria-live": "polite" }, age),
    loading
      ? h("div", { className: "age-loading", role: "status" }, [
          h("span", { className: "age-spinner", "aria-hidden": "true", key: "spinner" }),
          h("span", { key: "message" }, "Updating your age..."),
        ])
      : h("p", { className: "age-hint" }, "Choose an action to update your age."),
  );
}

function AgeControls() {
  const dispatch = useDispatch();
  const { age, loading, error } = useSelector((state) => state.age);

  return h(
    "form",
    {
      className: "age-controls",
      onSubmit: (event) => event.preventDefault(),
    },
    h(
      "button",
      {
        className: "age-button age-down-button",
        type: "submit",
        onClick: () => dispatch(ageDownAsync()),
        disabled: loading || age === 0,
      },
      "Age Down",
    ),
    h(
      "button",
      {
        className: "age-button age-up-button",
        type: "submit",
        onClick: () => dispatch(ageUpAsync()),
        disabled: loading,
      },
      "Age Up",
    ),
    error ? h("p", { className: "age-error", role: "alert" }, error) : null,
    age === 0
      ? h("p", { className: "age-hint" }, "Age cannot go below zero.")
      : null,
  );
}

function AgeTracker() {
  const loading = useSelector((state) => state.age.loading);

  return h(
    "main",
    { className: "app-shell" },
    h(
      "section",
      {
        className: "user-card age-card",
        "aria-labelledby": "page-title",
        "aria-busy": loading,
      },
      h("p", { className: "eyebrow" }, "React + Redux Toolkit"),
      h("h1", { id: "page-title" }, "Age Tracker"),
      h(
        "p",
        { className: "intro" },
        "Update your age with asynchronous Redux actions.",
      ),
      h(AgeDisplay),
      h(AgeControls),
      h(
        "p",
        { className: "api-note" },
        "Each update takes a moment. Redux Thunk is included by configureStore.",
      ),
    ),
  );
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(AgeTracker))),
);