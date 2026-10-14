import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import "./styles.css";

const h = React.createElement;

const fetchUser = createAsyncThunk(
  "users/fetchUser",
  async (userId, { rejectWithValue }) => {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${encodeURIComponent(userId)}`,
    );

    if (!response.ok) {
      return rejectWithValue(`The user service returned an error (${response.status}).`);
    }

    const user = await response.json();
    if (!user || typeof user !== "object" || !user.id || !user.name) {
      return rejectWithValue(`No user was found with ID ${userId}.`);
    }

    return user;
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    user: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.user = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ||
          action.error.message ||
          "Unable to load this user. Check your connection and try again.";
      });
  },
});

const store = configureStore({
  reducer: {
    users: usersSlice.reducer,
  },
});

function UserData() {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.users);
  const [userId, setUserId] = React.useState("1");

  useEffect(() => {
    dispatch(fetchUser("1"));
  }, [dispatch]);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedId = userId.trim();
    if (!trimmedId) {
      return;
    }
    dispatch(fetchUser(trimmedId));
  }

  return h(
    "main",
    { className: "app-shell" },
    h(
      "section",
      { className: "user-card", "aria-labelledby": "page-title" },
      h("p", { className: "eyebrow" }, "React + Redux Toolkit"),
      h("h1", { id: "page-title" }, "User directory"),
      h(
        "p",
        { className: "intro" },
        "Fetch a user from the demo API and view the result in your Redux-powered profile.",
      ),
      h(
        "form",
        { className: "user-search-form", onSubmit: handleSubmit },
        h("label", { className: "user-id-label", htmlFor: "user-id" }, "User ID"),
        h("input", {
          id: "user-id",
          type: "number",
          min: "1",
          value: userId,
          onChange: (event) => setUserId(event.target.value),
          required: true,
        }),
        h(
          "button",
          {
            className: "fetch-button",
            type: "submit",
            disabled: status === "loading",
          },
          status === "loading" ? "Loading..." : "Fetch user",
        ),
      ),
      status === "loading"
        ? h("p", { className: "request-status", role: "status" }, "Fetching user details...")
        : null,
      status === "failed"
        ? h("div", { className: "user-error", role: "alert" }, [
            h("p", { key: "message" }, error),
            h(
              "button",
              {
                className: "retry-button",
                type: "button",
                onClick: () => dispatch(fetchUser(userId.trim())),
                disabled: status === "loading",
                key: "retry",
              },
              "Try again",
            ),
          ])
        : null,
      user
        ? h("article", { className: "user-profile", "aria-live": "polite" }, [
            h("div", { className: "profile-heading", key: "heading" }, [
              h("div", { className: "avatar", "aria-hidden": "true", key: "avatar" }, user.name.charAt(0)),
              h("div", { key: "identity" }, [
                h("h2", { key: "name" }, user.name),
                h("p", { className: "user-handle", key: "username" }, `@${user.username}`),
              ]),
            ]),
            h("dl", { className: "user-details", key: "details" }, [
              h("div", { className: "detail-row", key: "email" }, [
                h("dt", { key: "label" }, "Email"),
                h("dd", { key: "value" }, h("a", { href: `mailto:${user.email}` }, user.email)),
              ]),
              h("div", { className: "detail-row", key: "phone" }, [
                h("dt", { key: "label" }, "Phone"),
                h("dd", { key: "value" }, user.phone),
              ]),
              h("div", { className: "detail-row", key: "website" }, [
                h("dt", { key: "label" }, "Website"),
                h("dd", { key: "value" }, user.website),
              ]),
              h("div", { className: "detail-row", key: "company" }, [
                h("dt", { key: "label" }, "Company"),
                h("dd", { key: "value" }, user.company.name),
              ]),
              h("div", { className: "detail-row", key: "address" }, [
                h("dt", { key: "label" }, "Address"),
                h("dd", { key: "value" }, `${user.address.street}, ${user.address.city}`),
              ]),
            ]),
          ])
        : status === "idle"
          ? h("p", { className: "user-empty" }, "User details will appear here.")
          : null,
      h(
        "p",
        { className: "api-note" },
        "Data provided by JSONPlaceholder. Try ID 1–10; another ID shows the API error state.",
      ),
    ),
  );
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(UserData))),
);