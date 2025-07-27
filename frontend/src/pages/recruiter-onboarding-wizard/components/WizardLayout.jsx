import React from 'react';
import { motion } from 'framer-motion';

const WizardLayout = ({ children, onSaveAndExit, showSaveOption = true }) => {
    return (
        <div className="min-h-screen bg-background dark:bg-background">
            <header className="border-b border-border dark:border-border">
                <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-1 items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <img
                                src="/assets/images/logo.svg"
                                alt="Fyndr.AI"
                                className="h-8 w-auto"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/120x40?text=Fyndr.AI";
                                }}
                            />
                            <span className="hidden font-medium sm:inline-block text-foreground dark:text-foreground">
                                Recruiter Onboarding
                            </span>
                        </div>
                        {showSaveOption && onSaveAndExit && (
                            <button
                                onClick={onSaveAndExit}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none text-primary underline-offset-4 hover:underline dark:text-primary"
                            >
                                Save & Exit
                            </button>
                        )}
                    </div>
                </div>
            </header>
            <main className="container px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default WizardLayout;
