import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetStudentAssignments, useGetSubjects, useGetGradeAveragesBySubject } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Award, Target } from 'lucide-react';

interface ProgressTabProps {
  isEducatorParent: boolean;
}

const SUBJECT_ICONS: Record<string, string> = {
  'History': '/assets/generated/history-icon.dim_64x64.png',
  'Math': '/assets/generated/math-icon.dim_64x64.png',
  'Language Arts/Reading': '/assets/generated/language-arts-icon.dim_64x64.png',
  'Science': '/assets/generated/science-icon.dim_64x64.png',
  'Social Studies': '/assets/generated/social-studies-icon.dim_64x64.png',
};

export default function ProgressTab({ isEducatorParent }: ProgressTabProps) {
  const { identity } = useInternetIdentity();
  const studentId = identity?.getPrincipal() || null;
  const { data: assignments, isLoading: assignmentsLoading } = useGetStudentAssignments(studentId);
  const { data: subjects } = useGetSubjects();

  if (assignmentsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalAssignments = assignments?.length || 0;
  const completedAssignments = assignments?.filter((a) => a.completed).length || 0;
  const gradedAssignments = assignments?.filter((a) => a.grade !== undefined && a.grade !== null).length || 0;
  const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

  const allGrades = assignments
    ?.filter((a) => a.grade !== undefined && a.grade !== null)
    .map((a) => Number(a.grade)) || [];
  const overallAverage = allGrades.length > 0 ? allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length : 0;

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">Progress Overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">Track your academic performance and completion rates</p>
      </div>

      <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="mt-3 text-xs text-muted-foreground">
              {completedAssignments} of {totalAssignments} assignments completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold">{overallAverage.toFixed(1)}</div>
            <p className="mt-3 text-xs text-muted-foreground">
              Based on {gradedAssignments} graded assignment{gradedAssignments !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold">{totalAssignments}</div>
            <p className="mt-3 text-xs text-muted-foreground">
              {totalAssignments - completedAssignments} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {subjects && subjects.length > 0 && (
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Your average grade by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5 sm:space-y-6">
              {subjects.map((subject) => (
                <SubjectProgress key={subject.subjectId.toString()} subject={subject} studentId={studentId} assignments={assignments || []} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SubjectProgress({ subject, studentId, assignments }: { subject: any; studentId: any; assignments: any[] }) {
  const { data: average } = useGetGradeAveragesBySubject(studentId, subject.subjectId);
  const subjectIcon = SUBJECT_ICONS[subject.name];

  const subjectAssignments = assignments.filter((a) => {
    return true;
  });

  const subjectGrades = subjectAssignments
    .filter((a) => a.grade !== undefined && a.grade !== null)
    .map((a) => Number(a.grade));

  const subjectAverage = subjectGrades.length > 0
    ? subjectGrades.reduce((sum, grade) => sum + grade, 0) / subjectGrades.length
    : 0;

  const displayAverage = Number(average || BigInt(0));

  if (subjectGrades.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {subjectIcon && (
            <img src={subjectIcon} alt={subject.name} className="h-6 w-6 rounded object-contain" />
          )}
          <span className="text-sm font-medium">{subject.name}</span>
        </div>
        <Badge variant={displayAverage >= 70 ? 'default' : 'destructive'}>
          {displayAverage.toFixed(1)}%
        </Badge>
      </div>
      <Progress value={displayAverage} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {subjectGrades.length} graded assignment{subjectGrades.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
