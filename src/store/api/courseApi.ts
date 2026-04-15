import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL ?? ''}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const courseApi = createApi({
  reducerPath: 'courseApi',
  baseQuery,
  tagTypes: ['Course', 'CourseList', 'CourseProgress'],
  endpoints: (builder) => ({
    listCourses: builder.query<import('@/types').Page<import('@/types').Course>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 12 }) => `/courses?page=${page}&size=${size}`,
      providesTags: ['CourseList'],
    }),
    searchCourses: builder.query<import('@/types').Page<import('@/types').Course>, { q: string; page?: number }>({
      query: ({ q, page = 0 }) => `/courses/search?q=${encodeURIComponent(q)}&page=${page}`,
    }),
    filterCourses: builder.query<
      import('@/types').Page<import('@/types').Course>,
      { category?: string; difficulty?: string; minDuration?: number; maxDuration?: number; q?: string; page?: number; size?: number }
    >({
      query: ({ category, difficulty, minDuration, maxDuration, q, page = 0, size = 12 }) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (difficulty) params.set('difficulty', difficulty);
        if (minDuration !== undefined) params.set('minDuration', String(minDuration));
        if (maxDuration !== undefined) params.set('maxDuration', String(maxDuration));
        if (q) params.set('q', q);
        params.set('page', String(page));
        params.set('size', String(size));
        return `/courses/filter?${params.toString()}`;
      },
      providesTags: ['CourseList'],
    }),
    getCategories: builder.query<string[], void>({
      query: () => `/courses/categories`,
    }),
    getCourse: builder.query<import('@/types').Course, string>({
      query: (id) => `/courses/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Course', id }],
    }),
    getCourseTree: builder.query<import('@/types').Course, string>({
      query: (id) => `/courses/${id}/tree`,
      providesTags: (_r, _e, id) => [{ type: 'Course', id }],
    }),
    getCourseProgress: builder.query<import('@/types').CourseProgress, string>({
      query: (id) => `/courses/${id}/progress`,
      providesTags: (_r, _e, id) => [{ type: 'CourseProgress', id }],
    }),
  }),
});

export const {
  useListCoursesQuery,
  useSearchCoursesQuery,
  useFilterCoursesQuery,
  useGetCategoriesQuery,
  useGetCourseQuery,
  useGetCourseTreeQuery,
  useGetCourseProgressQuery,
} = courseApi;
