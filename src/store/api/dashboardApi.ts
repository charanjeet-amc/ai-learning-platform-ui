import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';
import type { Dashboard } from '@/types';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery,
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getDashboard: builder.query<Dashboard, void>({
      query: () => '/dashboard',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
