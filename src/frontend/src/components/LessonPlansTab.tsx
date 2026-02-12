import { useState } from 'react';
import { useListAllLessonPlans, useCreateCustomLesson, useGetSubjects, useGetPreMadeLessons, useCreateLessonFromLibrary, useGenerateAiLessonPlanDraft } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, BookOpen, Upload, Library, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Subject, LessonPlanRequest } from '../backend';
import { isSupportedFileType, deriveDefaultTitle, readFileAsText, getUnsupportedFileTypeError } from '../utils/lessonUpload';

interface LessonPlansTabProps {
  isEducatorParent: boolean;
}

export default function LessonPlansTab({ isEducatorParent }: LessonPlansTabProps) {
  const { data: lessonPlans, isLoading } = useListAllLessonPlans();
  const { data: subjects } = useGetSubjects();
  const { data: preMadeLessons } = useGetPreMadeLessons();
  const createCustomLesson = useCreateCustomLesson();
  const createLessonFromLibrary = useCreateLessonFromLibrary();
  const generateAiDraft = useGenerateAiLessonPlanDraft();

  const [open, setOpen] = useState(false);
  const [activeCreationTab, setActiveCreationTab] = useState('custom');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [gradeLevel, setGradeLevel] = useState('1');
  const [selectedLibraryLesson, setSelectedLibraryLesson] = useState<bigint | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // AI generation state
  const [aiSubject, setAiSubject] = useState('');
  const [aiGradeLevel, setAiGradeLevel] = useState('1');
  const [aiTopic, setAiTopic] = useState('');
  const [aiStandards, setAiStandards] = useState('');
  const [aiConstraints, setAiConstraints] = useState('');
  const [aiDraft, setAiDraft] = useState<{ title: string; content: string } | null>(null);

  const handleCreateCustom = async () => {
    if (!title.trim() || !content.trim() || !selectedSubject) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createCustomLesson.mutateAsync({
        title,
        subject: selectedSubject,
        gradeLevel: BigInt(gradeLevel),
        content,
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleAddFromLibrary = async () => {
    if (!selectedLibraryLesson) {
      toast.error('Please select a lesson from the library');
      return;
    }

    try {
      await createLessonFromLibrary.mutateAsync(selectedLibraryLesson);
      setOpen(false);
      resetForm();
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isSupportedFileType(file.name)) {
      toast.error(getUnsupportedFileTypeError());
      return;
    }

    try {
      const fileContent = await readFileAsText(file);
      setContent(fileContent);
      setTitle(deriveDefaultTitle(file.name));
      setUploadedFile(file);
      setActiveCreationTab('custom');
      toast.success('File uploaded successfully. Review and save your lesson.');
    } catch (error: any) {
      toast.error(`Failed to read file: ${error.message}`);
    }
  };

  const handleGenerateAiDraft = async () => {
    if (!aiSubject.trim() || !aiGradeLevel) {
      toast.error('Please provide at least a subject and grade level');
      return;
    }

    const request: LessonPlanRequest = {
      subject: aiSubject,
      gradeLevel: BigInt(aiGradeLevel),
      topic: aiTopic.trim() || undefined,
      standards: aiStandards.trim() || undefined,
      constraints: aiConstraints.trim() || undefined,
    };

    try {
      const draft = await generateAiDraft.mutateAsync(request);
      setAiDraft(draft);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleSaveAiDraft = async () => {
    if (!aiDraft || !selectedSubject) {
      toast.error('Please generate a draft and select a subject first');
      return;
    }

    try {
      await createCustomLesson.mutateAsync({
        title: aiDraft.title,
        subject: selectedSubject,
        gradeLevel: BigInt(aiGradeLevel),
        content: aiDraft.content,
      });
      setOpen(false);
      resetForm();
      setAiDraft(null);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedSubject(null);
    setGradeLevel('1');
    setSelectedLibraryLesson(null);
    setUploadedFile(null);
    setAiSubject('');
    setAiGradeLevel('1');
    setAiTopic('');
    setAiStandards('');
    setAiConstraints('');
    setAiDraft(null);
    setActiveCreationTab('custom');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Lesson Plans</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isEducatorParent ? 'Create and manage lesson plans for your students' : 'View your assigned lesson plans'}
          </p>
        </div>
        {isEducatorParent && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="self-start sm:self-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Lesson Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
              <DialogHeader className="space-y-3">
                <DialogTitle>Create New Lesson Plan</DialogTitle>
                <DialogDescription>Choose how you'd like to create your lesson plan</DialogDescription>
              </DialogHeader>

              <Tabs value={activeCreationTab} onValueChange={setActiveCreationTab} className="mt-5">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="custom" className="flex items-center gap-1.5 text-xs">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Custom</span>
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-1.5 text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">AI Create</span>
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-1.5 text-xs">
                    <Upload className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Upload</span>
                  </TabsTrigger>
                  <TabsTrigger value="library" className="flex items-center gap-1.5 text-xs">
                    <Library className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Library</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="custom" className="space-y-5 mt-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="title">Lesson Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter lesson title" />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={selectedSubject?.subjectId.toString()} onValueChange={(value) => {
                      const subject = subjects?.find((s) => s.subjectId.toString() === value);
                      setSelectedSubject(subject || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map((subject) => (
                          <SelectItem key={subject.subjectId.toString()} value={subject.subjectId.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="grade">Grade Level</Label>
                    <Select value={gradeLevel} onValueChange={setGradeLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Pre-K</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="content">Lesson Content</Label>
                    <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Enter lesson content, objectives, and activities" rows={8} />
                  </div>

                  <DialogFooter>
                    <Button onClick={handleCreateCustom} disabled={createCustomLesson.isPending}>
                      {createCustomLesson.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Lesson'
                      )}
                    </Button>
                  </DialogFooter>
                </TabsContent>

                <TabsContent value="ai" className="space-y-5 mt-6">
                  {!aiDraft ? (
                    <>
                      <div className="space-y-2.5">
                        <Label htmlFor="ai-subject">Subject *</Label>
                        <Input id="ai-subject" value={aiSubject} onChange={(e) => setAiSubject(e.target.value)} placeholder="e.g., Math, Science, History" />
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="ai-grade">Grade Level *</Label>
                        <Select value={aiGradeLevel} onValueChange={setAiGradeLevel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Pre-K</SelectItem>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                              <SelectItem key={grade} value={grade.toString()}>
                                Grade {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="ai-topic">Topic (Optional)</Label>
                        <Input id="ai-topic" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g., Fractions, Photosynthesis" />
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="ai-standards">Standards (Optional)</Label>
                        <Input id="ai-standards" value={aiStandards} onChange={(e) => setAiStandards(e.target.value)} placeholder="e.g., Common Core, State Standards" />
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="ai-constraints">Special Requirements (Optional)</Label>
                        <Textarea id="ai-constraints" value={aiConstraints} onChange={(e) => setAiConstraints(e.target.value)} placeholder="Any special constraints or requirements" rows={3} />
                      </div>

                      <DialogFooter>
                        <Button onClick={handleGenerateAiDraft} disabled={generateAiDraft.isPending}>
                          {generateAiDraft.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Draft
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2.5">
                        <Label htmlFor="draft-title">Lesson Title</Label>
                        <Input id="draft-title" value={aiDraft.title} onChange={(e) => setAiDraft({ ...aiDraft, title: e.target.value })} />
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="draft-subject">Subject</Label>
                        <Select value={selectedSubject?.subjectId.toString()} onValueChange={(value) => {
                          const subject = subjects?.find((s) => s.subjectId.toString() === value);
                          setSelectedSubject(subject || null);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects?.map((subject) => (
                              <SelectItem key={subject.subjectId.toString()} value={subject.subjectId.toString()}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="draft-content">Lesson Content</Label>
                        <Textarea id="draft-content" value={aiDraft.content} onChange={(e) => setAiDraft({ ...aiDraft, content: e.target.value })} rows={10} />
                      </div>

                      <DialogFooter className="gap-2.5">
                        <Button variant="outline" onClick={() => setAiDraft(null)}>
                          Generate New
                        </Button>
                        <Button onClick={handleSaveAiDraft} disabled={createCustomLesson.isPending}>
                          {createCustomLesson.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Lesson'
                          )}
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="upload" className="space-y-5 mt-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="file-upload">Upload Lesson File</Label>
                    <Input id="file-upload" type="file" accept=".txt,.md" onChange={handleFileUpload} />
                    <p className="text-xs text-muted-foreground">Supported formats: .txt, .md</p>
                  </div>
                  {uploadedFile && (
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <p className="text-sm font-medium">File uploaded: {uploadedFile.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Switch to the Custom tab to review and save your lesson.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="library" className="space-y-5 mt-6">
                  <div className="space-y-2.5">
                    <Label>Select from Library</Label>
                    <div className="max-h-[400px] space-y-3 overflow-y-auto rounded-lg border p-4">
                      {preMadeLessons && preMadeLessons.length > 0 ? (
                        preMadeLessons.map((lesson) => (
                          <Card key={lesson.lessonId.toString()} className={`cursor-pointer transition-colors hover:border-primary ${selectedLibraryLesson === lesson.lessonId ? 'border-primary bg-primary/5' : ''}`} onClick={() => setSelectedLibraryLesson(lesson.lessonId)}>
                            <CardHeader className="p-4">
                              <CardTitle className="text-base">{lesson.title}</CardTitle>
                              <CardDescription className="flex items-center gap-2.5 text-xs">
                                <Badge variant="outline">{lesson.subject.name}</Badge>
                                <span>Grade {lesson.gradeLevel.toString()}</span>
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center text-sm text-muted-foreground">No pre-made lessons available</p>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button onClick={handleAddFromLibrary} disabled={createLessonFromLibrary.isPending || !selectedLibraryLesson}>
                      {createLessonFromLibrary.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add from Library'
                      )}
                    </Button>
                  </DialogFooter>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {lessonPlans && lessonPlans.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lessonPlans.map((lesson) => (
            <Card key={lesson.lessonId.toString()} className="flex flex-col">
              <CardHeader className="space-y-3">
                <CardTitle className="text-base">{lesson.title}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2.5 text-xs">
                  <Badge variant="outline">{lesson.subject.name}</Badge>
                  <span>Grade {lesson.gradeLevel.toString()}</span>
                  {lesson.fromLibrary && <Badge variant="secondary">Library</Badge>}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="line-clamp-3 text-sm text-muted-foreground">{lesson.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="mb-5 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2.5 text-lg font-semibold">No Lesson Plans Yet</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {isEducatorParent ? 'Create your first lesson plan to get started' : 'Your educator will assign lesson plans soon'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
