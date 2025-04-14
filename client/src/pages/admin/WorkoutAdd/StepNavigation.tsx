import React from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  activeStep: number;
  isAdding: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  activeStep,
  isAdding,
  onPrev,
  onNext,
}) => {
  return (
    <div className="flex justify-between mt-8">
      <Button
        type="button"
        variant="outline"
        onClick={onPrev}
        disabled={activeStep === 0}
        className="bg-white/80 border-purple-100 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>
      {activeStep < 2 ? (
        <Button
          type="button"
          onClick={onNext}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={isAdding}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {isAdding ? (
            <>Creating...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Workout
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default StepNavigation;