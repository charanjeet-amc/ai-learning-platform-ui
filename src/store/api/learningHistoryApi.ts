import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './courseApi';

export interface CourseHistoryEntry {
  courseId: string;
  courseTitle: string;
  thumbnailUrl: string | null;
  progressPercent: number;
  completed: boolean;
  enrolledAt: string;
  completedAt: string | null;
  conceptsTotal: number;
  conceptsMastered: number;
  conceptsInProgress: number;
  questionsAttempted: number;
}

export interface RecentActivityEntry {
  type: 'ENROLLMENT' | 'QUIZ_ATTEMPT' | 'CONCEPT_MASTERED' | 'COURSE_COMPLETED';
  description: string;
  timestamp: string;
  referenceId: string;
}

export interface LearningHistory {
  totalXp: number;
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalConceptsMastered: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  courses: CourseHistoryEntry[];
  recentActivity: RecentActivityEntry[];
}

export const learningHistoryApi = createApi({
  reducerPath: 'learningHistoryApi',
  baseQuery,
  tagTypes: ['LearningHistory'],
  endpoints: (builder) => ({
    getLearningHistory: builder.query<LearningHistory, void>({
      query: () => '/learning-history',
      providesTags: ['LearningHistory'],
    }),
  }),
});

export const { useGetLearningHistoryQuery } = learningHistoryApi;
