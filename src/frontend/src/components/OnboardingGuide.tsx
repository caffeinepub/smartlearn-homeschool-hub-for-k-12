import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, BarChart3, GraduationCap, FileText, CheckCircle2 } from 'lucide-react';

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
        : 'As a student, you can view your assigned lessons, submit assignments, track your progress, and see your grades.',
    },
    {
      title: 'Explore the Five Core Subjects',
      description: 'Our curriculum covers all essential subjects for comprehensive K-12 education.',
      icon: <BookOpen className="h-14 w-14 text-primary sm:h-16 sm:w-16" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground sm:text-base">
            Access lessons and materials across five core subjects:
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {[
              { name: 'History', icon: '/assets/generated/history-icon.dim_64x64.png' },
              { name: 'Math', icon: '/assets/generated/math-icon.dim_64x64.png' },
              { name: 'Language Arts', icon: '/assets/generated/language-arts-icon.dim_64x64.png' },
              { name: 'Science', icon: '/assets/generated/science-icon.dim_64x64.png' },
              { name: 'Social Studies', icon: '/assets/generated/social-studies-icon.dim_64x64.png' },
            ].map((subject) => (
              <div key={subject.name} className="flex items-center gap-3 rounded-lg border p-3 sm:p-4">
                <img src={subject.icon} alt={subject.name} className="h-8 w-8 flex-shrink-0 rounded object-contain sm:h-10 sm:w-10" />
                <span className="text-sm font-medium sm:text-base">{subject.name}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Track Progress & Performance',
      description: 'Monitor academic progress with visual dashboards and detailed analytics.',
      icon: <BarChart3 className="h-14 w-14 text-primary sm:h-16 sm:w-16" />,
      content: isTeacher
        ? 'View student progress across all subjects, track assignment completion, and monitor grade trends over time. The Progress tab provides comprehensive insights into student performance.'
        : 'Track your own progress across all subjects, see your assignment completion rates, and monitor your grade trends over time. The Progress tab helps you stay on top of your learning.',
    },
    {
      title: 'Premium Report Cards',
      description: 'Unlock comprehensive report card features for just $5 every 9 weeks.',
      icon: <GraduationCap className="h-14 w-14 text-primary sm:h-16 sm:w-16" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground sm:text-base">
            All core features are free! Upgrade to premium for official report cards:
          </p>
          <ul className="space-y-2.5 text-sm sm:text-base">
            <li className="flex items-start gap-2.5">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary sm:h-5 sm:w-5" />
              <span>Generate comprehensive report cards with subject breakdowns</span>
            </li>
            <li className="flex items-start gap-2.5">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary sm:h-5 sm:w-5" />
              <span>Printable and shareable professional reports</span>
            </li>
            <li className="flex items-start gap-2.5">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary sm:h-5 sm:w-5" />
              <span>Automated grade tracking and analytics</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground sm:text-sm">
            No hidden fees. Cancel anytime and retain access until your current subscription period ends.
          </p>
        </div>
      ),
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-center">{currentStepData.icon}</div>
          <DialogTitle className="text-center text-xl sm:text-2xl">{currentStepData.title}</DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">{currentStepData.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 py-4 sm:space-y-5 sm:py-5">
            {typeof currentStepData.content === 'string' ? (
              <p className="text-sm text-muted-foreground sm:text-base">{currentStepData.content}</p>
            ) : (
              currentStepData.content
            )}
          </div>
        </ScrollArea>

        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground sm:text-sm">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <DialogFooter className="flex-col gap-2.5 sm:flex-row sm:gap-3">
            <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto">
              Skip Tour
            </Button>
            <div className="flex w-full gap-2.5 sm:w-auto sm:gap-3">
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

