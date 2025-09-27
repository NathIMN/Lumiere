import React from 'react';
import { CheckCircle } from 'lucide-react';

const SteppedProgress = ({ currentStep, completedSteps = [] }) => {
  const steps = [
    { number: 1, title: 'Basic Information', description: 'Email & Password' },
    { number: 2, title: 'Personal Information', description: 'Personal Details' },
    { number: 3, title: 'Employment Details', description: 'Work Information' },
    { number: 4, title: 'Bank Details', description: 'Banking Information' },
    { number: 5, title: 'Dependents', description: 'Family Members' }
  ];

  const getStepStatus = (stepNumber) => {
    if (completedSteps.includes(stepNumber)) {
      return 'completed';
    } else if (stepNumber === currentStep) {
      return 'current';
    } else if (stepNumber < currentStep) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  const getStepClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white';
      case 'current':
        return 'bg-blue-600 text-white';
      case 'upcoming':
        return 'bg-gray-200 text-gray-400';
      default:
        return 'bg-gray-200 text-gray-400';
    }
  };

  const getConnectorClasses = (stepNumber) => {
    const status = getStepStatus(stepNumber);
    return status === 'completed' || (stepNumber < currentStep) 
      ? 'bg-green-600' 
      : 'bg-gray-200';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          const isLast = index === steps.length - 1;
          
          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center relative">
                {/* Step Circle */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-300 ${getStepClasses(status)}
                  ${status === 'current' ? 'ring-4 ring-blue-200' : ''}
                `}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step.number
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    status === 'current' ? 'text-blue-600' : 
                    status === 'completed' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-4 mt-5">
                  <div className={`h-0.5 transition-all duration-300 ${getConnectorClasses(step.number + 1)}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default SteppedProgress;