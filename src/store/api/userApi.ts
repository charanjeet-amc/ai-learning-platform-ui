import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  subscriptionTier: string;
  hasPassword: boolean;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: string | null;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => '/users/me',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<UserProfile, { displayName?: string; avatarUrl?: string; bio?: string }>({
      query: (body) => ({ url: '/users/me', method: 'PUT', body }),
      invalidatesTags: ['Profile'],
    }),
    changePassword: builder.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: '/users/me/password', method: 'PUT', body }),
    }),
    deleteAccount: builder.mutation<{ message: string }, { password?: string }>({
      query: (body) => ({ url: '/users/me', method: 'DELETE', body }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = userApi;
