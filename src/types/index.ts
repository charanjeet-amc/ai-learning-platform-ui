// ==================== Enums ====================
export type DifficultyLevel = 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED';
export type ContentType = 'TEXT' | 'VIDEO' | 'INTERACTIVE' | 'CODE_EXERCISE' | 'DIAGRAM' | 'QUIZ' | 'SIMULATION' | 'AUDIO';
export type ConceptStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'STRUGGLING' | 'MASTERED' | 'REVIEW_NEEDED';
export type QuestionType = 'MCQ' | 'CODING' | 'SUBJECTIVE' | 'SCENARIO_BASED';
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
  courseId: string;
  conceptId: string;
  query: string;
  sessionId?: string;
}

export interface AITutorResponse {
  message: string;
  sessionId: string;
  responseType: string;
  hintLevel: number;
  conceptId: string;
  suggestedAction: string;
}

// ==================== Assessment ====================
export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  difficulty: DifficultyLevel;
  metadata: Record<string, unknown>;
  conceptId?: string;
  aiGenerated?: boolean;
}

export interface SubmitAnswerRequest {
  questionId: string;
  answer: Record<string, unknown>;
  timeTakenSeconds?: number;
  hintsUsed?: number;
}

export interface AnswerResult {
  attemptId: string;
  correct: boolean;
  score: number;
  explanation: string;
  feedback: string;
  updatedMastery: number;
  nextAction: string;
  xpEarned: number;
  nextConceptId?: string;
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

// ==================== Learning Path ====================
export interface LearningPathStep {
  stepIndex: number;
  conceptId: string;
  conceptTitle: string;
  difficulty: DifficultyLevel;
  status: ConceptStatus;
  masteryLevel: number;
  reason: string;
}

export interface LearningPath {
  courseId: string;
  courseTitle: string;
  steps: LearningPathStep[];
  totalSteps: number;
  completedSteps: number;
  nextConceptId?: string;
  nextConceptTitle?: string;
}

// ==================== Review Queue ====================
export interface ReviewItem {
  userId: string;
  conceptId: string;
  conceptTitle: string;
  masteryLevel: number;
  confidenceScore: number;
  attempts: number;
  status: ConceptStatus;
  fastTracked: boolean;
  nextReviewAt: string;
}
