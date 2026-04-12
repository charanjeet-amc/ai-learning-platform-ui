import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  aiPanelOpen: boolean;
  theme: 'light' | 'dark';
  activeConceptId: string | null;
  activeCourseId: string | null;
}

const initialState: UIState = {
  sidebarOpen: true,
  aiPanelOpen: true,
  theme: (typeof window !== 'undefined' && localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  activeConceptId: null,
  activeCourseId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleAIPanel: (state) => {
      state.aiPanelOpen = !state.aiPanelOpen;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setActiveConcept: (state, action: PayloadAction<string | null>) => {
      state.activeConceptId = action.payload;
    },
    setActiveCourse: (state, action: PayloadAction<string | null>) => {
      state.activeCourseId = action.payload;
    },
  },
});

export const { toggleSidebar, toggleAIPanel, setTheme, setActiveConcept, setActiveCourse } = uiSlice.actions;
export default uiSlice.reducer;
