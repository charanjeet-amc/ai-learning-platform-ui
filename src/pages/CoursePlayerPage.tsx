import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGetCourseTreeQuery } from '@/store/api/courseApi';
import { useGetQuestionsQuery } from '@/store/api/assessmentApi';
import CourseTree from '@/components/course/CourseTree';
import ContentViewer from '@/components/course/ContentViewer';
import AITutorPanel from '@/components/ai-tutor/AITutorPanel';
import QuizView from '@/components/assessment/QuizView';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleAIPanel, setActiveConcept } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, PanelRightClose, PanelRightOpen, BookOpen, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearningUnit, Concept } from '@/types';

export default function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const dispatch = useAppDispatch();
  const aiPanelOpen = useAppSelector((s) => s.ui.aiPanelOpen);
  const activeConceptId = useAppSelector((s) => s.ui.activeConceptId);

  const { data: course, isLoading } = useGetCourseTreeQuery(courseId!);
  const { data: questions } = useGetQuestionsQuery(activeConceptId!, { skip: !activeConceptId });

  const [activeLearningUnit, setActiveLearningUnit] = useState<LearningUnit | null>(null);
  const [activeTab, setActiveTab] = useState('learn');

  // Find the active concept from the tree
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

  const handleConceptSelect = (conceptId: string) => {
    dispatch(setActiveConcept(conceptId));
    setActiveLearningUnit(null);
    setActiveTab('learn');
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

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* LHS: Course Tree */}
      <div className="w-72 border-r bg-card shrink-0 overflow-hidden">
        <CourseTree
          course={course}
          activeConceptId={activeConceptId}
          onConceptSelect={handleConceptSelect}
          progressMap={{}}
        />
      </div>

      {/* Center: Content */}
      <div className="flex-1 overflow-y-auto p-6">
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
              <QuizView questions={questions} onComplete={() => setActiveTab('learn')} />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <HelpCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p>No questions available for this concept yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* RHS: AI Tutor Panel */}
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
    </div>
  );
}
