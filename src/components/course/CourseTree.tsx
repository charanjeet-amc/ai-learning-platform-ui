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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseTreeProps {
  course: Course;
  activeConceptId: string | null;
  onConceptSelect: (conceptId: string) => void;
  progressMap?: Record<string, { mastery: number; status: string }>;
}

export default function CourseTree({ course, activeConceptId, onConceptSelect, progressMap = {} }: CourseTreeProps) {
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
            <button
              onClick={() => toggleModule(module.id)}
              className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-accent text-left text-sm font-medium"
            >
              {expandedModules.has(module.id) ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
              <span className="flex-1 truncate">{module.title}</span>
            </button>

            {expandedModules.has(module.id) && (
              <div className="ml-4">
                {module.topics.map((topic: Topic) => (
                  <div key={topic.id}>
                    <button
                      onClick={() => toggleTopic(topic.id)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent text-left text-xs text-muted-foreground"
                    >
                      {expandedTopics.has(topic.id) ? (
                        <ChevronDown className="h-3 w-3 shrink-0" />
                      ) : (
                        <ChevronRight className="h-3 w-3 shrink-0" />
                      )}
                      <span className="truncate">{topic.title}</span>
                    </button>

                    {expandedTopics.has(topic.id) && (
                      <div className="ml-4 space-y-0.5">
                        {topic.concepts.map((concept: Concept) => {
                          const mastery = progressMap[concept.id]?.mastery ?? 0;
                          return (
                            <button
                              key={concept.id}
                              onClick={() => onConceptSelect(concept.id)}
                              className={cn(
                                'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left text-xs transition-colors',
                                activeConceptId === concept.id
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'hover:bg-accent text-foreground'
                              )}
                            >
                              {getStatusIcon(concept.id)}
                              <span className="flex-1 truncate">{concept.title}</span>
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
