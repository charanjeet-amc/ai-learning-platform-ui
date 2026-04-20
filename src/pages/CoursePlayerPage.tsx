import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetCourseTreeQuery } from '@/store/api/courseApi';
import { useGetQuestionsQuery } from '@/store/api/assessmentApi';
import { useGetLearningPathQuery } from '@/store/api/learningPathApi';
import CourseTree from '@/components/course/CourseTree';
import type { TreeSelection } from '@/components/course/CourseTree';
import ContentViewer from '@/components/course/ContentViewer';
import AITutorPanel from '@/components/ai-tutor/AITutorPanel';
import QuizView from '@/components/assessment/QuizView';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleAIPanel, setActiveConcept } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, PanelRightClose, PanelRightOpen, BookOpen, HelpCircle, Compass, ChevronRight, Layers, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearningUnit, Concept, Module, Topic, Course } from '@/types';

// Flat list of navigable nodes in tree order
type NavNode =
  | { type: 'module'; id: string }
  | { type: 'topic'; id: string }
  | { type: 'concept'; id: string }
  | { type: 'quiz'; conceptId: string };

function buildNavOrder(course: Course, hasQuiz: (conceptId: string) => boolean): NavNode[] {
  const nodes: NavNode[] = [];
  for (const m of course.modules) {
    nodes.push({ type: 'module', id: m.id });
    for (const t of m.topics) {
      nodes.push({ type: 'topic', id: t.id });
      for (const c of t.concepts) {
        nodes.push({ type: 'concept', id: c.id });
        if (hasQuiz(c.id)) {
          nodes.push({ type: 'quiz', conceptId: c.id });
        }
      }
    }
  }
  return nodes;
}

