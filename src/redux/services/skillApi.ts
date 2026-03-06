import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ---------------- ENV ---------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY =
  import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

/* ---------------- Types ---------------- */

export type ProficiencyLevel =
  | "Beginner"
  | "Elementary"
  | "Intermediate"
  | "Advanced"
  | "Expert";

export interface Skill {
  skill_id: string;
  name: string;
  description?: string;
  rating?: number;                      // 0–10
  proficiency_level?: ProficiencyLevel;
  category?: string;
  years_of_experience?: number;
  icon_url?: string;
  color?: string;
  tags?: string[];
  featured?: boolean;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SkillCreateRequest {
  name: string;
  description?: string;
  rating?: number;
  proficiency_level?: ProficiencyLevel;
  category?: string;
  years_of_experience?: number;
  icon_url?: string;
  color?: string;
  tags?: string[];
  featured?: boolean;
  display_order?: number;
  is_active?: boolean;
}

export interface SkillUpdateRequest {
  name?: string;
  description?: string;
  rating?: number;
  proficiency_level?: ProficiencyLevel;
  category?: string;
  years_of_experience?: number;
  icon_url?: string;
  color?: string;
  tags?: string[];
  featured?: boolean;
  display_order?: number;
  is_active?: boolean;
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

export const skillApi = createApi({
  reducerPath: "skillApi",
  baseQuery,
  tagTypes: ["Skills"],

  endpoints: (builder) => ({

    getSkills: builder.query<Skill[], {
      skip?: number;
      limit?: number;
      category?: string;
      featured?: boolean;
      search?: string;
      sort_by?: string;
      order?: string;
    }>({
      query: (params) => ({ url: "/skills", method: "GET", params }),
      providesTags: ["Skills"],
    }),

    getSkillById: builder.query<Skill, string>({
      query: (skillId) => ({ url: `/skills/${skillId}`, method: "GET" }),
    }),

    createSkill: builder.mutation<Skill, SkillCreateRequest>({
      query: (body) => ({ url: "/skills", method: "POST", body }),
      invalidatesTags: ["Skills"],
    }),

    updateSkill: builder.mutation<Skill, { skillId: string; body: SkillUpdateRequest }>({
      query: ({ skillId, body }) => ({ url: `/skills/${skillId}`, method: "PUT", body }),
      invalidatesTags: ["Skills"],
    }),

    deleteSkill: builder.mutation<{ message: string }, string>({
      query: (skillId) => ({ url: `/skills/${skillId}`, method: "DELETE" }),
      invalidatesTags: ["Skills"],
    }),
  }),
});

export const {
  useGetSkillsQuery,
  useGetSkillByIdQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} = skillApi;