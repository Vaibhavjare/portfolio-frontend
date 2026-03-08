import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ---------------- ENV ---------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY =
  import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

/* ---------------- Types ---------------- */

export interface Testimonial {
  testimonial_id: string;
  name: string;
  designation?: string;
  company?: string;
  message: string;
  avatar?: string;
  rating?: number;
  featured?: boolean;
  created_at?: string;
}

export interface TestimonialCreateRequest {
  name: string;
  designation?: string;
  company?: string;
  message: string;
  avatar?: string;
  rating?: number;
  featured?: boolean;
}

export interface TestimonialUpdateRequest {
  name?: string;
  designation?: string;
  company?: string;
  message?: string;
  avatar?: string;
  rating?: number;
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

export const testimonialApi = createApi({
  reducerPath: "testimonialApi",
  baseQuery,
  tagTypes: ["Testimonials"],

  endpoints: (builder) => ({
    /* -------- GET TESTIMONIALS -------- */

    getTestimonials: builder.query<
      Testimonial[],
      { skip?: number; limit?: number; featured?: boolean }
    >({
      query: (params) => ({
        url: "/testimonials",
        method: "GET",
        params,
      }),
      providesTags: ["Testimonials"],
    }),

    /* -------- GET SINGLE TESTIMONIAL -------- */

    getTestimonialById: builder.query<Testimonial, string>({
      query: (testimonialId) => ({
        url: `/testimonials/${testimonialId}`,
        method: "GET",
      }),
    }),

    /* -------- CREATE TESTIMONIAL -------- */

    createTestimonial: builder.mutation<
      Testimonial,
      TestimonialCreateRequest
    >({
      query: (body) => ({
        url: "/testimonials",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Testimonials"],
    }),

    /* -------- UPDATE TESTIMONIAL -------- */

    updateTestimonial: builder.mutation<
      Testimonial,
      { testimonialId: string; body: TestimonialUpdateRequest }
    >({
      query: ({ testimonialId, body }) => ({
        url: `/testimonials/${testimonialId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Testimonials"],
    }),

    /* -------- DELETE TESTIMONIAL -------- */

    deleteTestimonial: builder.mutation<
      { message: string },
      string
    >({
      query: (testimonialId) => ({
        url: `/testimonials/${testimonialId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Testimonials"],
    }),
  }),
});

/* ---------------- Hooks ---------------- */

export const {
  useGetTestimonialsQuery,
  useGetTestimonialByIdQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
} = testimonialApi;