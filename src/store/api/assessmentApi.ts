import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';
import type { Question, SubmitAnswerRequest, AnswerResult } from '@/types';

export const assessmentApi = createApi({
  reducerPath: 'assessmentApi',
  baseQuery,
  tagTypes: ['Questions'],
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
    }),
    getDiagnosticTest: builder.query<Question[], string>({
      query: (moduleId) => `/assessment/modules/${moduleId}/diagnostic`,
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useSubmitAnswerMutation,
  useGetDiagnosticTestQuery,
} = assessmentApi;
