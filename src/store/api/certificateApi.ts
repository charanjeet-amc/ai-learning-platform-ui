import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';
import type { Certificate } from '@/types';

export const certificateApi = createApi({
  reducerPath: 'certificateApi',
  baseQuery,
  tagTypes: ['Certificate'],
  endpoints: (builder) => ({
    generateCertificate: builder.mutation<Certificate, string>({
      query: (courseId) => ({
        url: `/certificates/courses/${courseId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Certificate'],
    }),
    getMyCertificates: builder.query<Certificate[], void>({
      query: () => '/certificates/my',
      providesTags: ['Certificate'],
    }),
    verifyCertificate: builder.query<Certificate, string>({
      query: (verificationCode) => `/public/certificates/${verificationCode}`,
    }),
  }),
});

export const {
  useGenerateCertificateMutation,
  useGetMyCertificatesQuery,
  useVerifyCertificateQuery,
} = certificateApi;
