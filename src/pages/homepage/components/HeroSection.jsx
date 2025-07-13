import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const HeroSection = () => {
  const [currentText, setCurrentText] = useState(0);
  const navigate = useNavigate();

  const heroTexts = [
    "AI-Powered Hiring Revolution",
    "Smart Recruitment Solutions",
    "Future of Talent Acquisition"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % heroTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate('/authentication-login-register');
  };

  const handleLearnMore = () => {
    navigate('/about-contact-page');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card to-secondary/20">
      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/20 z-10" />
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            x: [0, -40, 0],
            y: [0, 20, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-accent/10 to-success/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glassmorphic rounded-[2rem] p-8 sm:p-12 lg:p-16 elevation-3"
        >
          {/* Logo and Brand */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center space-x-4 mb-8"
          >
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-[1.25rem] flex items-center justify-center glow-primary">
                <Icon name="Zap" size={32} color="white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-heading-bold text-foreground tracking-wide">
                Fyndr.AI
              </h1>
              <p className="text-sm text-muted-foreground font-caption">
                Intelligent Hiring Platform
              </p>
            </div>
          </motion.div>

          {/* Dynamic Typing Text */}
          <motion.div
            key={currentText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-heading-bold text-foreground leading-tight tracking-wide">
              {heroTexts[currentText]}
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-muted-foreground font-body leading-relaxed max-w-3xl mx-auto mb-12"
          >
            Transform your hiring process with AI-powered screening, bias-free interviews, and intelligent candidate matching. Join thousands of companies revolutionizing their recruitment strategy.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
          >
            <Button
              variant="default"
              size="lg"
              onClick={handleGetStarted}
              iconName="ArrowRight"
              iconPosition="right"
              iconSize={20}
              className="glow-primary"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleLearnMore}
              iconName="Play"
              iconPosition="left"
              iconSize={20}
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-heading font-heading-bold text-primary mb-2">
                10K+
              </div>
              <div className="text-sm text-muted-foreground font-caption">
                Companies Trust Us
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-heading-bold text-accent mb-2">
                95%
              </div>
              <div className="text-sm text-muted-foreground font-caption">
                Hiring Success Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-heading-bold text-success mb-2">
                50%
              </div>
              <div className="text-sm text-muted-foreground font-caption">
                Time Reduction
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Particles - hide on mobile for overlap prevention */}
      <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full particle-float"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-accent/40 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-secondary/35 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-success/30 rounded-full particle-float" style={{ animationDelay: '6s' }}></div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center space-y-2 text-muted-foreground"
        >
          <span className="text-xs font-caption">Scroll to explore</span>
          <Icon name="ChevronDown" size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
