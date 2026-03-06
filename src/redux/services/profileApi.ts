import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ---------------- ENV ---------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY =
  import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

/* ---------------- Types ---------------- */

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
}

export interface ProfileResponse {
  user_id: string;

  full_name?: string;
  title?: string;
  objective?: string;
  bio?: string;

  experience_years?: number;
  skills_summary?: string;

  email: string;
  phone?: string;
  location?: string;

  profile_photo?: string;
  cover_image?: string;
  resume_url?: string;

  social_links?: SocialLinks;
}

export interface ProfileUpdateRequest {
  full_name?: string;
  title?: string;
  objective?: string;
  bio?: string;

  experience_years?: number;
  skills_summary?: string;

  phone?: string;
  location?: string;

  social_links?: SocialLinks;
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

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery,
  tagTypes: ["Profile"],

  endpoints: (builder) => ({
    /* -------- GET PUBLIC PROFILE -------- */

    getProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),

    /* -------- UPDATE PROFILE -------- */

    updateProfile: builder.mutation<
      ProfileResponse,
      { userId: string; body: ProfileUpdateRequest }
    >({
      query: ({ userId, body }) => ({
        url: `/profile/${userId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),

    /* -------- UPLOAD PROFILE PHOTO -------- */

    uploadProfilePhoto: builder.mutation<
      ProfileResponse,
      { userId: string; file: File }
    >({
      query: ({ userId, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/profile/${userId}/profile-photo`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["Profile"],
    }),

    /* -------- UPLOAD RESUME -------- */

    uploadResume: builder.mutation<
      ProfileResponse,
      { userId: string; file: File }
    >({
      query: ({ userId, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/profile/${userId}/resume`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["Profile"],
    }),

    /* -------- UPLOAD COVER IMAGE -------- */

    uploadCoverImage: builder.mutation<
      ProfileResponse,
      { userId: string; file: File }
    >({
      query: ({ userId, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/profile/${userId}/cover-image`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["Profile"],
    }),
  }),
});

/* ---------------- Hooks ---------------- */

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfilePhotoMutation,
  useUploadResumeMutation,
  useUploadCoverImageMutation,
} = profileApi;