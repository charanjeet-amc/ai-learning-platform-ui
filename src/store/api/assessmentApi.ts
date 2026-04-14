import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';
import type { Question, SubmitAnswerRequest, AnswerResult, ReviewItem } from '@/types';

export const assessmentApi = createApi({
  reducerPath: 'assessmentApi',
  baseQuery,
  tagTypes: ['Questions', 'ReviewQueue'],
  endpoints: (builder) => ({
    getQuestions: builder.query<Question[], string>({
      query: (conceptId) => `/assessment/concepts/${conceptId}/questions`,
      providesTags: (_r, _e, id) => [{ type: 'Questions', id }],
    }),
    submitAnswer: builder.mutation<AnswerResult, SubmitAnswerRequest>({
      query: (body) => ({
        url: '/assessment/submit',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReviewQueue'],
    }),
    getDiagnosticTest: builder.query<Question[], string>({
      query: (moduleId) => `/assessment/modules/${moduleId}/diagnostic`,
    }),
    getReviewQueue: builder.query<ReviewItem[], void>({
      query: () => '/assessment/review-queue',
      providesTags: ['ReviewQueue'],
    }),
    generateAIQuestions: builder.mutation<Question[], string>({
      query: (conceptId) => ({
        url: `/assessment/concepts/${conceptId}/generate`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Questions', id }],
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useSubmitAnswerMutation,
  useGetDiagnosticTestQuery,
  useGetReviewQueueQuery,
  useGenerateAIQuestionsMutation,
} = assessmentApi;
