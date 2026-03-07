import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ---------------- ENV ---------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY =
  import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

/* ---------------- Types ---------------- */

export interface TechStack {
  programming_languages?: string[];
  frameworks?: string[];
  databases?: string[];
  tools?: string[];
}

export interface Project {
  project_id: string;
  title: string;
  description?: string;
  tech_stack?: TechStack;
  github_link?: string;
  video_links?: string[];
  thumbnail_url?: string;
  live_demo_url?: string;
  featured?: boolean;
  complexity_score?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ProjectCreateRequest {
  title: string;
  description?: string;
  tech_stack?: TechStack;
  github_link?: string;
  video_links?: string[];
  thumbnail_url?: string;
  live_demo_url?: string;
  featured?: boolean;
  complexity_score?: number;
  tags?: string[];
}

export interface ProjectUpdateRequest {
  title?: string;
  description?: string;
  tech_stack?: TechStack;
  github_link?: string;
  video_links?: string[];
  thumbnail_url?: string;
  live_demo_url?: string;
  featured?: boolean;
  complexity_score?: number;
  tags?: string[];
}

export interface ProjectCountResponse {
  total: number;
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

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery,
  tagTypes: ["Projects"],

  endpoints: (builder) => ({
    /* -------- GET PROJECTS -------- */
    getProjects: builder.query<
      Project[],
      {
        skip?: number;
        limit?: number;
        search?: string;
        featured?: boolean;
        min_complexity?: number;
        max_complexity?: number;
        sort_by?: string;
        order?: string;
      }
    >({
      query: (params) => ({
        url: "/projects",
        method: "GET",
        params,
      }),
      providesTags: ["Projects"],
    }),

    /* -------- GET PROJECT COUNT -------- */
    getProjectCount: builder.query<ProjectCountResponse, { search?: string }>({
      query: (params) => ({
        url: "/projects/count",
        method: "GET",
        params,
      }),
    }),

    /* -------- GET SINGLE PROJECT -------- */
    getProjectById: builder.query<Project, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: "GET",
      }),
    }),

    /* -------- CREATE PROJECT -------- */
    createProject: builder.mutation<Project, ProjectCreateRequest>({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Projects"],
    }),

    /* -------- UPDATE PROJECT -------- */
    updateProject: builder.mutation<
      Project,
      { projectId: string; body: ProjectUpdateRequest }
    >({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Projects"],
    }),

    /* -------- DELETE PROJECT -------- */
    deleteProject: builder.mutation<{ message: string }, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),
  }),
});

/* ---------------- Hooks ---------------- */
export const {
  useGetProjectsQuery,
  useGetProjectCountQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;