import React from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const WizardLayout = ({ children, onSaveAndExit, showSaveOption = true }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card rounded-card p-6 lg:p-8 shadow-glass"
                >
                    {children}
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="mt-auto py-6 text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-4">
                    <span>© {new Date().getFullYear()} Fyndr.AI</span>
                    <span>•</span>
                    <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                    <span>•</span>
                    <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                </div>
            </footer>
        </div>
    );
};

export default WizardLayout;
