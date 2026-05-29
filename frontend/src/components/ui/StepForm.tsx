import { ReactNode } from "react";
import Button from "./Button";

interface Step {
  id: string;
  label: string;
}

interface StepFormProps {
  steps: Step[];
  currentStepIndex: number;
  onNext?: () => void;
  onPrev?: () => void;
  onSubmit?: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  children: ReactNode;
}

export default function StepForm({
  steps,
  currentStepIndex,
  onNext,
  onPrev,
  onSubmit,
  isNextDisabled,
  isSubmitting,
  children
}: StepFormProps) {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-[family-name:var(--font-mono)] border transition-colors ${
                  idx === currentStepIndex
                    ? "bg-porcelain text-carbon border-porcelain shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    : idx < currentStepIndex
                    ? "bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30"
                    : "bg-carbon text-starlight/30 border-starlight/10"
                }`}
              >
                {idx < currentStepIndex ? "✓" : idx + 1}
              </div>
            </div>
          ))}
        </div>
        <div className="relative w-full h-1 bg-carbon rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-cyber-cyan transition-all duration-300"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>
        <div className="text-center mt-3 text-porcelain font-medium text-sm">
          {steps[currentStepIndex].label}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 min-h-[300px]">
        {children}
      </div>

      {/* Navigation Actions */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-starlight/10">
        <Button
          variant="ghost"
          onClick={onPrev}
          disabled={isFirstStep || isSubmitting}
          className="opacity-0 w-24"
          style={{ opacity: isFirstStep ? 0 : 1 }}
        >
          Back
        </Button>

        {!isLastStep ? (
          <Button
            variant="filled"
            onClick={onNext}
            disabled={isNextDisabled || isSubmitting}
            className="w-32"
          >
            Next
          </Button>
        ) : (
          <Button
            variant="filled"
            onClick={onSubmit}
            disabled={isNextDisabled || isSubmitting}
            className="w-32 bg-cyber-cyan text-carbon hover:bg-white"
          >
            {isSubmitting ? "Saving..." : "Save Item"}
          </Button>
        )}
      </div>
    </div>
  );
}
