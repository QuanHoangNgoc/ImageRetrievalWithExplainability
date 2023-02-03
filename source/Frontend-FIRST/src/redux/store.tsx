import { configureStore } from "@reduxjs/toolkit";
import searchSlice from "./reducers/searchSlice";
export const store = configureStore({
  reducer: {
    searchManager: searchSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
