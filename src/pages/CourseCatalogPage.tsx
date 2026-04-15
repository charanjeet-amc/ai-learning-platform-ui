import { useState, useMemo } from 'react';
import { useFilterCoursesQuery, useGetCategoriesQuery } from '@/store/api/courseApi';
import CourseList from '@/components/course/CourseList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { DifficultyLevel } from '@/types';

const DURATION_PRESETS = [
  { label: 'Short (1–2 hrs)', min: 60, max: 120 },
  { label: 'Normal (2–8 hrs)', min: 120, max: 480 },
  { label: 'Professional (10+ hrs)', min: 600, max: undefined },
] as const;

const DIFFICULTIES: DifficultyLevel[] = ['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'ADVANCED'];

export default function CourseCatalogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useGetCategoriesQuery();

  const filterParams = useMemo(() => {
    const params: {
      category?: string;
      difficulty?: string;
      minDuration?: number;
      maxDuration?: number;
      q?: string;
      page: number;
      size: number;
    } = { page, size: 12 };
    if (selectedCategory) params.category = selectedCategory;
    if (selectedDifficulty) params.difficulty = selectedDifficulty;
    if (selectedDuration !== null) {
      const preset = DURATION_PRESETS[selectedDuration]!;
      params.minDuration = preset.min;
      if (preset.max !== undefined) params.maxDuration = preset.max;
    }
    if (search) params.q = search;
    return params;
  }, [search, page, selectedCategory, selectedDifficulty, selectedDuration]);

  const { data, isLoading } = useFilterCoursesQuery(filterParams);

  const hasActiveFilters = selectedCategory || selectedDifficulty || selectedDuration !== null;

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedDuration(null);
    setPage(0);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        <p className="text-muted-foreground mt-1">
          Explore AI-structured courses with knowledge graph architecture
        </p>
      </div>

      {/* Search & Filter Toggle */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search courses..."
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters((v) => !v)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {[selectedCategory, selectedDifficulty, selectedDuration !== null].filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="border rounded-lg p-5 mb-6 bg-card space-y-5">
          {/* Category */}
          <div>
            <h3 className="text-sm font-medium mb-2">Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat ? '' : cat);
                    setPage(0);
                  }}
                >
                  {cat}
                </Button>
              ))}
              {categories.length === 0 && (
                <span className="text-sm text-muted-foreground">No categories available</span>
              )}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <h3 className="text-sm font-medium mb-2">Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={selectedDifficulty === d ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedDifficulty(selectedDifficulty === d ? '' : d);
                    setPage(0);
                  }}
                >
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <h3 className="text-sm font-medium mb-2">Duration</h3>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((preset, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant={selectedDuration === idx ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedDuration(selectedDuration === idx ? null : idx);
                    setPage(0);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      {data && (
        <p className="text-sm text-muted-foreground mb-4">
          {data.totalElements} course{data.totalElements !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Course Grid */}
      <CourseList courses={data?.content ?? []} loading={isLoading} />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={data.first}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {data.number + 1} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data.last}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
