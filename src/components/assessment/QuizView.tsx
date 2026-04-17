import { useState } from 'react';
import type { Question, AnswerResult } from '@/types';
import { useSubmitAnswerMutation } from '@/store/api/assessmentApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Zap,
  Brain,
  ArrowRight,
  Code2,
  FileText,
  BookOpen,
  ListChecks,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizViewProps {
  questions: Question[];
  onComplete?: (results: AnswerResult[]) => void;
}

export default function QuizView({ questions, onComplete }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [submitAnswer, { isLoading }] = useSubmitAnswerMutation();

  const question = questions[currentIndex];
  const isComplete = currentIndex >= questions.length;

  if (!question || isComplete) {
    const correct = results.filter((r) => r.correct).length;
    const totalXp = results.reduce((s, r) => s + r.xpEarned, 0);
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            <Brain className="h-16 w-16 mx-auto text-primary mb-3" />
            <h3 className="text-2xl font-bold">Assessment Complete!</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-sm mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{correct}/{questions.length}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{Math.round((correct / questions.length) * 100)}%</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-500">+{totalXp}</p>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
          </div>
          {onComplete && (
            <Button className="mt-6" onClick={() => onComplete(results)}>
              Continue Learning <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const metadata = question.metadata as Record<string, unknown> | null;
  const rawOptions = metadata?.options;
  const options: string[] = Array.isArray(rawOptions)
    ? rawOptions.map(String)
    : [];
  const starterCode = (metadata?.starterCode as string) ?? '';
  const language = (metadata?.language as string) ?? '';
  const scenario = (metadata?.scenario as string) ?? '';

  const questionTypeLabel = {
    MCQ: { label: 'Multiple Choice', icon: ListChecks, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
    CODING: { label: 'Coding', icon: Code2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
    SUBJECTIVE: { label: 'Short Answer', icon: FileText, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
    SCENARIO_BASED: { label: 'Scenario', icon: BookOpen, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
  }[question.type] ?? { label: question.type, icon: FileText, color: 'text-gray-600 bg-gray-50' };
  const TypeIcon = questionTypeLabel.icon;

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    try {
      const res = await submitAnswer({
        questionId: question.id,
        answer: { answer: selectedAnswer },
      }).unwrap();
      setResult(res);
      setResults((prev) => [...prev, res]);
    } catch {
      // Handle error silently
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Question {currentIndex + 1} of {questions.length}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className={cn('text-xs px-2 py-0.5 rounded-full flex items-center gap-1', questionTypeLabel.color)}>
              <TypeIcon className="h-3 w-3" />
              {questionTypeLabel.label}
            </span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', {
              'bg-green-100 text-green-700': question.difficulty === 'BEGINNER',
              'bg-teal-100 text-teal-700': question.difficulty === 'EASY',
              'bg-blue-100 text-blue-700': question.difficulty === 'MEDIUM',
              'bg-orange-100 text-orange-700': question.difficulty === 'HARD',
              'bg-red-100 text-red-700': question.difficulty === 'ADVANCED',
            })}>
              {question.difficulty}
            </span>
          </div>
        </div>
        <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scenario context block */}
        {question.type === 'SCENARIO_BASED' && scenario && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/30 dark:border-amber-800 p-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium text-sm mb-2">
              <BookOpen className="h-4 w-4" />
              Scenario
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{scenario}</p>
          </div>
        )}

        <p className="text-base font-medium">{question.questionText}</p>

        {/* MCQ / SCENARIO_BASED with options */}
        {(question.type === 'MCQ' || question.type === 'SCENARIO_BASED') && options.length > 0 && (
          <div className="space-y-2">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !result && setSelectedAnswer(opt)}
                disabled={!!result}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all',
                  !result && selectedAnswer === opt && 'border-primary bg-primary/5',
                  !result && selectedAnswer !== opt && 'hover:border-primary/50 hover:bg-accent',
                  result && selectedAnswer === opt && result.correct && 'border-green-500 bg-green-50 dark:bg-green-950',
                  result && selectedAnswer === opt && !result.correct && 'border-red-500 bg-red-50 dark:bg-red-950',
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                  <span className="flex-1">{opt}</span>
                  {result && selectedAnswer === opt && (
                    result.correct ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* CODING question */}
        {question.type === 'CODING' && (
          <div className="space-y-3">
            {starterCode && (
              <div className="rounded-lg bg-zinc-900 dark:bg-zinc-950 p-4 overflow-x-auto">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                  <Code2 className="h-3.5 w-3.5" />
                  {language || 'Code'} — Starter Code
                </div>
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{starterCode}</pre>
              </div>
            )}
            <textarea
              value={selectedAnswer ?? ''}
              onChange={(e) => !result && setSelectedAnswer(e.target.value || null)}
              disabled={!!result}
              placeholder="Write your code here..."
              className="w-full min-h-[140px] px-4 py-3 rounded-lg border bg-zinc-50 dark:bg-zinc-900 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60"
            />
          </div>
        )}

        {/* SUBJECTIVE question */}
        {question.type === 'SUBJECTIVE' && (
          <textarea
            value={selectedAnswer ?? ''}
            onChange={(e) => !result && setSelectedAnswer(e.target.value || null)}
            disabled={!!result}
            placeholder="Type your answer here..."
            className="w-full min-h-[120px] px-4 py-3 rounded-lg border text-sm resize-y focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-60"
          />
        )}

        {/* Result Feedback */}
        {result && (
          <div className={cn(
            'rounded-lg p-4 text-sm',
            result.correct ? 'bg-green-50 dark:bg-green-950 border border-green-200' : 'bg-orange-50 dark:bg-orange-950 border border-orange-200'
          )}>
            <div className="flex items-center gap-2 font-medium mb-1">
              {result.correct ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-700 dark:text-green-400">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-700 dark:text-orange-400">Not quite...</span>
                </>
              )}
              {/* Score badge for AI-evaluated questions */}
              {(question.type === 'SUBJECTIVE' || question.type === 'CODING') && result.score != null && (
                <span className={cn(
                  'ml-2 text-xs px-2 py-0.5 rounded-full font-medium',
                  result.score >= 0.7 ? 'bg-green-100 text-green-700' :
                  result.score >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                )}>
                  Score: {Math.round(result.score * 100)}%
                </span>
              )}
              {result.xpEarned > 0 && (
                <span className="ml-auto flex items-center gap-1 text-yellow-600">
                  <Zap className="h-3.5 w-3.5" />+{result.xpEarned} XP
                </span>
              )}
            </div>
            {/* AI feedback for subjective/coding */}
            {(question.type === 'SUBJECTIVE' || question.type === 'CODING') && result.feedback && (
              <div className="mt-2 mb-2 p-3 rounded-md bg-white/60 dark:bg-black/20 border border-dashed border-muted-foreground/20">
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Brain className="h-3 w-3" /> AI Evaluation
                </p>
                <p className="text-foreground/80">{result.feedback}</p>
              </div>
            )}
            {result.explanation && (
              <p className="text-muted-foreground">{result.explanation}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          {!result ? (
            <Button onClick={handleSubmit} disabled={!selectedAnswer || isLoading}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
