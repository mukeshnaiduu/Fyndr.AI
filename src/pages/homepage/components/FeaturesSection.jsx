import React from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';

const FeaturesSection = () => {
  const features = [
    {
      icon: 'Brain',
      title: 'AI-Powered Screening',
      description: 'Advanced algorithms analyze resumes, skills, and cultural fit to identify the best candidates automatically.',
      color: 'from-primary to-primary/80',
      stats: '95% Accuracy Rate'
    },
    {
      icon: 'Video',
      title: 'Smart Video Interviews',
      description: 'Conduct bias-free interviews with real-time AI insights, sentiment analysis, and automated scoring.',
      color: 'from-accent to-accent/80',
      stats: '50% Time Saved'
    },
    {
      icon: 'BarChart3',
      title: 'Analytics Dashboard',
      description: 'Comprehensive hiring metrics, candidate pipeline tracking, and performance insights in real-time.',
      color: 'from-success to-success/80',
      stats: '360° Visibility'
    },
    {
      icon: 'Shield',
      title: 'Bias-Free Hiring',
      description: 'Eliminate unconscious bias with AI-driven evaluations focused purely on skills and qualifications.',
      color: 'from-warning to-warning/80',
      stats: '40% More Diverse'
    },
    {
      icon: 'Zap',
      title: 'Instant Matching',
      description: 'Connect the right candidates with the right opportunities using intelligent matching algorithms.',
      color: 'from-secondary to-secondary/80',
      stats: '3x Faster Hiring'
    },
    {
      icon: 'Users',
      title: 'Team Collaboration',
      description: 'Seamless collaboration tools for hiring teams with shared feedback, notes, and decision tracking.',
      color: 'from-primary/80 to-accent/80',
      stats: '100% Team Sync'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-card/50 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-heading-bold text-foreground mb-4 tracking-wide">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground font-body leading-relaxed max-w-3xl mx-auto">
            Discover the cutting-edge tools and capabilities that make HireHub AI the most advanced hiring platform in the market.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className={`glassmorphic rounded-[1.25rem] p-6 elevation-2 hover:elevation-3 spring-transition group stagger-${index + 1}`}
            >
              {/* Feature Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-[1.25rem] flex items-center justify-center glow-primary group-hover:scale-110 spring-transition`}>
                  <Icon name={feature.icon} size={20} color="white" />
                </div>
                <div className="text-xs text-muted-foreground font-data">
                  {feature.stats}
                </div>
              </div>

              {/* Feature Content */}
              <div>
                <h3 className="text-lg font-heading font-heading-semibold text-foreground mb-3 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '85%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full bg-gradient-to-r ${feature.color} rounded-full`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-data">
                    85%
                  </span>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-[1.25rem] opacity-0 group-hover:opacity-100 spring-transition pointer-events-none"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 glassmorphic rounded-[1.25rem] p-8 elevation-2"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-heading font-heading-bold text-primary mb-2">
                99.9%
              </div>
              <div className="text-sm text-muted-foreground font-caption">
                Uptime Guarantee
              </div>
            </div>
            <div>
              <div className="text-2xl font-heading font-heading-bold text-accent mb-2">
                24/7
              </div>
              <div className="text-sm text-muted-foreground font-caption">
                Support Available
              </div>
            </div>
            <div>
              <div className="text-2xl font-heading font-heading-bold text-success mb-2">
                SOC 2
              </div>
              <div className="text-sm text-muted-foreground font-caption">
                Compliant Security
              </div>
            </div>
            <div>
              <div className="text-2xl font-heading font-heading-bold text-warning mb-2">
                GDPR
              </div>
              <div className="text-sm text-muted-foreground font-caption">
                Privacy Ready
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/5 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute top-2/3 right-1/5 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-success/25 rounded-full particle-float" style={{ animationDelay: '6s' }}></div>
      </div>
    </section>
  );
};

export default FeaturesSection;
