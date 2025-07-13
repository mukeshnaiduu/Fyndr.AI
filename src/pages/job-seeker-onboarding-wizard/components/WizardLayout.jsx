import React from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const WizardLayout = ({ children, onSaveAndExit, showSaveOption = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-glass-border">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary">
              <Icon name="Zap" size={20} color="white" />
            </div>
            <span className="font-heading font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
              Fyndr.AI
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {showSaveOption && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSaveAndExit}
                iconName="Save"
                iconPosition="left"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="hidden sm:inline">Save & Exit</span>
                <span className="sm:hidden">Save</span>
              </Button>
            )}

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Shield" size={16} />
              <span className="hidden sm:inline">Secure Setup</span>
            </div>
          </div>
        </div>
      </header>

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
          © {new Date().getFullYear()} Fyndr.AI
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
