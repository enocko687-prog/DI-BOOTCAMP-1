import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { FetchDataState, Recipe } from "../types/types";
import { fetchRecipes } from "../api/api";

export const fetchRecipeData = createAsyncThunk<
  Recipe[],
  string,
  { rejectValue: string }
>("recipes/fetch", async (query, { rejectWithValue, signal }) => {
  try {
    return await fetchRecipes(query, signal);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to load recipes.",
    );
  }
});

const initialState: FetchDataState<Recipe> & { currentRequestId?: string } = {
  items: [],
  status: "idle",
  error: null,
};

const dataSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    clearRecipes(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
      state.currentRequestId = undefined;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchRecipeData.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchRecipeData.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = "succeeded";
        state.items = action.payload;
        state.currentRequestId = undefined;
      })
      .addCase(fetchRecipeData.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = action.meta.aborted ? "idle" : "failed";
        state.error = action.meta.aborted
          ? null
          : action.payload ?? action.error.message ?? "Unable to load recipes.";
        state.currentRequestId = undefined;
      });
  },
});

export const { clearRecipes } = dataSlice.actions;
export default dataSlice.reducer;
