import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Image from 'components/AppImage';

const AboutSection = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "CEO & Co-Founder",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/alexjohnson",
      expertise: ["AI Strategy", "Product Vision", "Leadership"]
    },
    {
      name: "Sarah Kim",
      role: "CTO & Co-Founder",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/sarahkim",
      expertise: ["Machine Learning", "System Architecture", "Engineering"]
    },
    {
      name: "Michael Chen",
      role: "Head of AI Research",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/michaelchen",
      expertise: ["Deep Learning", "NLP", "Computer Vision"]
    },
    {
      name: "Emily Rodriguez",
      role: "VP of Product",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c3c8?w=150&h=150&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/emilyrodriguez",
      expertise: ["Product Strategy", "UX Design", "User Research"]
    }
  ];

  const missionKeywords = [
    { text: "revolutionize", color: "text-primary" },
    { text: "hiring", color: "text-accent" },
    { text: "AI-powered", color: "text-success" },
    { text: "bias-free", color: "text-warning" },
    { text: "intelligent", color: "text-primary" }
  ];

  const handleLearnMore = () => {
    navigate('/about-contact-page');
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
            About HireHub AI
          </h2>
          <p className="text-lg text-muted-foreground font-body leading-relaxed max-w-3xl mx-auto">
            We're on a mission to transform the future of hiring through artificial intelligence and human-centered design.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glassmorphic rounded-[1.25rem] p-8 sm:p-12 elevation-2 mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-heading font-heading-semibold text-foreground mb-6 tracking-wide">
                Our Mission
              </h3>
              <p className="text-lg text-muted-foreground font-body leading-relaxed mb-6">
                To <span className="text-primary font-body-medium">revolutionize</span> the{' '}
                <span className="text-accent font-body-medium">hiring</span> process through{' '}
                <span className="text-success font-body-medium">AI-powered</span> solutions that eliminate bias, enhance efficiency, and create{' '}
                <span className="text-warning font-body-medium">bias-free</span> opportunities for everyone.
              </p>
              <p className="text-base text-muted-foreground font-body leading-relaxed">
                We believe that the right talent should connect with the right opportunities, regardless of background, location, or traditional barriers. Our{' '}
                <span className="text-primary font-body-medium">intelligent</span> platform makes this vision a reality.
              </p>
            </div>
            <div className="relative">
              <div className="glassmorphic rounded-[1.25rem] p-8 elevation-1">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-[1.25rem] flex items-center justify-center mx-auto mb-3 glow-primary">
                      <Icon name="Target" size={20} color="white" />
                    </div>
                    <div className="text-2xl font-heading font-heading-bold text-primary mb-1">
                      100M+
                    </div>
                    <div className="text-xs text-muted-foreground font-caption">
                      Profiles Analyzed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-[1.25rem] flex items-center justify-center mx-auto mb-3 glow-accent">
                      <Icon name="Zap" size={20} color="white" />
                    </div>
                    <div className="text-2xl font-heading font-heading-bold text-accent mb-1">
                      50K+
                    </div>
                    <div className="text-xs text-muted-foreground font-caption">
                      Companies Served
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-success to-success/80 rounded-[1.25rem] flex items-center justify-center mx-auto mb-3 glow-primary">
                      <Icon name="Users" size={20} color="white" />
                    </div>
                    <div className="text-2xl font-heading font-heading-bold text-success mb-1">
                      1M+
                    </div>
                    <div className="text-xs text-muted-foreground font-caption">
                      Successful Hires
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-warning to-warning/80 rounded-[1.25rem] flex items-center justify-center mx-auto mb-3">
                      <Icon name="Award" size={20} color="white" />
                    </div>
                    <div className="text-2xl font-heading font-heading-bold text-warning mb-1">
                      99%
                    </div>
                    <div className="text-xs text-muted-foreground font-caption">
                      Satisfaction Rate
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="text-center mb-12"
          >
            <h3 className="text-2xl font-heading font-heading-semibold text-foreground mb-4 tracking-wide">
              Meet Our Team
            </h3>
            <p className="text-base text-muted-foreground font-body leading-relaxed max-w-2xl mx-auto">
              Our diverse team of AI experts, engineers, and hiring professionals are passionate about creating the future of recruitment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`glassmorphic rounded-[1.25rem] p-6 elevation-2 hover:elevation-3 spring-transition text-center group stagger-${index + 1}`}
              >
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto ring-2 ring-primary/20 group-hover:ring-primary/40 spring-transition">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => window.open(member.linkedin, '_blank')}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 spring-transition glow-primary"
                  >
                    <Icon name="Linkedin" size={14} color="white" />
                  </button>
                </div>
                <h4 className="text-base font-heading font-heading-semibold text-foreground mb-1 tracking-wide">
                  {member.name}
                </h4>
                <p className="text-sm text-muted-foreground font-body mb-4">
                  {member.role}
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {member.expertise.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs font-body rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Vision Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glassmorphic rounded-[1.25rem] p-8 sm:p-12 elevation-2 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 glow-primary">
              <Icon name="Eye" size={28} color="white" />
            </div>
            <h3 className="text-2xl font-heading font-heading-semibold text-foreground mb-6 tracking-wide">
              Our Vision
            </h3>
            <p className="text-lg text-muted-foreground font-body leading-relaxed mb-8">
              A world where every person has equal access to opportunities, where hiring decisions are based purely on merit and potential, and where AI serves as a bridge to connect talent with purpose.
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={handleLearnMore}
              iconName="ArrowRight"
              iconPosition="right"
              iconSize={20}
              className="glow-primary"
            >
              Learn More About Us
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute top-2/3 right-1/6 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-success/25 rounded-full particle-float" style={{ animationDelay: '6s' }}></div>
      </div>
    </section>
  );
};

export default AboutSection;
