import { configureStore } from '@reduxjs/toolkit';
import { courseApi } from './api/courseApi';
import { enrollmentApi } from './api/enrollmentApi';
import { authApi } from './api/authApi';
import { aiTutorApi } from './api/aiTutorApi';
import { assessmentApi } from './api/assessmentApi';
import { gamificationApi } from './api/gamificationApi';
import { dashboardApi } from './api/dashboardApi';
import { learningPathApi } from './api/learningPathApi';
import { learningHistoryApi } from './api/learningHistoryApi';
import { instructorApi } from './api/instructorApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [enrollmentApi.reducerPath]: enrollmentApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [aiTutorApi.reducerPath]: aiTutorApi.reducer,
    [assessmentApi.reducerPath]: assessmentApi.reducer,
    [gamificationApi.reducerPath]: gamificationApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [learningPathApi.reducerPath]: learningPathApi.reducer,
    [learningHistoryApi.reducerPath]: learningHistoryApi.reducer,
    [instructorApi.reducerPath]: instructorApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      courseApi.middleware,
      enrollmentApi.middleware,
      authApi.middleware,
      aiTutorApi.middleware,
      assessmentApi.middleware,
      gamificationApi.middleware,
      dashboardApi.middleware,
      learningPathApi.middleware,
      learningHistoryApi.middleware,
      instructorApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
