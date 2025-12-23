import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

type StepWrapperProps = {
  title: string;
  description: string;
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  onStartOver?: () => void;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
};

export function StepWrapper({
  title,
  description,
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onStartOver,
  isNextDisabled,
  isNextLoading,
}: StepWrapperProps) {
  return (
    <div className="container max-w-4xl mx-auto py-8 sm:py-12 px-4">
      <div className="text-center mb-8">
        <p className="font-semibold text-primary mb-2">
          Step {currentStep} of {totalSteps}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      <div className="mb-8 min-h-[200px]">{children}</div>

      <div className="flex justify-between items-center gap-4 mt-12">
        <div>
          {onBack && (
            <Button variant="outline" onClick={onBack} disabled={isNextLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        <div>
           {onStartOver ? (
            <Button onClick={onStartOver} size="lg" variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
          ) : onNext ? (
            <Button
              onClick={onNext}
              disabled={isNextDisabled || isNextLoading}
              size="lg"
            >
              {isNextLoading ? "Analyzing..." : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
