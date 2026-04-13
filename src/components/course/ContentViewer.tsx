import type { LearningUnit, Concept } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Play,
  Code2,
  PenTool,
  HelpCircle,
  BookOpen,
  Headphones,
  BarChart3,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ContentViewerProps {
  concept: Concept | null;
  activeLearningUnit: LearningUnit | null;
  mastery: number;
  onUnitSelect: (unit: LearningUnit) => void;
}

const contentTypeIcons: Record<string, React.ReactNode> = {
  TEXT: <FileText className="h-4 w-4" />,
  VIDEO: <Play className="h-4 w-4" />,
  CODE_EXERCISE: <Code2 className="h-4 w-4" />,
  INTERACTIVE: <PenTool className="h-4 w-4" />,
  QUIZ: <HelpCircle className="h-4 w-4" />,
  DIAGRAM: <BarChart3 className="h-4 w-4" />,
  SIMULATION: <BookOpen className="h-4 w-4" />,
  AUDIO: <Headphones className="h-4 w-4" />,
};

export default function ContentViewer({ concept, activeLearningUnit, mastery, onUnitSelect }: ContentViewerProps) {
  if (!concept) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium">Select a concept to begin</h3>
          <p className="text-sm mt-1">Choose a concept from the course tree on the left</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Concept Header */}
      <div>
        <h2 className="text-2xl font-bold">{concept.title}</h2>
        <p className="text-muted-foreground mt-1">{concept.definition}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Mastery</span>
              <span className="font-medium">{Math.round(mastery * 100)}%</span>
            </div>
            <Progress value={mastery * 100} className="h-2" />
          </div>
          <span className="text-xs text-muted-foreground">
            {concept.learningUnits?.length ?? 0} units
          </span>
        </div>
      </div>

      {/* Learning Unit Tabs */}
      {concept.learningUnits.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {concept.learningUnits.map((unit) => (
            <button
              key={unit.id}
              onClick={() => onUnitSelect(unit)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeLearningUnit?.id === unit.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {contentTypeIcons[unit.contentType] || <FileText className="h-3.5 w-3.5" />}
              {unit.title}
            </button>
          ))}
        </div>
      )}

      {/* Active Learning Unit Content */}
      {activeLearningUnit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {contentTypeIcons[activeLearningUnit.contentType]}
              {activeLearningUnit.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LearningUnitContent unit={activeLearningUnit} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LearningUnitContent({ unit }: { unit: LearningUnit }) {
  const content = unit.content as Record<string, string>;

  switch (unit.contentType) {
    case 'TEXT':
      return (
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{content['markdown'] || content['text'] || ''}</ReactMarkdown>
        </div>
      );

    case 'VIDEO':
      return (
        <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
          {content['url'] ? (
            <video controls className="w-full h-full rounded-lg" src={content['url']} />
          ) : (
            <div className="text-white/60 text-center">
              <Play className="h-16 w-16 mx-auto mb-2" />
              <p>Video content</p>
            </div>
          )}
        </div>
      );

    case 'CODE_EXERCISE':
      return (
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <pre className="text-sm overflow-x-auto">
              <code>{content['code'] || content['template'] || ''}</code>
            </pre>
          </div>
          {content['instructions'] && (
            <div className="prose dark:prose-invert max-w-none text-sm">
              <ReactMarkdown>{content['instructions']}</ReactMarkdown>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{content['markdown'] || content['text'] || JSON.stringify(content, null, 2)}</ReactMarkdown>
        </div>
      );
  }
}
