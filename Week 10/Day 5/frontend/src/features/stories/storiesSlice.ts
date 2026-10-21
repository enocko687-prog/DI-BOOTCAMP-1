import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { CommentReaction, Contributor, Story, StoryComment, StoryRevision, User, UserProfile } from "../../../../types";
import { ApiError, apiRequest } from "../../app/api";
import type { RootState } from "../../app/store";
import { clearSession, setAccessToken } from "../auth/authSlice";

interface StoriesState {
  stories: Story[];
  comments: StoryComment[];
  revisions: StoryRevision[];
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: StoriesState = {
  stories: [],
  comments: [],
  revisions: [],
  profile: null,
  loading: false,
  error: null,
};

interface ThunkConfig {
  state: RootState;
  rejectValue: string;
}

function makeAuthorizedRequest<T>(
  path: string,
  options: RequestInit,
  token: string | null,
  dispatch: (action: ReturnType<typeof setAccessToken> | ReturnType<typeof clearSession>) => unknown,
): Promise<T> {
  return apiRequest<T>(path, options, token, (newToken) => {
    dispatch(setAccessToken(newToken));
  }, () => dispatch(clearSession()));
}

export const fetchStories = createAsyncThunk<Story[], { mine: boolean }, ThunkConfig>(
  "stories/fetch",
  async ({ mine }, { getState, dispatch, rejectWithValue }) => {
    try {
      const result = await makeAuthorizedRequest<{ stories: Story[] }>(
        `/stories${mine ? "?mine=true" : ""}`,
        {},
        getState().auth.accessToken,
        dispatch,
      );
      return result.stories;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to load stories.");
    }
  },
);

export const fetchStory = createAsyncThunk<Story, number, ThunkConfig>(
  "stories/fetchOne",
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const result = await makeAuthorizedRequest<{ story: Story }>(
        `/stories/${id}`,
        {},
        getState().auth.accessToken,
        dispatch,
      );
      return result.story;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to sync story.");
    }
  },
);

export const createStory = createAsyncThunk<
  Story,
  { title: string; content: string },
  ThunkConfig
>(
  "stories/create",
  async (story, { getState, dispatch, rejectWithValue }) => {
    try {
      const result = await makeAuthorizedRequest<{ story: Story }>(
        "/stories",
        { method: "POST", body: JSON.stringify(story) },
        getState().auth.accessToken,
        dispatch,
      );
      return result.story;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to create story.");
    }
  },
);

export const saveStory = createAsyncThunk<
  Story,
  { id: number; title: string; content: string },
  ThunkConfig
>(
  "stories/save",
  async ({ id, ...story }, { getState, dispatch, rejectWithValue }) => {
    try {
      const result = await makeAuthorizedRequest<{ story: Story }>(
        `/stories/${id}`,
        { method: "PATCH", body: JSON.stringify(story) },
        getState().auth.accessToken,
        dispatch,
      );
      return result.story;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to save story.");
    }
  },
);

export const deleteStory = createAsyncThunk<number, number, ThunkConfig>(
  "stories/delete",
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      await makeAuthorizedRequest<void>(
        `/stories/${id}`,
        { method: "DELETE" },
        getState().auth.accessToken,
        dispatch,
      );
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to delete story.");
    }
  },
);

export const fetchComments = createAsyncThunk<StoryComment[], number, ThunkConfig>(
  "stories/comments",
  async (storyId, { getState, dispatch, rejectWithValue }) => {
    try {
      const result = await makeAuthorizedRequest<{ comments: StoryComment[] }>(
        `/comments/${storyId}`,
        {},
        getState().auth.accessToken,
        dispatch,
      );
      return result.comments;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to load notes.");
    }
  },
);

export const fetchRevisions = createAsyncThunk<StoryRevision[], number, ThunkConfig>(
  "stories/revisions",
  async (storyId, { getState, dispatch, rejectWithValue }) => {
    try {
      const result = await makeAuthorizedRequest<{ revisions: StoryRevision[] }>(
        `/stories/${storyId}/versions`,
        {},
        getState().auth.accessToken,
        dispatch,
      );
      return result.revisions;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to load story history.");
    }
  },
);

export const restoreRevision = createAsyncThunk<number, { storyId: number; revisionId: number }, ThunkConfig>(
  "stories/restore",
  async ({ storyId, revisionId }, { getState, dispatch, rejectWithValue }) => {
    try {
      await makeAuthorizedRequest(
        `/stories/${storyId}/versions/${revisionId}/restore`,
        { method: "POST" },
        getState().auth.accessToken,
        dispatch,
      );
      return storyId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to restore version.");
    }
  },
);

export const setCommentsEnabled = createAsyncThunk<boolean, { storyId: number; enabled: boolean }, ThunkConfig>(
  "stories/commentsEnabled",
  async ({ storyId, enabled }, { getState, dispatch, rejectWithValue }) => {
    try {
      const result = await makeAuthorizedRequest<{ commentsEnabled: boolean }>(
        `/stories/${storyId}/comments`,
        { method: "PATCH", body: JSON.stringify({ enabled }) },
        getState().auth.accessToken,
        dispatch,
      );
      return result.commentsEnabled;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to update comment settings.");
    }
  },
);

