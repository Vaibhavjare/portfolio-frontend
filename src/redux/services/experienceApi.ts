import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ---------------- ENV ---------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY =
  import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

/* ---------------- Types ---------------- */

export interface Experience {
  experience_id: string;
  company: string;
  position: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  featured?: boolean;
}

export interface ExperienceCreateRequest {
  company: string;
  position: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  featured?: boolean;
}

export interface ExperienceUpdateRequest {
  company?: string;
  position?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
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

export const experienceApi = createApi({
  reducerPath: "experienceApi",
  baseQuery,
  tagTypes: ["Experiences"],

  endpoints: (builder) => ({
    /* -------- GET EXPERIENCES -------- */

    getExperiences: builder.query<
      Experience[],
      {
        skip?: number;
        limit?: number;
        search?: string;
        featured?: boolean;
      }
    >({
      query: (params) => ({
        url: "/experiences",
        method: "GET",
        params,
      }),
      providesTags: ["Experiences"],
    }),

    /* -------- GET SINGLE EXPERIENCE -------- */

    getExperienceById: builder.query<Experience, string>({
      query: (experienceId) => ({
        url: `/experiences/${experienceId}`,
        method: "GET",
      }),
    }),

    /* -------- CREATE EXPERIENCE -------- */

    createExperience: builder.mutation<
      Experience,
      ExperienceCreateRequest
    >({
      query: (body) => ({
        url: "/experiences",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Experiences"],
    }),

    /* -------- UPDATE EXPERIENCE -------- */

    updateExperience: builder.mutation<
      Experience,
      { experienceId: string; body: ExperienceUpdateRequest }
    >({
      query: ({ experienceId, body }) => ({
        url: `/experiences/${experienceId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Experiences"],
    }),

    /* -------- DELETE EXPERIENCE -------- */

    deleteExperience: builder.mutation<
      { message: string },
      string
    >({
      query: (experienceId) => ({
        url: `/experiences/${experienceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Experiences"],
    }),
  }),
});

/* ---------------- Hooks ---------------- */

export const {
  useGetExperiencesQuery,
  useGetExperienceByIdQuery,
  useCreateExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
} = experienceApi;