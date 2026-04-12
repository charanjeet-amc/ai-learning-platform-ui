import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';
import type { EnrolledCourse } from '@/types';

export const enrollmentApi = createApi({
  reducerPath: 'enrollmentApi',
  baseQuery,
  tagTypes: ['Enrollment'],
  endpoints: (builder) => ({
    getMyEnrollments: builder.query<EnrolledCourse[], void>({
      query: () => '/enrollments',
      providesTags: ['Enrollment'],
    }),
    isEnrolled: builder.query<boolean, string>({
      query: (courseId) => `/enrollments/${courseId}/status`,
      providesTags: (_r, _e, id) => [{ type: 'Enrollment', id }],
    }),
    enroll: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/enrollments/${courseId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Enrollment'],
    }),
    unenroll: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/enrollments/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Enrollment'],
    }),
  }),
});

export const {
  useGetMyEnrollmentsQuery,
  useIsEnrolledQuery,
  useEnrollMutation,
  useUnenrollMutation,
} = enrollmentApi;