export default function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const dispatch = useAppDispatch();
  const aiPanelOpen = useAppSelector((s) => s.ui.aiPanelOpen);
  const activeConceptId = useAppSelector((s) => s.ui.activeConceptId);

  const { data: course, isLoading } = useGetCourseTreeQuery(courseId!);
  const { data: questions } = useGetQuestionsQuery(activeConceptId!, { skip: !activeConceptId });
  const { data: learningPath } = useGetLearningPathQuery(courseId!, { skip: !courseId });

  const [activeLearningUnit, setActiveLearningUnit] = useState<LearningUnit | null>(null);
  const [activeTab, setActiveTab] = useState('learn');
  const [selection, setSelection] = useState<TreeSelection>(null);

  // Track which concepts have quizzes (we only know for the active one via RTK query)
  // For nav, we'll check when stepping: if the concept IS the active one and has questions, show quiz
  // Otherwise we skip quiz nodes for non-active concepts

  // Find items from tree
  const findModule = useCallback((id: string): Module | null => {
    if (!course) return null;
    return course.modules.find((m) => m.id === id) ?? null;
  }, [course]);

  const findTopic = useCallback((id: string): { topic: Topic; module: Module } | null => {
    if (!course) return null;
    for (const m of course.modules) {
      for (const t of m.topics) {
        if (t.id === id) return { topic: t, module: m };
      }
    }
    return null;
  }, [course]);

  const findConcept = useCallback((): Concept | null => {
    if (!course || !activeConceptId) return null;
    for (const m of course.modules) {
      for (const t of m.topics) {
        for (const c of t.concepts) {
          if (c.id === activeConceptId) return c;
        }
      }
    }
    return null;
  }, [course, activeConceptId]);

  const activeConcept = findConcept();

  // Compute flat nav order
  const navOrder = useMemo(() => {
    if (!course) return [];
    // We don't know quiz availability for all concepts, so we include quiz nodes
    // only for the currently active concept if it has questions
    return buildNavOrder(course, (cId) => {
      if (cId === activeConceptId && questions && questions.length > 0) return true;
      return false;
    });
  }, [course, activeConceptId, questions]);

  // Find current index in nav order
  const currentNavIndex = useMemo(() => {
    if (!selection && activeTab === 'quiz' && activeConceptId) {
      return navOrder.findIndex((n) => n.type === 'quiz' && n.conceptId === activeConceptId);
    }
    if (selection?.type === 'concept') {
      return navOrder.findIndex((n) => n.type === 'concept' && n.id === selection.id);
    }
    if (selection?.type === 'topic') {
      return navOrder.findIndex((n) => n.type === 'topic' && n.id === selection.id);
    }
    if (selection?.type === 'module') {
      return navOrder.findIndex((n) => n.type === 'module' && n.id === selection.id);
    }
    return -1;
  }, [selection, activeTab, activeConceptId, navOrder]);

  const handleNext = () => {
    if (!course) return;

    // If we're on a concept and it has a quiz, show quiz first
    if (selection?.type === 'concept' && activeTab === 'learn' && questions && questions.length > 0) {
      setActiveTab('quiz');
      return;
    }

    // Find next non-quiz node in nav order
    let nextIdx = currentNavIndex + 1;
    while (nextIdx < navOrder.length) {
      const next = navOrder[nextIdx]!;
      if (next.type !== 'quiz') {
        navigateToNode(next);
        return;
      }
      nextIdx++;
    }
  };

  const navigateToNode = (node: NavNode) => {
    if (node.type === 'module') {
      setSelection({ type: 'module', id: node.id });
      dispatch(setActiveConcept(''));
      setActiveLearningUnit(null);
      setActiveTab('learn');
    } else if (node.type === 'topic') {
      setSelection({ type: 'topic', id: node.id });
      dispatch(setActiveConcept(''));
      setActiveLearningUnit(null);
      setActiveTab('learn');
    } else if (node.type === 'concept') {
      setSelection({ type: 'concept', id: node.id });
      dispatch(setActiveConcept(node.id));
      setActiveLearningUnit(null);
      setActiveTab('learn');
    }
  };

  const handleTreeSelect = (sel: TreeSelection) => {
    setSelection(sel);
    if (sel?.type === 'concept') {
      dispatch(setActiveConcept(sel.id));
    } else {
      dispatch(setActiveConcept(''));
    }
    setActiveLearningUnit(null);
    setActiveTab('learn');
  };

  const isLastNode = currentNavIndex >= 0 && currentNavIndex >= navOrder.length - 1;
  // Also check if we're on the last concept and showing quiz
  const isAtEnd = isLastNode || (activeTab === 'quiz' && (() => {
    let nextIdx = currentNavIndex + 1;
    while (nextIdx < navOrder.length) {
      if (navOrder[nextIdx]!.type !== 'quiz') return false;
      nextIdx++;
    }
    return true;
  })());

  // Determine what the Next button label should be
  const getNextLabel = (): string => {
    if (!course || currentNavIndex < 0) return 'Next';
    if (selection?.type === 'concept' && activeTab === 'learn' && questions && questions.length > 0) {
      return 'Take Quiz';
    }
    let nextIdx = currentNavIndex + 1;
    while (nextIdx < navOrder.length) {
      const next = navOrder[nextIdx]!;
      if (next.type !== 'quiz') {
        if (next.type === 'module') return `Next Module`;
        if (next.type === 'topic') return `Next Topic`;
        if (next.type === 'concept') return `Next Concept`;
      }
      nextIdx++;
    }
    return 'Next';
  };

  if (isLoading || !course) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  // Determine what to show in the center panel
  const showModuleView = selection?.type === 'module';
  const showTopicView = selection?.type === 'topic';
  const showConceptView = selection?.type === 'concept' || (!selection && activeConceptId);

  const selectedModule = showModuleView ? findModule(selection!.id) : null;
  const selectedTopicInfo = showTopicView ? findTopic(selection!.id) : null;

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* LHS: Course Tree */}
      <div className="w-72 border-r bg-card shrink-0 overflow-hidden flex flex-col">
        {learningPath && learningPath.nextConceptId && (
          <div className="p-3 border-b bg-primary/5">
            <button
              onClick={() => handleTreeSelect({ type: 'concept', id: learningPath.nextConceptId! })}
              className="w-full flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Compass className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Up next: {learningPath.nextConceptTitle}</span>
            </button>
            <div className="flex items-center gap-2 mt-1.5">
              <Progress value={learningPath.totalSteps > 0 ? (learningPath.completedSteps / learningPath.totalSteps) * 100 : 0} className="h-1 flex-1" />
              <span className="text-[10px] text-muted-foreground">{learningPath.completedSteps}/{learningPath.totalSteps}</span>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <CourseTree
            course={course}
            selection={selection}
            onSelect={handleTreeSelect}
            progressMap={{}}
          />
        </div>
      </div>

      {/* Center: Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        <div className="flex-1">
          {showModuleView && selectedModule && (
            <ModuleOverview module={selectedModule} />
          )}

          {showTopicView && selectedTopicInfo && (
            <TopicOverview topic={selectedTopicInfo.topic} module={selectedTopicInfo.module} />
          )}

          {showConceptView && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="learn" className="gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Learn
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="gap-1.5" disabled={!activeConceptId}>
                    <HelpCircle className="h-3.5 w-3.5" />
                    Quiz
                    {questions && questions.length > 0 && (
                      <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 rounded-full">
                        {questions.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {activeTab !== 'quiz' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(toggleAIPanel())}
                    className="gap-1.5"
                  >
                    <Bot className="h-4 w-4" />
                    AI Tutor
                    {aiPanelOpen ? (
                      <PanelRightClose className="h-3.5 w-3.5" />
                    ) : (
                      <PanelRightOpen className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>

              <TabsContent value="learn">
                <ContentViewer
                  concept={activeConcept}
                  activeLearningUnit={activeLearningUnit}
                  mastery={0}
                  onUnitSelect={setActiveLearningUnit}
                />
              </TabsContent>

              <TabsContent value="quiz">
                {questions && questions.length > 0 ? (
                  <QuizView questions={questions} onComplete={() => {
                    // After quiz, advance to next
                    handleNext();
                  }} />
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p>No questions available for this concept yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {!showModuleView && !showTopicView && !showConceptView && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium">Select a concept to begin</h3>
                <p className="text-sm mt-1">Choose a module, topic, or concept from the course tree on the left</p>
              </div>
            </div>
          )}
        </div>

        {/* Next Button */}
        {selection && !isAtEnd && activeTab !== 'quiz' && (
          <div className="pt-4 border-t mt-6 flex justify-end">
            <Button onClick={handleNext} className="gap-2">
              {getNextLabel()}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* RHS: AI Tutor Panel - hidden during quiz to prevent answer copying */}
      {activeTab !== 'quiz' && (
        <div
          className={cn(
            'border-l bg-card shrink-0 overflow-hidden transition-all duration-300',
            aiPanelOpen ? 'w-80' : 'w-0'
          )}
        >
          {aiPanelOpen && (
            <AITutorPanel
              courseId={courseId!}
              conceptId={activeConceptId}
              conceptTitle={activeConcept?.title}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Module Overview ───────────────────────────────────────

function ModuleOverview({ module }: { module: Module }) {
  const topicCount = module.topics.length;
  const conceptCount = module.topics.reduce((sum, t) => sum + t.concepts.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-primary mb-2">
          <Layers className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Module</span>
        </div>
        <h2 className="text-2xl font-bold">{module.title}</h2>
        {module.description && (
          <p className="text-muted-foreground mt-2">{module.description}</p>
        )}
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{topicCount} {topicCount === 1 ? 'topic' : 'topics'}</span>
        <span>{conceptCount} {conceptCount === 1 ? 'concept' : 'concepts'}</span>
      </div>

      {module.learningObjectives && module.learningObjectives.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Learning Objectives</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {module.learningObjectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-3">Topics in this module</h3>
        <div className="space-y-2">
          {module.topics.map((topic, idx) => (
            <div key={topic.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <p className="font-medium text-sm">{topic.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {topic.concepts.length} {topic.concepts.length === 1 ? 'concept' : 'concepts'}
                  {topic.estimatedTimeMinutes ? ` · ${topic.estimatedTimeMinutes} min` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Topic Overview ────────────────────────────────────────

function TopicOverview({ topic, module }: { topic: Topic; module: Module }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <FolderOpen className="h-4 w-4" />
          <span className="text-xs">{module.title}</span>
        </div>
        <div className="flex items-center gap-2 text-primary mb-2">
          <Layers className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Topic</span>
        </div>
        <h2 className="text-2xl font-bold">{topic.title}</h2>
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{topic.concepts.length} {topic.concepts.length === 1 ? 'concept' : 'concepts'}</span>
        {topic.estimatedTimeMinutes && (
          <span>{topic.estimatedTimeMinutes} min estimated</span>
        )}
      </div>

      {topic.tags && topic.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {topic.tags.map((tag) => (
            <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-3">Concepts to learn</h3>
        <div className="space-y-2">
          {topic.concepts.map((concept, idx) => (
            <div key={concept.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <p className="font-medium text-sm">{concept.title}</p>
                {concept.definition && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{concept.definition}</p>
                )}
                <span className="text-[10px] mt-1 inline-block text-muted-foreground capitalize">
                  {concept.difficultyLevel?.toLowerCase()}
                  {(concept.learningUnits ?? []).length > 0 && ` · ${concept.learningUnits.length} units`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
