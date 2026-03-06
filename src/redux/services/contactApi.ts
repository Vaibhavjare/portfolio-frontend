import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ---------------- ENV ---------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY =
  import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

/* ---------------- Types ---------------- */

export interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  subject?: string;
  created_at?: string;
}

export interface ContactCreateRequest {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

export interface ContactUpdateRequest {
  name?: string;
  email?: string;
  message?: string;
  subject?: string;
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

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery,
  tagTypes: ["Contacts"],

  endpoints: (builder) => ({
    /* -------- CREATE CONTACT (PUBLIC) -------- */

    createContact: builder.mutation<Contact, ContactCreateRequest>({
      query: (body) => ({
        url: "/contacts",
        method: "POST",
        body,
      }),
    }),

    /* -------- GET CONTACTS (ADMIN) -------- */

    getContacts: builder.query<
      Contact[],
      { skip?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/contacts",
        method: "GET",
        params,
      }),
      providesTags: ["Contacts"],
    }),

    /* -------- GET SINGLE CONTACT -------- */

    getContactById: builder.query<Contact, string>({
      query: (contactId) => ({
        url: `/contacts/${contactId}`,
        method: "GET",
      }),
    }),

    /* -------- UPDATE CONTACT -------- */

    updateContact: builder.mutation<
      Contact,
      { contactId: string; body: ContactUpdateRequest }
    >({
      query: ({ contactId, body }) => ({
        url: `/contacts/${contactId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Contacts"],
    }),

    /* -------- DELETE CONTACT -------- */

    deleteContact: builder.mutation<{ message: string }, string>({
      query: (contactId) => ({
        url: `/contacts/${contactId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contacts"],
    }),
  }),
});

/* ---------------- Hooks ---------------- */

export const {
  useCreateContactMutation,
  useGetContactsQuery,
  useGetContactByIdQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi;