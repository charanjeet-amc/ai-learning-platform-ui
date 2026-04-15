import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';
import type { AuthResponse } from './authTypes';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface OAuth2CodePayload {
  code: string;
  redirectUri: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (body) => ({
        url: '/public/auth/login',
        method: 'POST',
        body,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({
        url: '/public/auth/register',
        method: 'POST',
        body,
      }),
    }),
    registerInstructor: builder.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({
        url: '/public/auth/register-instructor',
        method: 'POST',
        body,
      }),
    }),
    oauth2Google: builder.mutation<AuthResponse, OAuth2CodePayload>({
      query: (body) => ({
        url: '/public/auth/oauth2/google',
        method: 'POST',
        body,
      }),
    }),
    oauth2Github: builder.mutation<AuthResponse, OAuth2CodePayload>({
      query: (body) => ({
        url: '/public/auth/oauth2/github',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRegisterInstructorMutation,
  useOauth2GoogleMutation,
  useOauth2GithubMutation,
} = authApi;
