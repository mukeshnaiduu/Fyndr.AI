import React from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';

const WizardProgress = ({ currentStep, totalSteps, steps }) => {
    const progress = (currentStep / totalSteps) * 100;

    const getStepStatus = (stepIndex) => {
        if (stepIndex < currentStep) return 'completed';
        if (stepIndex === currentStep) return 'current';
        return 'upcoming';
    };

    const getStepIcon = (step, status) => {
        if (status === 'completed') {
            return <Icon name="Check" size={16} color="white" />;
        }
        return <Icon name={step.icon} size={16} color={status === 'current' ? 'white' : 'currentColor'} />;
    };

    return (
        <div className="w-full mb-8">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                        Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-sm font-data text-primary">
                        {Math.round(progress)}%
                    </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                        className="bg-gradient-primary h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Step Indicators - Desktop */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const status = getStepStatus(stepNumber);
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <motion.div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${status === 'completed'
                                            ? 'bg-success border-success'
                                            : status === 'current' ? 'bg-primary border-primary' : 'bg-background border-border'
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {getStepIcon(step, status)}
                                </motion.div>

                                <div className="mt-2 text-center">
                                    <p className={`text-xs font-medium transition-colors duration-300 ${status === 'current' ? 'text-primary'
                                            : status === 'completed' ? 'text-success' : 'text-muted-foreground'
                                        }`}>
                                        {step.title}
                                    </p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className="flex-1 mx-4">
                                    <div className={`h-0.5 transition-colors duration-300 ${status === 'completed' ? 'bg-success' : 'bg-border'
                                        }`} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step Indicators - Mobile */}
            <div className="md:hidden">
                <div className="flex items-center justify-center space-x-2">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const status = getStepStatus(stepNumber);

                        return (
                            <motion.div
                                key={step.id}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${status === 'completed'
                                        ? 'bg-success'
                                        : status === 'current' ? 'bg-primary' : 'bg-border'
                                    }`}
                                whileHover={{ scale: 1.2 }}
                            />
                        );
                    })}
                </div>

                {/* Current Step Info */}
                <div className="text-center mt-3">
                    <p className="text-sm font-medium text-primary">
                        {steps[currentStep - 1]?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {steps[currentStep - 1]?.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WizardProgress;
