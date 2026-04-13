// ==================== Enums ====================
export type DifficultyLevel = 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED';
export type ContentType = 'TEXT' | 'VIDEO' | 'INTERACTIVE' | 'CODE_EXERCISE' | 'DIAGRAM' | 'QUIZ' | 'SIMULATION' | 'AUDIO';
export type ConceptStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'STRUGGLING' | 'MASTERED' | 'REVIEW_NEEDED';
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'CODE_COMPLETION' | 'CODE_DEBUG' | 'MATCHING' | 'ORDER';
export type LearningStyle = 'VISUAL' | 'READING' | 'KINESTHETIC' | 'AUDITORY';

// ==================== Course Domain ====================
export interface Course {
  id: string;
  title: string;
  slug?: string;
  description: string;
  shortDescription: string;
  thumbnailUrl: string;
  difficulty: DifficultyLevel;
  industryVertical?: string;
  tags: string[];
  createdByName: string;
  published: boolean;
  rating: number;
  enrollmentCount: number;
  estimatedDurationMinutes: number;
  prerequisites?: string;
  skillsOutcome?: string[];
  price?: number;
  modules: Module[];
  createdAt?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  learningObjectives: string[];
  topics: Topic[];
}

export interface Topic {
  id: string;
  title: string;
  orderIndex: number;
  estimatedTimeMinutes?: number;
  tags?: string[];
  concepts: Concept[];
}

export interface Concept {
  id: string;
  title: string;
  definition: string;
  difficultyLevel: DifficultyLevel;
  orderIndex: number;
  tags?: string[];
  learningUnits: LearningUnit[];
  misconceptions?: string[];
  socraticQuestions?: string[];
  outcomes?: string[];
  dependencyIds?: string[];
}

export interface LearningUnit {
  id: string;
  title: string;
  contentType: ContentType;
  content: Record<string, unknown>;
  orderIndex: number;
  durationMinutes: number;
}

// ==================== Progress ====================
export interface UserProgress {
  conceptId: string;
  conceptTitle: string;
  masteryScore: number;
  confidence: number;
  attempts: number;
  correctAttempts: number;
  hintsUsed: number;
  status: ConceptStatus;
  timeSpentMinutes: number;
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  overallProgress: number;
  totalConcepts: number;
  masteredConcepts: number;
  inProgressConcepts: number;
  averageMastery: number;
  moduleProgresses: ModuleProgress[];
}

export interface ModuleProgress {
  moduleId: string;
  moduleTitle: string;
  progress: number;
  totalConcepts: number;
  masteredConcepts: number;
}

// ==================== AI Tutor ====================
export interface AITutorRequest {
  conceptId: string;
  message: string;
  sessionId?: string;
}

export interface AITutorResponse {
  response: string;
  sessionId: string;
  hintLevel: number;
  conceptId: string;
  masteryScore: number;
  suggestedAction: string;
}

// ==================== Assessment ====================
export interface Question {
  id: string;
  questionType: QuestionType;
  questionText: string;
  difficulty: DifficultyLevel;
  metadata: Record<string, unknown>;
}

export interface SubmitAnswerRequest {
  questionId: string;
  answer: string;
}

export interface AnswerResult {
  correct: boolean;
  explanation: string;
  masteryDelta: number;
  newMastery: number;
  xpEarned: number;
  nextAction: string;
}

// ==================== Gamification ====================
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string;
  totalXp: number;
  badgeCount: number;
}

export interface XPEvent {
  amount: number;
  reason: string;
  createdAt: string;
}

// ==================== Dashboard ====================
export interface Dashboard {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  totalCoursesEnrolled: number;
  totalConceptsMastered: number;
  totalLearningHours: number;
  recentBadges: Badge[];
  enrolledCourses: EnrolledCourse[];
  weakAreas: WeakArea[];
}

export interface EnrolledCourse {
  courseId: string;
  courseTitle: string;
  thumbnailUrl: string;
  progress: number;
  enrolledAt: string;
  lastAccessedAt?: string;
}

export interface WeakArea {
  conceptId: string;
  conceptTitle: string;
  weaknessScore: number;
  courseName: string;
}

// ==================== Pagination ====================
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
