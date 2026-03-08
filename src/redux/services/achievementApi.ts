import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ---------------- ENV ---------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY =
  import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

/* ---------------- Types ---------------- */

export interface Achievement {
  achievement_id: string;
  title: string;
  organization?: string;
  description?: string;
  date?: string;
  certificate_url?: string;
  featured?: boolean;
}

export interface AchievementCreateRequest {
  title: string;
  organization?: string;
  description?: string;
  date?: string;
  certificate_url?: string;
  featured?: boolean;
}

export interface AchievementUpdateRequest {
  title?: string;
  organization?: string;
  description?: string;
  date?: string;
  certificate_url?: string;
  featured?: boolean;
}

/* ---------------- Base Query ---------------- */

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,

  prepareHeaders: (headers) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

/* ---------------- API ---------------- */

export const achievementApi = createApi({
  reducerPath: "achievementApi",
  baseQuery,
  tagTypes: ["Achievements"],

  endpoints: (builder) => ({
    /* -------- GET ACHIEVEMENTS -------- */

    getAchievements: builder.query<
      Achievement[],
      { skip?: number; limit?: number; featured?: boolean }
    >({
      query: (params) => ({
        url: "/achievements",
        method: "GET",
        params,
      }),
      providesTags: ["Achievements"],
    }),

    /* -------- GET SINGLE ACHIEVEMENT -------- */

    getAchievementById: builder.query<Achievement, string>({
      query: (achievementId) => ({
        url: `/achievements/${achievementId}`,
        method: "GET",
      }),
    }),

    /* -------- CREATE ACHIEVEMENT -------- */

    createAchievement: builder.mutation<
      Achievement,
      AchievementCreateRequest
    >({
      query: (body) => ({
        url: "/achievements",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Achievements"],
    }),

    /* -------- UPDATE ACHIEVEMENT -------- */

    updateAchievement: builder.mutation<
      Achievement,
      { achievementId: string; body: AchievementUpdateRequest }
    >({
      query: ({ achievementId, body }) => ({
        url: `/achievements/${achievementId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Achievements"],
    }),

    /* -------- DELETE ACHIEVEMENT -------- */

    deleteAchievement: builder.mutation<
      { message: string },
      string
    >({
      query: (achievementId) => ({
        url: `/achievements/${achievementId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Achievements"],
    }),
  }),
});

/* ---------------- Hooks ---------------- */

export const {
  useGetAchievementsQuery,
  useGetAchievementByIdQuery,
  useCreateAchievementMutation,
  useUpdateAchievementMutation,
  useDeleteAchievementMutation,
} = achievementApi;