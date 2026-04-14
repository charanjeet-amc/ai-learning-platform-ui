import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';
import type { Course } from '@/types';
import type { AuthResponse } from './authTypes';

export const instructorApi = createApi({
  reducerPath: 'instructorApi',
  baseQuery,
  tagTypes: ['InstructorCourses', 'InstructorCourse'],
  endpoints: (builder) => ({
    // Get all courses by this instructor
    getMyCourses: builder.query<Course[], void>({
      query: () => '/instructor/courses',
      providesTags: ['InstructorCourses'],
    }),

    // Get single course with full tree
    getInstructorCourse: builder.query<Course, string>({
      query: (id) => `/instructor/courses/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'InstructorCourse', id }],
    }),

    // Create a new course (metadata only)
    createCourse: builder.mutation<Course, {
      title: string;
      description?: string;
      shortDescription?: string;
      difficulty?: string;
      industryVertical?: string;
      tags?: string[];
      prerequisites?: string;
      price?: number;
    }>({
      query: (body) => ({
        url: '/instructor/courses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['InstructorCourses'],
    }),

    // Update course metadata
    updateCourse: builder.mutation<Course, { courseId: string; data: Record<string, unknown> }>({
      query: ({ courseId, data }) => ({
        url: `/instructor/courses/${courseId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_r, _e, { courseId }) => [
        'InstructorCourses',
        { type: 'InstructorCourse', id: courseId },
      ],
    }),

    // Publish / unpublish
    publishCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/instructor/courses/${courseId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: ['InstructorCourses'],
    }),
    unpublishCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/instructor/courses/${courseId}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: ['InstructorCourses'],
    }),

    // Delete course
    deleteCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/instructor/courses/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['InstructorCourses'],
    }),

    // Import course from document
    importCourse: builder.mutation<Course, FormData>({
      query: (formData) => ({
        url: '/instructor/courses/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['InstructorCourses'],
    }),

    // Import content into existing course
    importContent: builder.mutation<Course, { courseId: string; formData: FormData }>({
      query: ({ courseId, formData }) => ({
        url: `/instructor/courses/${courseId}/import-content`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_r, _e, { courseId }) => [
        'InstructorCourses',
        { type: 'InstructorCourse', id: courseId },
      ],
    }),

    // Upload media
    uploadMedia: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/instructor/upload',
        method: 'POST',
        body: formData,
      }),
    }),

    // Module CRUD
    addModule: builder.mutation<{ id: string; title: string; orderIndex: number }, { courseId: string; title: string; description?: string; orderIndex?: number }>({
      query: ({ courseId, ...body }) => ({
        url: `/instructor/courses/${courseId}/modules`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { courseId }) => [{ type: 'InstructorCourse', id: courseId }],
    }),
    updateModule: builder.mutation<{ id: string; title: string }, { moduleId: string; title: string; description?: string; orderIndex?: number }>({
      query: ({ moduleId, ...body }) => ({
        url: `/instructor/modules/${moduleId}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteModule: builder.mutation<void, { moduleId: string; courseId: string }>({
      query: ({ moduleId }) => ({
        url: `/instructor/modules/${moduleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { courseId }) => [{ type: 'InstructorCourse', id: courseId }],
    }),

    // Topic CRUD
    addTopic: builder.mutation<{ id: string; title: string; orderIndex: number }, { moduleId: string; title: string; orderIndex?: number }>({
      query: ({ moduleId, ...body }) => ({
        url: `/instructor/modules/${moduleId}/topics`,
        method: 'POST',
        body,
      }),
    }),
    deleteTopic: builder.mutation<void, { topicId: string }>({
      query: ({ topicId }) => ({
        url: `/instructor/topics/${topicId}`,
        method: 'DELETE',
      }),
    }),

    // Concept CRUD
    addConcept: builder.mutation<{ id: string; title: string; orderIndex: number }, { topicId: string; title: string; definition?: string; content?: string; difficultyLevel?: string }>({
      query: ({ topicId, ...body }) => ({
        url: `/instructor/topics/${topicId}/concepts`,
        method: 'POST',
        body,
      }),
    }),
    updateConcept: builder.mutation<{ id: string; title: string }, { conceptId: string; title: string; definition?: string; content?: string; difficultyLevel?: string }>({
      query: ({ conceptId, ...body }) => ({
        url: `/instructor/concepts/${conceptId}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteConcept: builder.mutation<void, { conceptId: string }>({
      query: ({ conceptId }) => ({
        url: `/instructor/concepts/${conceptId}`,
        method: 'DELETE',
      }),
    }),

    // Become instructor
    becomeInstructor: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/auth/become-instructor',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetMyCoursesQuery,
  useGetInstructorCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  usePublishCourseMutation,
  useUnpublishCourseMutation,
  useDeleteCourseMutation,
  useImportCourseMutation,
  useImportContentMutation,
  useUploadMediaMutation,
  useAddModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  useAddTopicMutation,
  useDeleteTopicMutation,
  useAddConceptMutation,
  useUpdateConceptMutation,
  useDeleteConceptMutation,
  useBecomeInstructorMutation,
} = instructorApi;
