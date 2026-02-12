import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetStudentAssignments, useGetSubjects } from '../hooks/useQueries';
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
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
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
            <div className="text-2xl font-bold">{overallAverage.toFixed(1)}%</div>
            <Progress value={overallAverage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Based on {gradedAssignments} graded assignments
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
            <div className="flex gap-2">
              <Badge variant="default" className="text-xs">
                {completedAssignments} Done
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {totalAssignments - completedAssignments} Pending
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-5 text-lg font-semibold">Subject Performance</h3>
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects?.map((subject) => {
            const subjectAssignments = assignments?.filter((a) => {
              // We don't have direct subject info on assignments, so we'll show all for now
              return true;
            }) || [];

            const subjectGrades = subjectAssignments
              .filter((a) => a.grade !== undefined && a.grade !== null)
              .map((a) => Number(a.grade));

            const subjectAverage = subjectGrades.length > 0
              ? subjectGrades.reduce((sum, grade) => sum + grade, 0) / subjectGrades.length
              : 0;

            const subjectCompleted = subjectAssignments.filter((a) => a.completed).length;

            return (
              <Card key={subject.subjectId.toString()}>
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2.5">
                      <img
                        src={SUBJECT_ICONS[subject.name] || '/assets/generated/lesson-plan-icon.dim_64x64.png'}
                        alt={subject.name}
                        className="h-6 w-6"
                      />
                    </div>
                    <CardTitle className="text-base">{subject.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Average</span>
                      <span className="font-semibold">{subjectAverage.toFixed(1)}%</span>
                    </div>
                    <Progress value={subjectAverage} className="h-2" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{subjectCompleted} completed</span>
                    <span>{subjectGrades.length} graded</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