export const updateComment = createAsyncThunk<number, { id: number; comment_text: string; storyId: number }, ThunkConfig>(
  "stories/updateComment",
  async ({ id, comment_text }, { getState, dispatch, rejectWithValue }) => {
    try {
      await makeAuthorizedRequest(`/comments/${id}`, { method: "PATCH", body: JSON.stringify({ comment_text }) }, getState().auth.accessToken, dispatch);
      return id;
    } catch (error) { return rejectWithValue(error instanceof Error ? error.message : "Unable to edit comment."); }
  },
);

export const deleteComment = createAsyncThunk<number, { id: number; storyId: number }, ThunkConfig>(
  "stories/deleteComment",
  async ({ id }, { getState, dispatch, rejectWithValue }) => {
    try {
      await makeAuthorizedRequest(`/comments/${id}`, { method: "DELETE" }, getState().auth.accessToken, dispatch);
      return id;
    } catch (error) { return rejectWithValue(error instanceof Error ? error.message : "Unable to delete comment."); }
  },
);

export const createShareLink = createAsyncThunk<string, number, ThunkConfig>(
  "stories/share",
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const result = await makeAuthorizedRequest<{ url: string }>(`/stories/${id}/share`, { method: "POST" }, getState().auth.accessToken, dispatch);
      return result.url;
    } catch (error) { return rejectWithValue(error instanceof Error ? error.message : "Unable to share story."); }
  },
);

export const fetchProfile = createAsyncThunk<UserProfile, void, ThunkConfig>(
  "stories/profile",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const result = await makeAuthorizedRequest<{ profile: UserProfile }>("/profile", {}, getState().auth.accessToken, dispatch);
      return result.profile;
    } catch (error) { return rejectWithValue(error instanceof Error ? error.message : "Unable to load profile."); }
  },
);

export const updateProfile = createAsyncThunk<UserProfile, { avatarUrl: string }, ThunkConfig>(
  "stories/updateProfile",
  async (profile, { getState, dispatch, rejectWithValue }) => {
    try {
      const result = await makeAuthorizedRequest<{ profile: UserProfile }>(
        "/profile",
        { method: "PATCH", body: JSON.stringify(profile) },
        getState().auth.accessToken,
        dispatch,
      );
      return result.profile;
    } catch (error) { return rejectWithValue(error instanceof Error ? error.message : "Unable to update profile."); }
  },
);

export const addStoryComment = createAsyncThunk<
  StoryComment,
  { storyId: number; content: string },
  ThunkConfig
>(
  "stories/addComment",
  async ({ storyId, content }, { getState, dispatch, rejectWithValue }) => {
    try {
      const result = await makeAuthorizedRequest<{ comment: StoryComment }>(
        "/comments",
        { method: "POST", body: JSON.stringify({ story_id: storyId, comment_text: content }) },
        getState().auth.accessToken,
        dispatch,
      );
      return {
        ...result.comment,
        content: result.comment.content ?? (result.comment as StoryComment & { commentText?: string }).commentText ?? "",
        createdAt: result.comment.createdAt ?? (result.comment as StoryComment & { timestamp?: string }).timestamp ?? new Date().toISOString(),
        reactions: result.comment.reactions ?? [],
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to add note.");
    }
  },
);

export const reactToComment = createAsyncThunk<
  { commentId: number; reactions: CommentReaction[] },
  { commentId: number; emoji: string },
  ThunkConfig
>("stories/react", async ({ commentId, emoji }, { getState, dispatch, rejectWithValue }) => {
  const comment = getState().stories.comments.find((item) => item.id === commentId);
  const previous = comment?.reactions ?? [];
  const next = previous.map((reaction) => ({ ...reaction }));
  const current = next.find((reaction) => reaction.emoji === emoji);
  if (current) {
    current.count += current.reacted ? -1 : 1;
    current.reacted = !current.reacted;
    if (!current.count) next.splice(next.indexOf(current), 1);
  } else {
    next.push({ emoji, count: 1, reacted: true });
  }
  dispatch({ type: "stories/setReactions", payload: { commentId, reactions: next } });
  try {
    await makeAuthorizedRequest(
      `/comments/${commentId}/reactions`,
      { method: "POST", body: JSON.stringify({ emoji }) },
      getState().auth.accessToken,
      dispatch,
    );
    return { commentId, reactions: next };
  } catch (error) {
    dispatch({ type: "stories/setReactions", payload: { commentId, reactions: previous } });
    return rejectWithValue(error instanceof Error ? error.message : "Unable to save reaction.");
  }
});

export const inviteContributor = createAsyncThunk<
  Contributor[],
  { storyId: number; email: string },
  ThunkConfig
>(
  "stories/invite",
  async ({ storyId, email }, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const search = await makeAuthorizedRequest<{ user: User }>(
        `/auth/users/search?email=${encodeURIComponent(email)}`,
        {},
        token,
        dispatch,
      );
      await makeAuthorizedRequest(
        "/contributors",
        { method: "POST", body: JSON.stringify({ story_id: storyId, user_id: search.user.id }) },
        getState().auth.accessToken,
        dispatch,
      );
      const result = await makeAuthorizedRequest<{ stories: Story[] }>(
        "/stories",
        {},
        getState().auth.accessToken,
        dispatch,
      );
      return result.stories.find((story) => story.id === storyId)?.contributors ?? [];
    } catch (error) {
      return rejectWithValue(error instanceof ApiError ? error.message : "Unable to invite collaborator.");
    }
  },
);

