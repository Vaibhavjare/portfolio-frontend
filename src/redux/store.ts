import { configureStore } from "@reduxjs/toolkit";

/* ---------------- Slices ---------------- */

import authReducer from "./slices/authSlice";

/* ---------------- APIs ---------------- */

import { authApi } from "./services/authApi";
import { profileApi } from "./services/profileApi";
import { projectApi } from "./services/projectApi";
import { skillApi } from "./services/skillApi";
import { certificateApi } from "./services/certificateApi";
import { contactApi } from "./services/contactApi";

import { experienceApi } from "./services/experienceApi";
import { educationApi } from "./services/educationApi";
import { achievementApi } from "./services/achievementApi";
import { analyticsApi } from "./services/analyticsApi";
import { blogApi } from "./services/blogApi";
import { testimonialApi } from "./services/testimonialApi";

/* ---------------- Store ---------------- */

export const store = configureStore({
  reducer: {
    auth: authReducer,

    /* RTK Query Reducers */

    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [skillApi.reducerPath]: skillApi.reducer,
    [certificateApi.reducerPath]: certificateApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,

    [experienceApi.reducerPath]: experienceApi.reducer,
    [educationApi.reducerPath]: educationApi.reducer,
    [achievementApi.reducerPath]: achievementApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [blogApi.reducerPath]: blogApi.reducer,
    [testimonialApi.reducerPath]: testimonialApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      profileApi.middleware,
      projectApi.middleware,
      skillApi.middleware,
      certificateApi.middleware,
      contactApi.middleware,

      experienceApi.middleware,
      educationApi.middleware,
      achievementApi.middleware,
      analyticsApi.middleware,
      blogApi.middleware,
      testimonialApi.middleware
    ),
});

/* ---------------- Types ---------------- */

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;