import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ---------------- ENV ---------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY =
  import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

/* ---------------- Types ---------------- */

export interface Analytics {
  page: string;
  visitor_ip?: string;
  user_agent?: string;
  session_time_seconds?: number;
}

export interface AnalyticsCreateRequest {
  page: string;
  visitor_ip?: string;
  user_agent?: string;
  session_time_seconds?: number;
}

export interface AnalyticsStats {
  total_visitors: number;
  today_visitors: number;
  page_views: number;
  average_session_time_seconds: number;
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

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery,
  tagTypes: ["Analytics"],

  endpoints: (builder) => ({
    /* -------- TRACK VISIT -------- */

    trackVisit: builder.mutation<
      Analytics,
      AnalyticsCreateRequest
    >({
      query: (body) => ({
        url: "/analytics/track",
        method: "POST",
        body,
      }),
    }),

    /* -------- ADMIN STATS -------- */

    getAnalyticsStats: builder.query<AnalyticsStats, void>({
      query: () => ({
        url: "/analytics/stats",
        method: "GET",
      }),
      providesTags: ["Analytics"],
    }),
  }),
});

/* ---------------- Hooks ---------------- */

export const {
  useTrackVisitMutation,
  useGetAnalyticsStatsQuery,
} = analyticsApi;