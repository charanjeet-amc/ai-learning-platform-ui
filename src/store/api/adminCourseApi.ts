import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';
import type { Course } from '@/types';

export const adminCourseApi = createApi({
  reducerPath: 'adminCourseApi',
  baseQuery,
  tagTypes: ['AdminCourses'],
  endpoints: (builder) => ({
    // Get pending courses
    getPendingCourses: builder.query<Course[], void>({
      query: () => '/admin/courses/pending',
      providesTags: ['AdminCourses'],
    }),

    // Get all courses with optional status filter
    getAdminCourses: builder.query<Course[], string | void>({
      query: (status) => status ? `/admin/courses?status=${status}` : '/admin/courses',
      providesTags: ['AdminCourses'],
    }),

    // Approve course
    approveCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/admin/courses/${courseId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminCourses'],
    }),

    // Reject course with feedback
    rejectCourse: builder.mutation<void, { courseId: string; feedback: string }>({
      query: ({ courseId, feedback }) => ({
        url: `/admin/courses/${courseId}/reject`,
        method: 'POST',
        body: { feedback },
      }),
      invalidatesTags: ['AdminCourses'],
    }),

    // Unpublish course
    unpublishCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/admin/courses/${courseId}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminCourses'],
    }),

    // Delete course (admin)
    deleteAdminCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/admin/courses/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminCourses'],
    }),
  }),
});

export const {
  useGetPendingCoursesQuery,
  useGetAdminCoursesQuery,
  useApproveCourseMutation,
  useRejectCourseMutation,
  useUnpublishCourseMutation,
  useDeleteAdminCourseMutation,
} = adminCourseApi;