export const removeContributor = createAsyncThunk<
  { storyId: number; contributors: Contributor[] },
  { storyId: number; contributorId: number },
  ThunkConfig
>(
  "stories/removeContributor",
  async ({ storyId, contributorId }, { getState, dispatch, rejectWithValue }) => {
    try {
      await makeAuthorizedRequest<void>(
        `/contributors/${contributorId}`,
        { method: "DELETE" },
        getState().auth.accessToken,
        dispatch,
      );
      const result = await makeAuthorizedRequest<{ contributors: Contributor[] }>(
        `/contributors/${storyId}`,
        {},
        getState().auth.accessToken,
        dispatch,
      );
      return { storyId, contributors: result.contributors };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to remove collaborator.");
    }
  },
);

const storiesSlice = createSlice({
  name: "stories",
  initialState,
  reducers: {
    setReactions(state, action: { payload: { commentId: number; reactions: CommentReaction[] } }) {
      const comment = state.comments.find((item) => item.id === action.payload.commentId);
      if (comment) comment.reactions = action.payload.reactions;
    },
    clearStories(state) {
      state.stories = [];
      state.comments = [];
      state.revisions = [];
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchStories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStories.fulfilled, (state, action) => { state.loading = false; state.stories = action.payload; })
      .addCase(fetchStories.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? "Unable to load stories."; })
      .addCase(fetchStory.fulfilled, (state, action) => {
        const index = state.stories.findIndex((story) => story.id === action.payload.id);
        if (index >= 0) state.stories[index] = action.payload;
        else state.stories.push(action.payload);
      })
      .addCase(fetchStory.rejected, (state, action) => { state.error = action.payload ?? "Unable to sync story."; })
      .addCase(createStory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createStory.fulfilled, (state, action) => { state.loading = false; state.stories = [action.payload, ...state.stories]; })
      .addCase(createStory.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? "Unable to create story."; })
      .addCase(saveStory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(saveStory.fulfilled, (state, action) => { state.loading = false; state.stories = state.stories.map((story) => story.id === action.payload.id ? action.payload : story); })
      .addCase(saveStory.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? "Unable to save story."; })
      .addCase(deleteStory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteStory.fulfilled, (state, action) => { state.loading = false; state.stories = state.stories.filter((story) => story.id !== action.payload); state.comments = []; })
      .addCase(deleteStory.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? "Unable to delete story."; })
      .addCase(fetchComments.fulfilled, (state, action) => { state.comments = action.payload; })
      .addCase(fetchComments.rejected, (state, action) => { state.error = action.payload ?? "Unable to load notes."; })
      .addCase(fetchRevisions.fulfilled, (state, action) => { state.revisions = action.payload; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.profile = action.payload; })
      .addCase(updateProfile.fulfilled, (state, action) => { state.profile = action.payload; })
      .addCase(updateProfile.rejected, (state, action) => { state.error = action.payload ?? "Unable to update profile."; })
      .addCase(fetchRevisions.rejected, (state, action) => { state.error = action.payload ?? "Unable to load story history."; })
      .addCase(restoreRevision.rejected, (state, action) => { state.error = action.payload ?? "Unable to restore version."; })
      .addCase(updateComment.fulfilled, (state, action) => { state.comments = state.comments.map((comment) => comment.id === action.meta.arg.id ? { ...comment, content: action.meta.arg.comment_text } : comment); })
      .addCase(deleteComment.fulfilled, (state, action) => { state.comments = state.comments.filter((comment) => comment.id !== action.payload); })
      .addCase(deleteComment.rejected, (state, action) => { state.error = action.payload ?? "Unable to delete comment."; })
      .addCase(addStoryComment.fulfilled, (state, action) => { state.comments.push(action.payload); })
      .addCase(addStoryComment.rejected, (state, action) => { state.error = action.payload ?? "Unable to add note."; })
      .addCase(reactToComment.rejected, (state, action) => { state.error = action.payload ?? "Unable to save reaction."; })
      .addCase(inviteContributor.fulfilled, (state, action) => {
        const story = state.stories.find((item) => item.id === action.meta.arg.storyId);
        if (story) story.contributors = action.payload;
      })
      .addCase(inviteContributor.rejected, (state, action) => { state.error = action.payload ?? "Unable to invite collaborator."; })
      .addCase(removeContributor.fulfilled, (state, action) => {
        const story = state.stories.find((item) => item.id === action.payload.storyId);
        if (story) story.contributors = action.payload.contributors;
      })
      .addCase(removeContributor.rejected, (state, action) => { state.error = action.payload ?? "Unable to remove collaborator."; });
  },
});

export const { clearStories, setReactions } = storiesSlice.actions;
export default storiesSlice.reducer;
