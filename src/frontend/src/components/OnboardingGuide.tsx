import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, BarChart3, GraduationCap, FileText, CheckCircle2 } from 'lucide-react';
import { PREMIUM_PRICE_DISPLAY, PREMIUM_DURATION_DISPLAY } from '../constants/premiumPricing';

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  isTeacher: boolean;
}

const ONBOARDING_STORAGE_KEY = 'homeschool-onboarding-completed';

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export default function OnboardingGuide({ isOpen, onClose, isTeacher }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Your Homeschool Hub!',
      description: isTeacher
        ? 'Let\'s take a quick tour to help you get started with managing your homeschool curriculum.'
        : 'Let\'s take a quick tour to help you get started with your learning journey.',
      icon: <CheckCircle2 className="h-14 w-14 text-primary sm:h-16 sm:w-16" />,
      content: isTeacher
        ? 'As a teacher or parent, you can create lesson plans, assign work to students, track their progress, and generate report cards.'
        : 'As a student, you can view your assignments, submit work, track your progress, and see your grades across all subjects.',
    },
    {
      title: 'Lesson Planning',
      description: 'Create and manage lessons across 5 core subjects',
      icon: <BookOpen className="h-14 w-14 text-primary sm:h-16 sm:w-16" />,
      content: isTeacher
        ? 'Browse our library of pre-made lessons or create your own custom content. Organize lessons by subject (History, Math, Language Arts, Science, Social Studies) and grade level (K-12).'
        : 'Access lessons assigned to you across History, Math, Language Arts, Science, and Social Studies. Each lesson includes detailed content and instructions.',
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor academic performance with visual dashboards',
      icon: <BarChart3 className="h-14 w-14 text-primary sm:h-16 sm:w-16" />,
      content: isTeacher
        ? 'View student progress at a glance with subject-specific averages and assignment completion rates. Track performance trends over time.'
        : 'See your progress across all subjects with grade averages and completion status. Track your improvement over time with clear visual indicators.',
    },
    {
      title: 'Grading & Assignments',
      description: 'Manage assignments and grades efficiently',
      icon: <GraduationCap className="h-14 w-14 text-primary sm:h-16 sm:w-16" />,
      content: isTeacher
        ? 'Assign lessons to students with due dates and descriptions. Grade submitted work and provide feedback. All grades are automatically calculated and tracked.'
        : 'View your assignments with due dates and descriptions. Submit your work directly through the platform. See your grades and feedback from your teacher.',
    },
    {
      title: 'Premium Report Cards',
      description: `Unlock comprehensive reports for ${PREMIUM_PRICE_DISPLAY} every ${PREMIUM_DURATION_DISPLAY}`,
      icon: <FileText className="h-14 w-14 text-primary sm:h-16 sm:w-16" />,
      content: `Generate professional report cards with detailed subject breakdowns and performance analytics. Premium access includes unlimited report card generation, printable formats, and historical tracking. Just ${PREMIUM_PRICE_DISPLAY} every ${PREMIUM_DURATION_DISPLAY} with no hidden fees or automatic renewals.`,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    onClose();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center">{currentStepData.icon}</div>
          <DialogTitle className="text-center text-xl sm:text-2xl">{currentStepData.title}</DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] sm:max-h-[350px]">
          <div className="space-y-5 px-1 py-2">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {currentStepData.content}
            </p>
          </div>
        </ScrollArea>

        <div className="space-y-5">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground sm:text-sm">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={handleSkip} className="w-full sm:w-auto">
              Skip Tour
            </Button>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious} className="flex-1 sm:flex-none">
                  Previous
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1 sm:flex-none">
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
