import { useState } from 'react';
import type { Course, Module, Topic, Concept } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type TreeSelection =
  | { type: 'module'; id: string }
  | { type: 'topic'; id: string }
  | { type: 'concept'; id: string }
  | null;

interface CourseTreeProps {
  course: Course;
  selection: TreeSelection;
  onSelect: (selection: TreeSelection) => void;
  progressMap?: Record<string, { mastery: number; status: string; fastTracked?: boolean }>;
}

export default function CourseTree({ course, selection, onSelect, progressMap = {} }: CourseTreeProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(course.modules.map((m) => m.id)));
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleModuleClick = (module: Module) => {
    onSelect({ type: 'module', id: module.id });
    if (!expandedModules.has(module.id)) {
      setExpandedModules((prev) => new Set(prev).add(module.id));
    }
  };

  const handleTopicClick = (topic: Topic) => {
    onSelect({ type: 'topic', id: topic.id });
    if (!expandedTopics.has(topic.id)) {
      setExpandedTopics((prev) => new Set(prev).add(topic.id));
    }
  };

  const getStatusIcon = (conceptId: string) => {
    const status = progressMap[conceptId]?.status;
    switch (status) {
      case 'MASTERED':
        return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="h-4 w-4 text-blue-500 shrink-0" />;
      case 'STRUGGLING':
        return <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground shrink-0" />;
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-sm px-2 py-1 text-muted-foreground uppercase tracking-wider">
          Course Content
        </h3>
        {course.modules.map((module: Module) => (
          <div key={module.id}>
            <div className="flex items-center">
              <button
                onClick={() => toggleModule(module.id)}
                className="p-1 rounded hover:bg-accent shrink-0"
              >
                {expandedModules.has(module.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleModuleClick(module)}
                className={cn(
                  'flex-1 px-2 py-2 rounded-md text-left text-sm font-medium truncate transition-colors',
                  selection?.type === 'module' && selection.id === module.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent'
                )}
              >
                {module.title}
              </button>
            </div>

            {expandedModules.has(module.id) && (
              <div className="ml-4">
                {module.topics.map((topic: Topic) => (
                  <div key={topic.id}>
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className="p-0.5 rounded hover:bg-accent shrink-0"
                      >
                        {expandedTopics.has(topic.id) ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={() => handleTopicClick(topic)}
                        className={cn(
                          'flex-1 px-2 py-1.5 rounded-md text-left text-xs truncate transition-colors',
                          selection?.type === 'topic' && selection.id === topic.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-accent text-muted-foreground'
                        )}
                      >
                        {topic.title}
                      </button>
                    </div>

                    {expandedTopics.has(topic.id) && (
                      <div className="ml-4 space-y-0.5">
                        {topic.concepts.map((concept: Concept) => {
                          const progress = progressMap[concept.id];
                          const mastery = progress?.mastery ?? 0;
                          const isFastTracked = progress?.fastTracked === true;
                          return (
                            <button
                              key={concept.id}
                              onClick={() => onSelect({ type: 'concept', id: concept.id })}
                              className={cn(
                                'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left text-xs transition-colors',
                                selection?.type === 'concept' && selection.id === concept.id
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'hover:bg-accent text-foreground'
                              )}
                            >
                              {getStatusIcon(concept.id)}
                              <span className="flex-1 truncate">{concept.title}</span>
                              {isFastTracked && (
                                <Zap className="h-3 w-3 text-yellow-500 shrink-0" title="Fast-tracked" />
                              )}
                              {mastery > 0 && (
                                <span className="text-[10px] text-muted-foreground">{Math.round(mastery * 100)}%</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
