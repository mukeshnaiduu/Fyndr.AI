import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';

const HeroSection = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const highlightWords = [
    "revolutionize",
    "intelligent",
    "seamless",
    "innovative",
    "efficient"
  ];

  const missionText = "Our mission is to revolutionize the hiring process through intelligent AI-powered solutions that create seamless connections between talented professionals and forward-thinking companies.";

  const visionWords = [
    "Future",
    "of",
    "hiring",
    "is",
    "here.",
    "Join",
    "us",
    "in",
    "transforming",
    "recruitment."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % highlightWords.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const typingInterval = setInterval(() => {
      setIsTyping(prev => !prev);
    }, 2000);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card to-secondary/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-secondary/40">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Company Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center space-x-4 glassmorphic px-6 py-3 rounded-squircle">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-squircle flex items-center justify-center glow-primary">
              <Icon name="Zap" size={28} color="white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-heading font-heading-bold text-foreground tracking-wide">
                Fyndr.AI
              </h1>
              <p className="text-sm text-muted-foreground font-caption">
                Intelligent Hiring Platform
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-heading-bold text-foreground mb-6 leading-tight">
            About{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Fyndr.AI
            </span>
          </h2>

          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              {missionText.split(' ').map((word, index) => (
                <span
                  key={index}
                  className={`${highlightWords.includes(word.replace(/[.,]/g, '')) &&
                    highlightWords[currentWordIndex] === word.replace(/[.,]/g, '')
                    ? 'text-accent font-body-semibold bg-accent/10 px-1 rounded' : ''
                    } spring-transition`}
                >
                  {word}{' '}
                </span>
              ))}
            </p>
          </div>
        </motion.div>

        {/* Vision Block with Typing Effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glassmorphic p-8 rounded-squircle max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center mb-4">
            <Icon name="Eye" size={24} className="text-primary mr-2" />
            <h3 className="text-xl font-heading font-heading-semibold text-foreground">
              Our Vision
            </h3>
          </div>

          <div className="text-lg text-muted-foreground">
            {visionWords.map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.2,
                  repeat: Infinity,
                  repeatDelay: visionWords.length * 0.2 + 2
                }}
                className="inline-block mr-2"
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              animate={{ opacity: isTyping ? 1 : 0 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="inline-block w-0.5 h-6 bg-accent ml-1"
            />
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { number: "10K+", label: "Job Seekers", icon: "Users" },
            { number: "500+", label: "Companies", icon: "Building" },
            { number: "95%", label: "Success Rate", icon: "TrendingUp" }
          ].map((stat, index) => (
            <div key={index} className="glassmorphic p-6 rounded-squircle text-center group hover:glow-primary spring-transition">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-squircle flex items-center justify-center mx-auto mb-4 group-hover:scale-110 spring-transition">
                <Icon name={stat.icon} size={24} className="text-primary" />
              </div>
              <div className="text-3xl font-heading font-heading-bold text-foreground mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground font-caption">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-primary/20 rounded-full particle-float stagger-${i + 1}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
