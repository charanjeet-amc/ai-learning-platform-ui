import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';

export interface InstructorApplication {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  headline: string | null;
  cvUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  yearsTeaching: number | null;
  currentInstitution: string | null;
  teachingDescription: string | null;
  youtubeChannelUrl: string | null;
  youtubeSubscribers: number | null;
  otherPlatforms: string | null;
  expertise: string | null;
  whyTeach: string | null;
  bio: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string | null;
  reviewedAt: string | null;
}

export interface ApplicationSubmission {
  headline?: string;
  photoUrl?: string;
  bio?: string;
  cvUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  yearsTeaching?: number;
  currentInstitution?: string;
  teachingDescription?: string;
  youtubeChannelUrl?: string;
  youtubeSubscribers?: number;
  otherPlatforms?: string;
  expertise?: string;
  whyTeach?: string;
}

export interface ApplicationSummary {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  headline: string | null;
  expertise: string | null;
  yearsTeaching: number | null;
  status: string;
  createdAt: string | null;
}

export const instructorApplicationApi = createApi({
  reducerPath: 'instructorApplicationApi',
  baseQuery,
  tagTypes: ['Application', 'ApplicationList'],
  endpoints: (builder) => ({
    getMyApplication: builder.query<InstructorApplication, void>({
      query: () => '/instructor-application',
      providesTags: ['Application'],
    }),
    submitApplication: builder.mutation<InstructorApplication, ApplicationSubmission>({
      query: (body) => ({
        url: '/instructor-application',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Application'],
    }),
    // Admin endpoints
    listApplications: builder.query<ApplicationSummary[], string>({
      query: (status = 'PENDING') => `/admin/instructor-applications?status=${status}`,
      providesTags: ['ApplicationList'],
    }),
    getApplicationDetail: builder.query<InstructorApplication, string>({
      query: (id) => `/admin/instructor-applications/${id}`,
    }),
    approveApplication: builder.mutation<{ message: string }, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/admin/instructor-applications/${id}/approve`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['ApplicationList'],
    }),
    rejectApplication: builder.mutation<{ message: string }, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/admin/instructor-applications/${id}/reject`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['ApplicationList'],
    }),
  }),
});

export const {
  useGetMyApplicationQuery,
  useSubmitApplicationMutation,
  useListApplicationsQuery,
  useGetApplicationDetailQuery,
  useApproveApplicationMutation,
  useRejectApplicationMutation,
} = instructorApplicationApi;
