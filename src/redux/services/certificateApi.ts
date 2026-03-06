import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ---------------- ENV ---------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY =
  import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

/* ---------------- Types ---------------- */

export interface Certificate {
  id?: string;
  certificate_id: string;
  name: string;
  description?: string;
  organization?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  certificate_url?: string;
  thumbnail_url?: string;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CertificateCreateRequest {
  name: string;
  description?: string;
  organization?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  certificate_url?: string;
  thumbnail_url?: string;
  is_featured?: boolean;
}

export interface CertificateUpdateRequest {
  name?: string;
  description?: string;
  organization?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  certificate_url?: string;
  thumbnail_url?: string;
  is_featured?: boolean;
}

/* ---------------- Base Query ---------------- */

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

/* ---------------- API ---------------- */

export const certificateApi = createApi({
  reducerPath: "certificateApi",
  baseQuery,
  tagTypes: ["Certificates"],

  endpoints: (builder) => ({

    getCertificates: builder.query<Certificate[], {
      skip?: number;
      limit?: number;
      search?: string;
      featured?: boolean;
    }>({
      query: (params) => ({ url: "/certificates", method: "GET", params }),
      providesTags: ["Certificates"],
    }),

    getCertificateById: builder.query<Certificate, string>({
      query: (certificateId) => ({ url: `/certificates/${certificateId}`, method: "GET" }),
    }),

    createCertificate: builder.mutation<Certificate, CertificateCreateRequest>({
      query: (body) => ({ url: "/certificates", method: "POST", body }),
      invalidatesTags: ["Certificates"],
    }),

    updateCertificate: builder.mutation<Certificate, { certificateId: string; body: CertificateUpdateRequest }>({
      query: ({ certificateId, body }) => ({ url: `/certificates/${certificateId}`, method: "PUT", body }),
      invalidatesTags: ["Certificates"],
    }),

    deleteCertificate: builder.mutation<{ message: string }, string>({
      query: (certificateId) => ({ url: `/certificates/${certificateId}`, method: "DELETE" }),
      invalidatesTags: ["Certificates"],
    }),
  }),
});

/* ---------------- Hooks ---------------- */

export const {
  useGetCertificatesQuery,
  useGetCertificateByIdQuery,
  useCreateCertificateMutation,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
} = certificateApi;