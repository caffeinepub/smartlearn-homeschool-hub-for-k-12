import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PREMIUM_PRICE_DISPLAY, PREMIUM_DURATION_DISPLAY } from '../constants/premiumPricing';

interface OnboardingGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ONBOARDING_STORAGE_KEY = 'homeschool-hub-onboarding-completed';

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

function markOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
}

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to Homeschool Hub K-12',
    description: 'Your all-in-one homeschool management platform for grades K-12. Create lesson plans, track progress, and manage grades effortlessly.',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Explore 5 core subjects: History, Math, Language Arts, Science, and Social Studies. All core features are free, with report cards available for just {PREMIUM_PRICE_DISPLAY} every {PREMIUM_DURATION_DISPLAY}.
        </p>
      </div>
    ),
  },
  {
    title: 'Core Features',
    description: 'Everything you need to manage your homeschool journey',
    content: (
      <div className="space-y-4">
        <FeatureItem icon="/assets/generated/lesson-plan-icon.dim_64x64.png" title="Lesson Planning" description="Create and customize lessons across core subjects for K–12." />
        <FeatureItem icon="/assets/generated/progress-icon.dim_64x64.png" title="Progress Tracking" description="Visual dashboards to monitor student progress and achievements." />
        <FeatureItem icon="/assets/generated/grading-icon.dim_64x64.png" title="Grading System" description="Easy grade input and automatic calculations for all assignments." />
        <FeatureItem icon="/assets/generated/graduation-cap-icon.dim_64x64.png" title="Report Cards" description="Optional premium feature for comprehensive student reports." />
      </div>
    ),
  },
  {
    title: 'Five Core Subjects',
    description: 'Comprehensive curriculum coverage',
    content: (
      <div className="space-y-3">
        <SubjectItem icon="/assets/generated/history-icon.dim_64x64.png" name="History" description="Learn about past events, cultures, and civilizations." />
        <SubjectItem icon="/assets/generated/math-icon.dim_64x64.png" name="Math" description="Numbers, patterns, and equations for problem-solving skills." />
        <SubjectItem icon="/assets/generated/language-arts-icon.dim_64x64.png" name="Language Arts" description="Expand reading, writing, and communication abilities." />
        <SubjectItem icon="/assets/generated/science-icon.dim_64x64.png" name="Science" description="Discover the natural world through exploration and experimentation." />
        <SubjectItem icon="/assets/generated/social-studies-icon.dim_64x64.png" name="Social Studies" description="Understand societal structures and cultural perspectives." />
      </div>
    ),
  },
  {
    title: 'Premium Report Cards',
    description: 'Upgrade for comprehensive student reports',
    content: (
      <div className="space-y-4">
        <div className="rounded-lg border bg-primary/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">Premium Access</h4>
            <Badge variant="default">{PREMIUM_PRICE_DISPLAY} / {PREMIUM_DURATION_DISPLAY}</Badge>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">✓</span>
              <span>Unlimited report card access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">✓</span>
              <span>Printable and shareable reports</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">✓</span>
              <span>Automated grade tracking</span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          No hidden fees. Cancel anytime and retain access until your current subscription period ends.
        </p>
      </div>
    ),
  },
];

export default function OnboardingGuide({ open, onOpenChange }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
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
    markOnboardingComplete();
    onOpenChange(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    markOnboardingComplete();
    onOpenChange(false);
    setCurrentStep(0);
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle>{step.title}</DialogTitle>
              <DialogDescription className="mt-2">{step.description}</DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip} className="flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div key={index} className={`h-1.5 flex-1 rounded-full transition-colors ${index === currentStep ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </DialogHeader>

        <div className="py-6">{step.content}</div>

        <DialogFooter className="flex-row justify-between gap-3">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleNext}>
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <img src={icon} alt={title} className="h-10 w-10 flex-shrink-0 rounded object-contain" />
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

function SubjectItem({ icon, name, description }: { icon: string; name: string; description: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <img src={icon} alt={name} className="h-8 w-8 flex-shrink-0 rounded object-contain" />
      <div>
        <h4 className="font-medium text-sm">{name}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}
