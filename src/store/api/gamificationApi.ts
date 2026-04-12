import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';
import type { Badge, LeaderboardEntry } from '@/types';

export const gamificationApi = createApi({
  reducerPath: 'gamificationApi',
  baseQuery,
  tagTypes: ['Badges', 'Leaderboard', 'XP'],
  endpoints: (builder) => ({
    getMyBadges: builder.query<Badge[], void>({
      query: () => '/gamification/badges',
      providesTags: ['Badges'],
    }),
    getLeaderboard: builder.query<LeaderboardEntry[], number | void>({
      query: (limit = 50) => `/gamification/leaderboard?limit=${limit}`,
      providesTags: ['Leaderboard'],
    }),
    getMyXP: builder.query<number, void>({
      query: () => '/gamification/xp',
      providesTags: ['XP'],
    }),
  }),
});

export const {
  useGetMyBadgesQuery,
  useGetLeaderboardQuery,
  useGetMyXPQuery,
} = gamificationApi;
