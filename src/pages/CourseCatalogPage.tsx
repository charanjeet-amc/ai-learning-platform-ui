import { useState } from 'react';
import { useListCoursesQuery, useSearchCoursesQuery } from '@/store/api/courseApi';
import CourseList from '@/components/course/CourseList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

export default function CourseCatalogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data: courseData, isLoading: listLoading } = useListCoursesQuery(
    { page, size: 12 },
    { skip: search.length > 0 }
  );
  const { data: searchData, isLoading: searchLoading } = useSearchCoursesQuery(
    { q: search, page },
    { skip: search.length === 0 }
  );

  const data = search ? searchData : courseData;
  const isLoading = search ? searchLoading : listLoading;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        <p className="text-muted-foreground mt-1">
          Explore AI-structured courses with knowledge graph architecture
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-8">
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
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

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
