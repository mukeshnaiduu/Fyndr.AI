import React from 'react';
import { motion } from 'framer-motion';

const WizardProgress = ({ currentStep, totalSteps, steps }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-foreground dark:text-foreground">
                    {steps[currentStep - 1]?.title}
                </h2>
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                    Step {currentStep} of {totalSteps}
                </span>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="h-1 w-full bg-muted dark:bg-muted rounded"></div>
                </div>
                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep - 1;
                        const isCurrent = index === currentStep - 1;

                        return (
                            <div
                                key={step.id}
                                className="flex flex-col items-center"
                            >
                                <div className={`
                  flex h-7 w-7 items-center justify-center rounded-full 
                  ${isCompleted ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground' :
                                        isCurrent ? 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary' :
                                            'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground'}
                  transition-all duration-200
                `}>
                                    {isCompleted ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="feather feather-check"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : (
                                        <span className="text-xs font-medium">{index + 1}</span>
                                    )}
                                </div>
                                <span className="sr-only">{step.title}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <p className="mt-3 text-sm text-muted-foreground dark:text-muted-foreground">
                {steps[currentStep - 1]?.description}
            </p>
        </div>
    );
};

export default WizardProgress;
