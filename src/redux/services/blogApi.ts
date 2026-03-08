import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ---------------- ENV ---------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY =
  import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

/* ---------------- Types ---------------- */

export interface Blog {
  blog_id: string;
  title: string;
  content: string;
  summary?: string;
  cover_image?: string;
  author?: string;
  tags?: string[];
  featured?: boolean;
  created_at?: string;
}

export interface BlogCreateRequest {
  title: string;
  content: string;
  summary?: string;
  cover_image?: string;
  author?: string;
  tags?: string[];
  featured?: boolean;
}

export interface BlogUpdateRequest {
  title?: string;
  content?: string;
  summary?: string;
  cover_image?: string;
  author?: string;
  tags?: string[];
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

export const blogApi = createApi({
  reducerPath: "blogApi",
  baseQuery,
  tagTypes: ["Blogs"],

  endpoints: (builder) => ({
    /* -------- GET BLOGS -------- */

    getBlogs: builder.query<
      Blog[],
      { skip?: number; limit?: number; featured?: boolean }
    >({
      query: (params) => ({
        url: "/blogs",
        method: "GET",
        params,
      }),
      providesTags: ["Blogs"],
    }),

    /* -------- GET SINGLE BLOG -------- */

    getBlogById: builder.query<Blog, string>({
      query: (blogId) => ({
        url: `/blogs/${blogId}`,
        method: "GET",
      }),
    }),

    /* -------- CREATE BLOG -------- */

    createBlog: builder.mutation<
      Blog,
      BlogCreateRequest
    >({
      query: (body) => ({
        url: "/blogs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Blogs"],
    }),

    /* -------- UPDATE BLOG -------- */

    updateBlog: builder.mutation<
      Blog,
      { blogId: string; body: BlogUpdateRequest }
    >({
      query: ({ blogId, body }) => ({
        url: `/blogs/${blogId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Blogs"],
    }),

    /* -------- DELETE BLOG -------- */

    deleteBlog: builder.mutation<
      { message: string },
      string
    >({
      query: (blogId) => ({
        url: `/blogs/${blogId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blogs"],
    }),
  }),
});

/* ---------------- Hooks ---------------- */

export const {
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;