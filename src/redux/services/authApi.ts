import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ---------------- ENV ---------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY =
  import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

/* ---------------- Types ---------------- */

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface RoleUpdateRequest {
  email: string;
  role: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface MessageResponse {
  message: string;
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

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,

  endpoints: (builder) => ({
    /* -------- LOGIN -------- */

    login: builder.mutation<TokenResponse, LoginRequest>({
      query: ({ email, password }) => {
        const formData = new URLSearchParams();

        formData.append("username", email); // FastAPI expects username
        formData.append("password", password);

        return {
          url: "/auth/login",
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        };
      },

      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // store JWT
          localStorage.setItem(TOKEN_KEY, data.access_token);
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),

    /* -------- REGISTER -------- */

    register: builder.mutation<MessageResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    /* -------- UPDATE ROLE -------- */

    updateRole: builder.mutation<MessageResponse, RoleUpdateRequest>({
      query: (body) => ({
        url: "/auth/update-role",
        method: "PUT",
        body,
      }),
    }),
  }),
});

/* ---------------- Hooks ---------------- */

export const {
  useLoginMutation,
  useRegisterMutation,
  useUpdateRoleMutation,
} = authApi;