import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';
import type { AITutorRequest, AITutorResponse } from '@/types';

export const aiTutorApi = createApi({
  reducerPath: 'aiTutorApi',
  baseQuery,
  endpoints: (builder) => ({
    chat: builder.mutation<AITutorResponse, AITutorRequest>({
      query: (body) => ({
        url: '/tutor/chat',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useChatMutation } = aiTutorApi;
