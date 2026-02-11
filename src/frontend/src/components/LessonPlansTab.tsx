import { useState } from 'react';
import { useListAllLessonPlans, useGetSubjects, useCreateCustomLesson, useGetPreMadeLessons, useCreateLessonFromLibrary } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Loader2, Library } from 'lucide-react';
import type { Subject, PreMadeLesson } from '../backend';

interface LessonPlansTabProps {
  isTeacher: boolean;
}

const GRADE_LEVELS = [
  { value: '0', label: 'Pre-K' },
  { value: '1', label: '1st Grade' },
  { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
  { value: '9', label: '9th Grade' },
  { value: '10', label: '10th Grade' },
  { value: '11', label: '11th Grade' },
  { value: '12', label: '12th Grade' },
];

const SUBJECT_ICONS: Record<string, string> = {
  'History': '/assets/generated/history-icon.dim_64x64.png',
  'Math': '/assets/generated/math-icon.dim_64x64.png',
  'Language Arts/Reading': '/assets/generated/language-arts-icon.dim_64x64.png',
  'Science': '/assets/generated/science-icon.dim_64x64.png',
  'Social Studies': '/assets/generated/social-studies-icon.dim_64x64.png',
};

export default function LessonPlansTab({ isTeacher }: LessonPlansTabProps) {
  const { data: lessonPlans, isLoading } = useListAllLessonPlans();
  const { data: subjects } = useGetSubjects();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  const filteredLessons = selectedGrade === 'all'
    ? lessonPlans
    : lessonPlans?.filter((lesson) => lesson.gradeLevel.toString() === selectedGrade);

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-[160px] sm:w-[180px]">
              <SelectValue placeholder="Filter by grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {GRADE_LEVELS.map((grade) => (
                <SelectItem key={grade.value} value={grade.value}>
                  {grade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isTeacher && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Lesson Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <CreateLessonForm subjects={subjects || []} onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredLessons && filteredLessons.length > 0 ? (
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson) => (
            <LessonCard key={lesson.lessonId.toString()} lesson={lesson} isTeacher={isTeacher} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {selectedGrade === 'all' ? 'No lesson plans yet' : 'No lesson plans for this grade level'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LessonCard({ lesson, isTeacher }: { lesson: any; isTeacher: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const gradeLabel = GRADE_LEVELS.find((g) => g.value === lesson.gradeLevel.toString())?.label || 'Unknown';
  const subjectIcon = SUBJECT_ICONS[lesson.subject.name];

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="space-y-4 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {subjectIcon && (
              <img src={subjectIcon} alt={lesson.subject.name} className="h-10 w-10 flex-shrink-0 rounded-md object-contain" />
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg">{lesson.title}</CardTitle>
              <CardDescription className="mt-2">{lesson.subject.name}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Badge variant="secondary" className="text-xs">{gradeLabel}</Badge>
            {lesson.fromLibrary && (
              <Badge variant="outline" className="text-xs">
                <Library className="mr-1 h-3 w-3" />
                Library
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isExpanded ? lesson.content : `${lesson.content.slice(0, 100)}${lesson.content.length > 100 ? '...' : ''}`}
            </p>
            {lesson.content.length > 100 && (
              <Button variant="link" size="sm" className="mt-3 h-auto p-0 text-xs" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateLessonForm({ subjects, onSuccess }: { subjects: Subject[]; onSuccess: () => void }) {
  const [activeTab, setActiveTab] = useState<'custom' | 'library'>('custom');

  return (
    <>
      <DialogHeader className="space-y-3">
        <DialogTitle>Create New Lesson Plan</DialogTitle>
        <DialogDescription>Create a custom lesson or choose from the pre-made library</DialogDescription>
      </DialogHeader>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'custom' | 'library')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="custom">Custom Lesson</TabsTrigger>
          <TabsTrigger value="library">Choose from Library</TabsTrigger>
        </TabsList>
        
        <TabsContent value="custom" className="mt-6">
          <CustomLessonForm subjects={subjects} onSuccess={onSuccess} />
        </TabsContent>
        
        <TabsContent value="library" className="mt-6">
          <LibraryLessonForm subjects={subjects} onSuccess={onSuccess} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function CustomLessonForm({ subjects, onSuccess }: { subjects: Subject[]; onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [gradeLevel, setGradeLevel] = useState('');
  const [content, setContent] = useState('');
  const { mutate: createLesson, isPending } = useCreateCustomLesson();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && selectedSubject && gradeLevel && content) {
      createLesson(
        {
          title,
          subject: selectedSubject,
          gradeLevel: BigInt(gradeLevel),
          content,
        },
        {
          onSuccess: () => {
            setTitle('');
            setSelectedSubject(null);
            setGradeLevel('');
            setContent('');
            onSuccess();
          },
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <div className="space-y-2.5">
        <Label htmlFor="title">Lesson Title</Label>
        <Input id="title" placeholder="e.g., Introduction to Algebra" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="subject">Subject</Label>
          <Select value={selectedSubject?.subjectId.toString() || ''} onValueChange={(value) => {
            const subject = subjects.find((s) => s.subjectId.toString() === value);
            setSelectedSubject(subject || null);
          }}>
            <SelectTrigger id="subject">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
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
            <SelectTrigger id="grade">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_LEVELS.map((grade) => (
                <SelectItem key={grade.value} value={grade.value}>
                  {grade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="content">Lesson Content</Label>
        <Textarea
          id="content"
          placeholder="Describe the lesson objectives, materials needed, and activities..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Lesson'
          )}
        </Button>
      </div>
    </form>
  );
}

function LibraryLessonForm({ subjects, onSuccess }: { subjects: Subject[]; onSuccess: () => void }) {
  const { data: preMadeLessons, isLoading } = useGetPreMadeLessons();
  const { mutate: createFromLibrary, isPending } = useCreateLessonFromLibrary();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedLesson, setSelectedLesson] = useState<PreMadeLesson | null>(null);

  const filteredLessons = preMadeLessons?.filter((lesson) => {
    const subjectMatch = selectedSubject === 'all' || lesson.subject.subjectId.toString() === selectedSubject;
    const gradeMatch = selectedGrade === 'all' || lesson.gradeLevel.toString() === selectedGrade;
    return subjectMatch && gradeMatch;
  });

  const handleAddLesson = () => {
    if (selectedLesson) {
      createFromLibrary(selectedLesson.lessonId, {
        onSuccess: () => {
          setSelectedLesson(null);
          onSuccess();
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="filterSubject">Filter by Subject</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger id="filterSubject">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.subjectId.toString()} value={subject.subjectId.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="filterGrade">Filter by Grade</Label>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger id="filterGrade">
              <SelectValue placeholder="All grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {GRADE_LEVELS.map((grade) => (
                <SelectItem key={grade.value} value={grade.value}>
                  {grade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2.5">
        <Label>Available Lessons</Label>
        <div className="max-h-[400px] overflow-y-auto space-y-3 border rounded-md p-4">
          {filteredLessons && filteredLessons.length > 0 ? (
            filteredLessons.map((lesson) => {
              const gradeLabel = GRADE_LEVELS.find((g) => g.value === lesson.gradeLevel.toString())?.label || 'Unknown';
              const subjectIcon = SUBJECT_ICONS[lesson.subject.name];
              const isSelected = selectedLesson?.lessonId === lesson.lessonId;

              return (
                <Card
                  key={lesson.lessonId.toString()}
                  className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:bg-accent'}`}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <CardHeader className="p-5">
                    <div className="flex items-start gap-3">
                      {subjectIcon && (
                        <img src={subjectIcon} alt={lesson.subject.name} className="h-8 w-8 flex-shrink-0 rounded object-contain" />
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base">{lesson.title}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1.5">
                          {lesson.subject.name} • {gradeLabel}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {isSelected && (
                    <CardContent className="p-5 pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed">{lesson.content}</p>
                    </CardContent>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Library className="mb-3 h-8 w-8" />
              <p className="text-sm">No lessons found with the selected filters</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button onClick={handleAddLesson} disabled={!selectedLesson || isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add to My Lessons'
          )}
        </Button>
      </div>
    </div>
  );
}
