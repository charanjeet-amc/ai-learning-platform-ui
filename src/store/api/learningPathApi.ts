import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';
import type { LearningPath } from '@/types';

export const learningPathApi = createApi({
  reducerPath: 'learningPathApi',
  baseQuery,
  tagTypes: ['LearningPath'],
  endpoints: (builder) => ({
    getLearningPath: builder.query<LearningPath, string>({
      query: (courseId) => `/learning-path/courses/${courseId}`,
      providesTags: (_r, _e, id) => [{ type: 'LearningPath', id }],
    }),
    getNextConcept: builder.query<{ courseId: string; nextConceptId: string }, string>({
      query: (courseId) => `/learning-path/courses/${courseId}/next`,
    }),
  }),
});

export const {
  useGetLearningPathQuery,
  useGetNextConceptQuery,
} = learningPathApi;
