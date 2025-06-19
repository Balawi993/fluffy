import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
  id: number;
  name: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div
              className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                ${currentStep === step.id
                  ? 'bg-primary border-primary text-dark'
                  : currentStep > step.id
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
                }
                ${onStepClick ? 'cursor-pointer hover:border-primary' : ''}
              `}
              onClick={() => onStepClick?.(step.id)}
            >
              {currentStep > step.id ? (
                <CheckIcon className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">{step.id + 1}</span>
              )}
            </div>
            <div className="ml-3">
              <div
                className={`
                  text-sm font-medium transition-all
                  ${currentStep === step.id
                    ? 'text-primary'
                    : currentStep > step.id
                    ? 'text-green-600'
                    : 'text-gray-500'
                  }
                  ${onStepClick ? 'cursor-pointer hover:text-primary' : ''}
                `}
                onClick={() => onStepClick?.(step.id)}
              >
                Step {step.id + 1}: {step.name}
              </div>
            </div>
          </div>
          
          {index < steps.length - 1 && (
            <div
              className={`
                w-12 h-0.5 mx-4 transition-all
                ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stepper; 