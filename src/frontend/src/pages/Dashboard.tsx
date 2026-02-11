import { useState, useEffect } from 'react';
import type { UserProfile } from '../backend';
import { UserRole } from '../backend';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, BarChart3, GraduationCap, FileText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LessonPlansTab from '../components/LessonPlansTab';
import AssignmentsTab from '../components/AssignmentsTab';
import ProgressTab from '../components/ProgressTab';
import ReportCardsTab from '../components/ReportCardsTab';
import PremiumBanner from '../components/PremiumBanner';
import OnboardingGuide, { hasCompletedOnboarding, resetOnboarding } from '../components/OnboardingGuide';

interface DashboardProps {
  userProfile: UserProfile;
}

export default function Dashboard({ userProfile }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('lessons');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const isEducatorParent = userProfile.role === UserRole.admin;

  useEffect(() => {
    if (!hasCompletedOnboarding()) {
      setShowOnboarding(true);
    }
  }, []);

  const handleUpgrade = () => {
    setActiveTab('reports');
  };

  const handleOpenOnboarding = () => {
    setShowOnboarding(true);
  };

  return (
    <div className="container mx-auto max-h-full overflow-y-auto px-5 py-7 sm:px-6 sm:py-9 md:px-8 md:py-10 lg:px-10 lg:py-12">
      <div className="mb-7 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-start sm:justify-between md:mb-10">
        <div className="flex-1">
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">Welcome back, {userProfile.name}!</h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            {isEducatorParent ? 'Manage your lessons and track student progress' : 'View your lessons and track your progress'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleOpenOnboarding} className="flex items-center gap-2 self-start text-xs sm:self-auto sm:text-sm">
          <HelpCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Help & Onboarding</span>
          <span className="sm:hidden">Help</span>
        </Button>
      </div>

      <div className="mb-7 sm:mb-9 md:mb-10">
        <PremiumBanner onUpgrade={handleUpgrade} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-7 sm:space-y-9 md:space-y-10">
        <TabsList className="grid w-full grid-cols-4 gap-1.5">
          <TabsTrigger value="lessons" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Lessons</span>
            <span className="sm:hidden">Lessons</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
            <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Assignments</span>
            <span className="sm:hidden">Work</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Progress</span>
            <span className="sm:hidden">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Report Cards</span>
            <span className="sm:hidden">Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="overflow-y-auto space-y-5 sm:space-y-6 md:space-y-7">
          <LessonPlansTab isTeacher={isEducatorParent} />
        </TabsContent>

        <TabsContent value="assignments" className="overflow-y-auto space-y-5 sm:space-y-6 md:space-y-7">
          <AssignmentsTab isTeacher={isEducatorParent} />
        </TabsContent>

        <TabsContent value="progress" className="overflow-y-auto space-y-5 sm:space-y-6 md:space-y-7">
          <ProgressTab isTeacher={isEducatorParent} />
        </TabsContent>

        <TabsContent value="reports" className="overflow-y-auto space-y-5 sm:space-y-6 md:space-y-7">
          <ReportCardsTab isTeacher={isEducatorParent} />
        </TabsContent>
      </Tabs>

      <OnboardingGuide isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} isTeacher={isEducatorParent} />
    </div>
  );
}
