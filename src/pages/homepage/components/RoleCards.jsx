import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const RoleCards = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'job-seeker',
      title: 'Job Seeker',
      subtitle: 'Find Your Dream Career',
      description: 'Discover opportunities with AI-powered job matching, skill assessments, and personalized career guidance.',
      icon: 'User',
      color: 'from-primary to-primary/80',
      features: [
        'AI Resume Screening',
        'Skill Development Tracking',
        'Interview Preparation',
        'Career Path Guidance'
      ],
      cta: 'Start Job Search',
      stats: '50K+ Jobs Available'
    },
    {
      id: 'recruiter',
      title: 'Recruiter',
      subtitle: 'Streamline Your Hiring',
      description: 'Leverage AI-powered candidate screening, bias-free interviews, and intelligent matching algorithms.',
      icon: 'Search',
      color: 'from-accent to-accent/80',
      features: [
        'Automated Screening',
        'Bias-Free Interviews',
        'Candidate Analytics',
        'Team Collaboration'
      ],
      cta: 'Start Recruiting',
      stats: '10K+ Recruiters Active'
    },
    {
      id: 'employer',
      title: 'Employer',
      subtitle: 'Build Your Dream Team',
      description: 'Manage your entire hiring funnel with comprehensive analytics, team tools, and data-driven insights.',
      icon: 'Building',
      color: 'from-success to-success/80',
      features: [
        'Hiring Funnel Management',
        'Team Collaboration Tools',
        'Analytics Dashboard',
        'Compliance Tracking'
      ],
      cta: 'Hire Top Talent',
      stats: '5K+ Companies Hiring'
    }
  ];

  const handleRoleSelect = (roleId) => {
    // Store selected role for registration flow
    localStorage.setItem('selectedRole', roleId);
    navigate('/authentication-login-register');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
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
    <section className="py-20 bg-gradient-to-b from-background to-card/50">
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
            Choose Your Path
          </h2>
          <p className="text-lg text-muted-foreground font-body leading-relaxed max-w-2xl mx-auto">
            Whether you're seeking opportunities, finding talent, or building teams, Fyndr.AI has the perfect solution for your needs.
          </p>
        </motion.div>

        {/* Role Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className={`glassmorphic rounded-[1.25rem] p-8 elevation-2 hover:elevation-3 spring-transition group stagger-${index + 1}`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${role.color} rounded-[1.25rem] flex items-center justify-center glow-primary group-hover:scale-110 spring-transition`}>
                  <Icon name={role.icon} size={24} color="white" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-caption">
                    {role.stats}
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="mb-6">
                <h3 className="text-xl font-heading font-heading-semibold text-foreground mb-2 tracking-wide">
                  {role.title}
                </h3>
                <p className="text-sm text-primary font-body font-body-medium mb-3">
                  {role.subtitle}
                </p>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {role.description}
                </p>
              </div>

              {/* Features List */}
              <div className="mb-8">
                <ul className="space-y-2">
                  {role.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="text-xs text-muted-foreground font-body">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Button
                variant="default"
                size="sm"
                fullWidth
                onClick={() => handleRoleSelect(role.id)}
                iconName="ArrowRight"
                iconPosition="right"
                iconSize={16}
                className="group-hover:glow-primary"
              >
                {role.cta}
              </Button>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-[1.25rem] opacity-0 group-hover:opacity-100 spring-transition pointer-events-none"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-sm text-muted-foreground font-body mb-6">
            Not sure which path is right for you?
          </p>
          <Button
            variant="outline"
            size="default"
            onClick={() => navigate('/about-contact-page')}
            iconName="HelpCircle"
            iconPosition="left"
            iconSize={18}
          >
            Get Personalized Guidance
          </Button>
        </motion.div>
      </div>

      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-success/25 rounded-full particle-float" style={{ animationDelay: '5s' }}></div>
      </div>
    </section>
  );
};

export default RoleCards;
