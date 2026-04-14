import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetInstructorCourseQuery,
  useUpdateCourseMutation,
  usePublishCourseMutation,
  useUnpublishCourseMutation,
  useAddModuleMutation,
  useDeleteModuleMutation,
  useAddTopicMutation,
  useDeleteTopicMutation,
  useAddConceptMutation,
  useUpdateConceptMutation,
  useDeleteConceptMutation,
  useUploadMediaMutation,
  useImportContentMutation,
} from '@/store/api/instructorApi';
import type { Module, Topic, Concept } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  FileUp,
  Image,
  GripVertical,
  BookOpen,
  FileText,
  Code,
  Video,
} from 'lucide-react';

export default function CourseEditorPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading, refetch } = useGetInstructorCourseQuery(courseId!, { skip: !courseId });

  const [updateCourse] = useUpdateCourseMutation();
  const [publishCourse] = usePublishCourseMutation();
  const [unpublishCourse] = useUnpublishCourseMutation();
  const [addModule] = useAddModuleMutation();
  const [deleteModule] = useDeleteModuleMutation();
  const [addTopic] = useAddTopicMutation();
  const [deleteTopic] = useDeleteTopicMutation();
  const [addConcept] = useAddConceptMutation();
  const [updateConcept] = useUpdateConceptMutation();
  const [deleteConcept] = useDeleteConceptMutation();
  const [uploadMedia] = useUploadMediaMutation();
  const [importContent, { isLoading: isImporting }] = useImportContentMutation();

  // Course metadata editing
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [metaShortDesc, setMetaShortDesc] = useState('');
  const [metaDifficulty, setMetaDifficulty] = useState('BEGINNER');
  const [metaIndustry, setMetaIndustry] = useState('');
  const [metaPrereqs, setMetaPrereqs] = useState('');

  // Content editing
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Initialize meta fields when course loads
  const initMetaFields = useCallback(() => {
    if (!course) return;
    setMetaTitle(course.title);
    setMetaDesc(course.description ?? '');
    setMetaShortDesc(course.shortDescription ?? '');
    setMetaDifficulty(course.difficulty ?? 'BEGINNER');
    setMetaIndustry(course.industryVertical ?? '');
    setMetaPrereqs(course.prerequisites ?? '');
    setEditingMeta(true);
  }, [course]);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectConcept = (concept: Concept) => {
    setSelectedConceptId(concept.id);
    setEditingTitle(concept.title);
    const body = concept.learningUnits?.[0]?.content?.['body'] as string ?? '';
    setEditingContent(body);
    setShowPreview(false);
  };

  const saveConcept = async () => {
    if (!selectedConceptId) return;
    setSaveStatus('saving');
    try {
      await updateConcept({
        conceptId: selectedConceptId,
        title: editingTitle,
        content: editingContent,
      }).unwrap();
      refetch();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('idle');
      alert('Failed to save');
    }
  };

  const handleSaveMeta = async () => {
    if (!courseId) return;
    try {
      await updateCourse({
        courseId,
        data: {
          title: metaTitle,
          description: metaDesc,
          shortDescription: metaShortDesc,
          difficulty: metaDifficulty,
          industryVertical: metaIndustry,
          prerequisites: metaPrereqs,
        },
      }).unwrap();
      setEditingMeta(false);
      refetch();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      alert('Failed to save course details');
    }
  };

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'courses');
        const result = await uploadMedia(formData).unwrap();
        // Insert markdown image at cursor position
        setEditingContent(prev => prev + `\n\n![${file.name}](${result.url})\n`);
      } catch {
        alert('Failed to upload image');
      }
    };
    input.click();
  };

  const handleDocImport = async () => {
    if (!courseId) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const formData = new FormData();
        formData.append('file', file);
        await importContent({ courseId, formData }).unwrap();
        refetch();
      } catch {
        alert('Failed to import document');
      }
    };
    input.click();
  };

  const handleAddModule = async () => {
    if (!courseId) return;
    const title = prompt('Module title:');
    if (!title?.trim()) return;
    try {
      await addModule({ courseId, title }).unwrap();
      refetch();
    } catch {
      alert('Failed to add module');
    }
  };

  const handleAddTopic = async (moduleId: string) => {
    const title = prompt('Topic title:');
    if (!title?.trim()) return;
    try {
      await addTopic({ moduleId, title }).unwrap();
      refetch();
    } catch {
      alert('Failed to add topic');
    }
  };

  const handleAddConcept = async (topicId: string) => {
    const title = prompt('Concept title:');
    if (!title?.trim()) return;
    try {
      await addConcept({ topicId, title, content: '' }).unwrap();
      refetch();
    } catch {
      alert('Failed to add concept');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-[70vh] bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-xl font-bold">Course not found</h2>
        <button onClick={() => navigate('/instructor')} className="mt-4 text-primary">
          Back to dashboard
        </button>
      </div>
    );
  }

  const modules = course.modules ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/instructor')} className="p-1.5 hover:bg-accent rounded-md">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-semibold text-sm line-clamp-1">{course.title}</h1>
              <span className={`text-xs ${course.published ? 'text-green-600' : 'text-yellow-600'}`}>
                {course.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDocImport}
              disabled={isImporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md hover:bg-accent"
            >
              <FileUp className="h-3.5 w-3.5" />
              {isImporting ? 'Importing...' : 'Import Doc'}
            </button>
            {course.published ? (
              <button
                onClick={async () => { await unpublishCourse(courseId!).unwrap(); refetch(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-md hover:bg-accent"
              >
                <EyeOff className="h-3.5 w-3.5" /> Unpublish
              </button>
            ) : (
              <button
                onClick={async () => { await publishCourse(courseId!).unwrap(); refetch(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md"
              >
                <Eye className="h-3.5 w-3.5" /> Publish
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex gap-6">
          {/* Left sidebar — Course structure */}
          <div className="w-80 shrink-0">
            {/* Course Details */}
            <div className="rounded-lg border bg-card p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Course Details</h3>
                {!editingMeta && (
                  <button onClick={initMetaFields} className="text-xs text-primary">
                    Edit
                  </button>
                )}
              </div>
              {editingMeta ? (
                <div className="space-y-3">
                  <input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded bg-background"
                    placeholder="Title"
                  />
                  <textarea
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded bg-background resize-none"
                    rows={2}
                    placeholder="Description"
                  />
                  <textarea
                    value={metaShortDesc}
                    onChange={(e) => setMetaShortDesc(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded bg-background resize-none"
                    rows={2}
                    placeholder="Short description"
                  />
                  <select
                    value={metaDifficulty}
                    onChange={(e) => setMetaDifficulty(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded bg-background"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                  <input
                    value={metaIndustry}
                    onChange={(e) => setMetaIndustry(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded bg-background"
                    placeholder="Category (e.g., AI, Web Dev)"
                  />
                  <input
                    value={metaPrereqs}
                    onChange={(e) => setMetaPrereqs(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded bg-background"
                    placeholder="Prerequisites"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveMeta} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded">
                      Save
                    </button>
                    <button onClick={() => setEditingMeta(false)} className="px-3 py-1.5 text-sm border rounded">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><span className="font-medium text-foreground">Difficulty:</span> {course.difficulty}</p>
                  <p className="line-clamp-2">{course.description || 'No description'}</p>
                </div>
              )}
            </div>

            {/* Structure Tree */}
            <div className="rounded-lg border bg-card">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-semibold text-sm">Course Structure</h3>
                <button onClick={handleAddModule} className="p-1 hover:bg-accent rounded" title="Add Module">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {modules.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No modules yet</p>
                    <p className="text-xs mt-1">Add a module or import a document</p>
                  </div>
                ) : (
                  modules.map((mod: Module) => (
                    <div key={mod.id} className="border-b last:border-b-0">
                      {/* Module */}
                      <div className="flex items-center gap-1 px-3 py-2 hover:bg-accent/50">
                        <button onClick={() => toggleModule(mod.id)} className="p-0.5">
                          {expandedModules.has(mod.id) ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-sm font-medium flex-1 truncate">{mod.title}</span>
                        <button
                          onClick={() => handleAddTopic(mod.id)}
                          className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-accent rounded"
                          title="Add Topic"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete module "${mod.title}"?`)) return;
                            await deleteModule({ moduleId: mod.id, courseId: courseId! }).unwrap();
                            refetch();
                          }}
                          className="p-0.5 hover:text-destructive rounded"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      {expandedModules.has(mod.id) && (mod.topics ?? []).map((topic: Topic) => (
                        <div key={topic.id}>
                          {/* Topic */}
                          <div className="flex items-center gap-1 pl-8 pr-3 py-1.5 hover:bg-accent/50">
                            <button onClick={() => toggleTopic(topic.id)} className="p-0.5">
                              {expandedTopics.has(topic.id) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </button>
                            <span className="text-sm flex-1 truncate text-muted-foreground">{topic.title}</span>
                            <button onClick={() => handleAddConcept(topic.id)} className="p-0.5 hover:bg-accent rounded">
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete topic "${topic.title}"?`)) return;
                                await deleteTopic({ topicId: topic.id }).unwrap();
                                refetch();
                              }}
                              className="p-0.5 hover:text-destructive rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>

                          {expandedTopics.has(topic.id) && (topic.concepts ?? []).map((concept: Concept) => (
                            <div
                              key={concept.id}
                              onClick={() => selectConcept(concept)}
                              className={`flex items-center gap-2 pl-14 pr-3 py-1.5 cursor-pointer hover:bg-accent/50 text-sm ${
                                selectedConceptId === concept.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                              }`}
                            >
                              <FileText className="h-3 w-3 shrink-0" />
                              <span className="flex-1 truncate">{concept.title}</span>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!confirm(`Delete "${concept.title}"?`)) return;
                                  await deleteConcept({ conceptId: concept.id }).unwrap();
                                  if (selectedConceptId === concept.id) setSelectedConceptId(null);
                                  refetch();
                                }}
                                className="p-0.5 hover:text-destructive rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right — Content Editor */}
          <div className="flex-1 min-w-0">
            {selectedConceptId ? (
              <div className="rounded-lg border bg-card">
                {/* Editor Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="text-lg font-semibold bg-transparent border-none outline-none flex-1"
                    placeholder="Concept title"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleImageUpload}
                      className="p-2 hover:bg-accent rounded-md"
                      title="Upload Image"
                    >
                      <Image className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className={`px-3 py-1.5 text-sm rounded-md ${showPreview ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                    >
                      {showPreview ? 'Edit' : 'Preview'}
                    </button>
                    <button
                      onClick={saveConcept}
                      disabled={saveStatus === 'saving'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                        saveStatus === 'saved' ? 'bg-green-600 text-white' : saveStatus === 'saving' ? 'bg-primary/70 text-primary-foreground' : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <Save className="h-3.5 w-3.5" />
                      {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Toolbar */}
                {!showPreview && (
                  <div className="flex items-center gap-1 px-4 py-2 border-b bg-muted/30">
                    <button
                      onClick={() => setEditingContent(prev => prev + '\n## Heading\n')}
                      className="px-2 py-1 text-xs hover:bg-accent rounded"
                    >
                      H2
                    </button>
                    <button
                      onClick={() => setEditingContent(prev => prev + '\n### Subheading\n')}
                      className="px-2 py-1 text-xs hover:bg-accent rounded"
                    >
                      H3
                    </button>
                    <span className="w-px h-4 bg-border" />
                    <button
                      onClick={() => setEditingContent(prev => prev + '**bold**')}
                      className="px-2 py-1 text-xs font-bold hover:bg-accent rounded"
                    >
                      B
                    </button>
                    <button
                      onClick={() => setEditingContent(prev => prev + '*italic*')}
                      className="px-2 py-1 text-xs italic hover:bg-accent rounded"
                    >
                      I
                    </button>
                    <span className="w-px h-4 bg-border" />
                    <button
                      onClick={() => setEditingContent(prev => prev + '\n```python\n# code here\n```\n')}
                      className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-accent rounded"
                    >
                      <Code className="h-3 w-3" /> Code
                    </button>
                    <button
                      onClick={handleImageUpload}
                      className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-accent rounded"
                    >
                      <Image className="h-3 w-3" /> Image
                    </button>
                    <button
                      onClick={() => {
                        const url = prompt('Video URL (YouTube, Vimeo, or direct link):');
                        if (url) setEditingContent(prev => prev + `\n\n[Watch Video](${url})\n`);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-accent rounded"
                    >
                      <Video className="h-3 w-3" /> Video
                    </button>
                    <button
                      onClick={() => setEditingContent(prev => prev + '\n```mermaid\ngraph TD\n  A[Start] --> B[Process]\n  B --> C[End]\n```\n')}
                      className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-accent rounded"
                    >
                      Flowchart
                    </button>
                    <button
                      onClick={() => setEditingContent(prev => prev + '\n| Column 1 | Column 2 |\n| --- | --- |\n| Data | Data |\n')}
                      className="px-2 py-1 text-xs hover:bg-accent rounded"
                    >
                      Table
                    </button>
                    <button
                      onClick={() => setEditingContent(prev => prev + '\n- Item 1\n- Item 2\n- Item 3\n')}
                      className="px-2 py-1 text-xs hover:bg-accent rounded"
                    >
                      List
                    </button>
                  </div>
                )}

                {/* Editor / Preview */}
                <div className="p-4">
                  {showPreview ? (
                    <div className="prose dark:prose-invert max-w-none min-h-[60vh]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{editingContent || '*No content yet*'}</ReactMarkdown>
                    </div>
                  ) : (
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full min-h-[60vh] p-0 bg-transparent border-none outline-none resize-none font-mono text-sm leading-relaxed"
                      placeholder="Write your content in Markdown...

# Supported formats:
- **Markdown** text with headings, bold, italic
- ```code blocks``` with syntax highlighting
- ![images](url) — use the Image button to upload
- [Video links](url) — paste YouTube/Vimeo URLs
- Tables, lists, blockquotes
- Mermaid diagrams for flowcharts

Tip: Use the toolbar above for quick formatting."
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-card flex items-center justify-center min-h-[70vh]">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Select a concept to edit</p>
                  <p className="text-sm mt-1">Choose from the course structure on the left, or add new content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
