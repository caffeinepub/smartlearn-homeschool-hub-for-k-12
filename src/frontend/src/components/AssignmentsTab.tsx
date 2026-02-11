import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetStudentAssignments, useSubmitAssignment, useGradeAssignment, useListAllLessonPlans, useAssignLessonToStudent } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Loader2, Plus, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Principal } from '@dfinity/principal';

interface AssignmentsTabProps {
  isTeacher: boolean;
}

const SUBJECT_ICONS: Record<string, string> = {
  'History': '/assets/generated/history-icon.dim_64x64.png',
  'Math': '/assets/generated/math-icon.dim_64x64.png',
  'Language Arts/Reading': '/assets/generated/language-arts-icon.dim_64x64.png',
  'Science': '/assets/generated/science-icon.dim_64x64.png',
  'Social Studies': '/assets/generated/social-studies-icon.dim_64x64.png',
};

export default function AssignmentsTab({ isTeacher }: AssignmentsTabProps) {
  const { identity } = useInternetIdentity();
  const studentId = identity?.getPrincipal() || null;
  const { data: assignments, isLoading } = useGetStudentAssignments(studentId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Assignments</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isTeacher ? 'Manage and grade student assignments' : 'View and submit your assignments'}
          </p>
        </div>

        {isTeacher && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Assign Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <AssignLessonForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : assignments && assignments.length > 0 ? (
        <div className="grid gap-5 sm:gap-6">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment.assignmentId.toString()} assignment={assignment} isTeacher={isTeacher} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No assignments yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AssignmentCard({ assignment, isTeacher }: { assignment: any; isTeacher: boolean }) {
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const dueDate = new Date(Number(assignment.dueDate) / 1000000);

  return (
    <Card>
      <CardHeader className="space-y-4 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <CardTitle className="text-base sm:text-lg">{assignment.title}</CardTitle>
            <CardDescription className="mt-2">{assignment.description}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {assignment.completed ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="mr-1 h-3 w-3" />
                Pending
              </Badge>
            )}
            {assignment.grade !== undefined && assignment.grade !== null && (
              <Badge variant="outline">Grade: {assignment.grade.toString()}/100</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Due: {dueDate.toLocaleDateString()}
        </div>

        {assignment.submission && (
          <div className="rounded-lg bg-muted p-5">
            <p className="text-sm font-medium">Submission:</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{assignment.submission}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          {!isTeacher && !assignment.completed && (
            <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Submit Assignment</Button>
              </DialogTrigger>
              <DialogContent>
                <SubmitAssignmentForm
                  assignmentId={assignment.assignmentId}
                  onSuccess={() => setIsSubmitDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}

          {isTeacher && assignment.completed && (assignment.grade === undefined || assignment.grade === null) && (
            <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Grade Assignment</Button>
              </DialogTrigger>
              <DialogContent>
                <GradeAssignmentForm
                  assignmentId={assignment.assignmentId}
                  onSuccess={() => setIsGradeDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SubmitAssignmentForm({ assignmentId, onSuccess }: { assignmentId: bigint; onSuccess: () => void }) {
  const [submission, setSubmission] = useState('');
  const { mutate: submitAssignment, isPending } = useSubmitAssignment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submission.trim()) {
      submitAssignment({ assignmentId, submission: submission.trim() }, { onSuccess });
    }
  };

  return (
    <>
      <DialogHeader className="space-y-3">
        <DialogTitle>Submit Assignment</DialogTitle>
        <DialogDescription>Enter your work or response below</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="space-y-2.5">
          <Label htmlFor="submission">Your Submission</Label>
          <Textarea
            id="submission"
            placeholder="Enter your work here..."
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            rows={8}
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
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </form>
    </>
  );
}

function GradeAssignmentForm({ assignmentId, onSuccess }: { assignmentId: bigint; onSuccess: () => void }) {
  const [grade, setGrade] = useState('');
  const { mutate: gradeAssignment, isPending } = useGradeAssignment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gradeValue = parseInt(grade);
    if (!isNaN(gradeValue) && gradeValue >= 0 && gradeValue <= 100) {
      gradeAssignment({ assignmentId, grade: BigInt(gradeValue) }, { onSuccess });
    }
  };

  return (
    <>
      <DialogHeader className="space-y-3">
        <DialogTitle>Grade Assignment</DialogTitle>
        <DialogDescription>Enter a grade from 0 to 100</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="space-y-2.5">
          <Label htmlFor="grade">Grade (0-100)</Label>
          <Input
            id="grade"
            type="number"
            min="0"
            max="100"
            placeholder="Enter grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
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
                Saving...
              </>
            ) : (
              'Save Grade'
            )}
          </Button>
        </div>
      </form>
    </>
  );
}

function AssignLessonForm({ onSuccess }: { onSuccess: () => void }) {
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [studentPrincipal, setStudentPrincipal] = useState('');
  const { data: lessons } = useListAllLessonPlans();
  const { mutate: assignLesson, isPending } = useAssignLessonToStudent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assignmentTitle && selectedLesson && description && dueDate && studentPrincipal) {
      try {
        const studentId = Principal.fromText(studentPrincipal);
        const dueDateMs = new Date(dueDate).getTime() * 1000000;
        assignLesson(
          {
            assignmentTitle,
            lessonId: BigInt(selectedLesson),
            description,
            dueDate: BigInt(dueDateMs),
            studentId,
          },
          { onSuccess }
        );
      } catch (error) {
        console.error('Invalid principal:', error);
      }
    }
  };

  const selectedLessonData = lessons?.find((l) => l.lessonId.toString() === selectedLesson);
  const subjectIcon = selectedLessonData ? SUBJECT_ICONS[selectedLessonData.subject.name] : null;

  return (
    <>
      <DialogHeader className="space-y-3">
        <DialogTitle>Assign Lesson to Student</DialogTitle>
        <DialogDescription>Create a new assignment from an existing lesson</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="space-y-2.5">
          <Label htmlFor="assignmentTitle">Assignment Title</Label>
          <Input
            id="assignmentTitle"
            placeholder="e.g., Chapter 1 Homework"
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="lesson">Select Lesson</Label>
          <Select value={selectedLesson} onValueChange={setSelectedLesson}>
            <SelectTrigger id="lesson">
              <SelectValue placeholder="Choose a lesson" />
            </SelectTrigger>
            <SelectContent>
              {lessons?.map((lesson) => (
                <SelectItem key={lesson.lessonId.toString()} value={lesson.lessonId.toString()}>
                  <div className="flex items-center gap-2">
                    {lesson.title} - {lesson.subject.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedLessonData && subjectIcon && (
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted">
              <img src={subjectIcon} alt={selectedLessonData.subject.name} className="h-6 w-6 rounded object-contain" />
              <span className="text-sm text-muted-foreground">{selectedLessonData.subject.name}</span>
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="description">Assignment Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what the student needs to do..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="studentPrincipal">Student Principal ID</Label>
          <Input
            id="studentPrincipal"
            placeholder="Enter student's principal ID"
            value={studentPrincipal}
            onChange={(e) => setStudentPrincipal(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            The student's unique identifier (they can find this in their profile)
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Lesson'
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
