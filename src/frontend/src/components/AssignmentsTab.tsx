import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetStudentAssignments, useSubmitAssignment, useGradeAssignment, useListAllLessonPlans, useAssignLessonToStudent } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Loader2, FileText, Calendar, CheckCircle2, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

interface AssignmentsTabProps {
  isEducatorParent: boolean;
}

export default function AssignmentsTab({ isEducatorParent }: AssignmentsTabProps) {
  const { identity } = useInternetIdentity();
  const studentId = identity?.getPrincipal() || null;
  const { data: assignments, isLoading } = useGetStudentAssignments(studentId);
  const { data: lessonPlans } = useListAllLessonPlans();
  const submitAssignment = useSubmitAssignment();
  const gradeAssignment = useGradeAssignment();
  const assignLesson = useAssignLessonToStudent();

  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState('');
  const [grade, setGrade] = useState('');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  // Assignment creation state
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<bigint | null>(null);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [targetStudentId, setTargetStudentId] = useState('');

  const handleSubmit = async () => {
    if (!selectedAssignment || !submission.trim()) {
      toast.error('Please enter your submission');
      return;
    }

    try {
      await submitAssignment.mutateAsync({
        assignmentId: selectedAssignment.assignmentId,
        submission,
      });
      setShowSubmitDialog(false);
      setSubmission('');
      setSelectedAssignment(null);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleGrade = async () => {
    if (!selectedAssignment || !grade.trim()) {
      toast.error('Please enter a grade');
      return;
    }

    const gradeValue = parseInt(grade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
      toast.error('Grade must be between 0 and 100');
      return;
    }

    try {
      await gradeAssignment.mutateAsync({
        assignmentId: selectedAssignment.assignmentId,
        grade: BigInt(gradeValue),
      });
      setShowGradeDialog(false);
      setGrade('');
      setSelectedAssignment(null);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleAssignLesson = async () => {
    if (!assignmentTitle.trim() || !selectedLessonId || !description.trim() || !dueDate || !targetStudentId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const principal = Principal.fromText(targetStudentId);
      const dueDateTimestamp = BigInt(new Date(dueDate).getTime() * 1_000_000);

      await assignLesson.mutateAsync({
        assignmentTitle,
        lessonId: selectedLessonId,
        description,
        dueDate: dueDateTimestamp,
        studentId: principal,
      });

      setShowAssignDialog(false);
      setAssignmentTitle('');
      setSelectedLessonId(null);
      setDescription('');
      setDueDate('');
      setTargetStudentId('');
    } catch (error: any) {
      if (error.message.includes('Invalid principal')) {
        toast.error('Invalid student ID format');
      }
      // Other errors already handled by mutation
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
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Assignments</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isEducatorParent ? 'Manage and grade student assignments' : 'View and submit your assignments'}
          </p>
        </div>
        {isEducatorParent && (
          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button className="self-start sm:self-auto">
                <Plus className="mr-2 h-4 w-4" />
                Assign Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader className="space-y-3">
                <DialogTitle>Assign Lesson to Student</DialogTitle>
                <DialogDescription>Create a new assignment from an existing lesson plan</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 mt-5">
                <div className="space-y-2.5">
                  <Label htmlFor="assignment-title">Assignment Title</Label>
                  <Input id="assignment-title" value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} placeholder="Enter assignment title" />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="lesson">Lesson Plan</Label>
                  <Select value={selectedLessonId?.toString()} onValueChange={(value) => setSelectedLessonId(BigInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lesson" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessonPlans?.map((lesson) => (
                        <SelectItem key={lesson.lessonId.toString()} value={lesson.lessonId.toString()}>
                          {lesson.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Assignment instructions" rows={3} />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input id="due-date" type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="student-id">Student Principal ID</Label>
                  <Input id="student-id" value={targetStudentId} onChange={(e) => setTargetStudentId(e.target.value)} placeholder="Enter student principal ID" />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button onClick={handleAssignLesson} disabled={assignLesson.isPending}>
                  {assignLesson.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Lesson'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {assignments && assignments.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => {
            const dueDate = new Date(Number(assignment.dueDate) / 1_000_000);
            const isOverdue = dueDate < new Date() && !assignment.completed;

            return (
              <Card key={assignment.assignmentId.toString()} className="flex flex-col">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{assignment.title}</CardTitle>
                    {assignment.completed ? (
                      <Badge variant="default" className="flex-shrink-0">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Complete
                      </Badge>
                    ) : isOverdue ? (
                      <Badge variant="destructive" className="flex-shrink-0">Overdue</Badge>
                    ) : (
                      <Badge variant="secondary" className="flex-shrink-0">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3" />
                    Due: {dueDate.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-4">
                  <p className="flex-1 text-sm text-muted-foreground">{assignment.description}</p>
                  {assignment.grade !== undefined && assignment.grade !== null && (
                    <div className="rounded-lg border bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground">Grade</p>
                      <p className="text-lg font-bold">{assignment.grade.toString()}%</p>
                    </div>
                  )}
                  <div className="flex gap-2.5">
                    {!assignment.completed && !isEducatorParent && (
                      <Button size="sm" className="flex-1" onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmitDialog(true);
                      }}>
                        Submit
                      </Button>
                    )}
                    {assignment.completed && isEducatorParent && assignment.grade === undefined && (
                      <Button size="sm" className="flex-1" onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowGradeDialog(true);
                      }}>
                        Grade
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-5 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2.5 text-lg font-semibold">No Assignments Yet</h3>
            <p className="text-sm text-muted-foreground">
              {isEducatorParent ? 'Assign lessons to students to get started' : 'Your educator will assign work soon'}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="space-y-3">
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>{selectedAssignment?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-5">
            <div className="space-y-2.5">
              <Label htmlFor="submission">Your Submission</Label>
              <Textarea id="submission" value={submission} onChange={(e) => setSubmission(e.target.value)} placeholder="Enter your work here" rows={8} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={handleSubmit} disabled={submitAssignment.isPending}>
              {submitAssignment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Assignment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="space-y-3">
            <DialogTitle>Grade Assignment</DialogTitle>
            <DialogDescription>{selectedAssignment?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-5">
            {selectedAssignment?.submission && (
              <div className="space-y-2.5">
                <Label>Student Submission</Label>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm">{selectedAssignment.submission}</p>
                </div>
              </div>
            )}
            <div className="space-y-2.5">
              <Label htmlFor="grade">Grade (0-100)</Label>
              <Input id="grade" type="number" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Enter grade" />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={handleGrade} disabled={gradeAssignment.isPending}>
              {gradeAssignment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Grade'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
