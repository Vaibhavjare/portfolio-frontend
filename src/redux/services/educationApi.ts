import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ---------------- ENV ---------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY =
  import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

/* ---------------- Types ---------------- */

export interface Education {
  education_id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  description?: string;
  start_date: string;
  end_date?: string;
  grade?: string;
  featured?: boolean;
}

export interface EducationCreateRequest {
  institution: string;
  degree: string;
  field_of_study?: string;
  description?: string;
  start_date: string;
  end_date?: string;
  grade?: string;
  featured?: boolean;
}

export interface EducationUpdateRequest {
  institution?: string;
  degree?: string;
  field_of_study?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  grade?: string;
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

export const educationApi = createApi({
  reducerPath: "educationApi",
  baseQuery,
  tagTypes: ["Educations"],

  endpoints: (builder) => ({
    /* -------- GET EDUCATIONS -------- */

    getEducations: builder.query<
      Education[],
      { skip?: number; limit?: number; featured?: boolean }
    >({
      query: (params) => ({
        url: "/educations",
        method: "GET",
        params,
      }),
      providesTags: ["Educations"],
    }),

    /* -------- GET SINGLE EDUCATION -------- */

    getEducationById: builder.query<Education, string>({
      query: (educationId) => ({
        url: `/educations/${educationId}`,
        method: "GET",
      }),
    }),

    /* -------- CREATE EDUCATION -------- */

    createEducation: builder.mutation<
      Education,
      EducationCreateRequest
    >({
      query: (body) => ({
        url: "/educations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Educations"],
    }),

    /* -------- UPDATE EDUCATION -------- */

    updateEducation: builder.mutation<
      Education,
      { educationId: string; body: EducationUpdateRequest }
    >({
      query: ({ educationId, body }) => ({
        url: `/educations/${educationId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Educations"],
    }),

    /* -------- DELETE EDUCATION -------- */

    deleteEducation: builder.mutation<
      { message: string },
      string
    >({
      query: (educationId) => ({
        url: `/educations/${educationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Educations"],
    }),
  }),
});

/* ---------------- Hooks ---------------- */

export const {
  useGetEducationsQuery,
  useGetEducationByIdQuery,
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
} = educationApi;