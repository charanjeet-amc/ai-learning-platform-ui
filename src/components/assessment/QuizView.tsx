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

  const metadata = question.metadata as { options?: string[] };
  const options = metadata?.options || [];

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    try {
      const res = await submitAnswer({
        questionId: question.id,
        answer: selectedAnswer,
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
        <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base font-medium">{question.questionText}</p>

        {question.questionType === 'MULTIPLE_CHOICE' && (
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

        {question.questionType === 'TRUE_FALSE' && (
          <div className="flex gap-3">
            {['True', 'False'].map((opt) => (
              <Button
                key={opt}
                variant={selectedAnswer === opt ? 'default' : 'outline'}
                onClick={() => !result && setSelectedAnswer(opt)}
                disabled={!!result}
                className="flex-1"
              >
                {opt}
              </Button>
            ))}
          </div>
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
                  <span className="ml-auto flex items-center gap-1 text-yellow-600">
                    <Zap className="h-3.5 w-3.5" />+{result.xpEarned} XP
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-700 dark:text-orange-400">Not quite...</span>
                </>
              )}
            </div>
            <p className="text-muted-foreground">{result.explanation}</p>
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
