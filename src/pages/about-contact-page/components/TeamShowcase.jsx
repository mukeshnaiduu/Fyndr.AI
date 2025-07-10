import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const TeamShowcase = () => {
  const [hoveredMember, setHoveredMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former VP of Engineering at Google with 15+ years in AI and machine learning. Passionate about transforming recruitment through technology.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/sarahchen",
      skills: ["AI Strategy", "Leadership", "Product Vision"],
      achievements: ["Forbes 30 Under 30", "MIT Technology Review Innovator"]
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder",
      bio: "Full-stack architect with expertise in scalable systems and real-time applications. Previously led engineering teams at Uber and Airbnb.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/marcusrodriguez",
      skills: ["System Architecture", "WebRTC", "Cloud Infrastructure"],
      achievements: ["AWS Solutions Architect", "Open Source Contributor"]
    },
    {
      id: 3,
      name: "Dr. Emily Watson",
      role: "Head of AI Research",
      bio: "PhD in Computer Science from Stanford. Specializes in natural language processing and bias-free AI algorithms for recruitment.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/emilywatson",
      skills: ["Machine Learning", "NLP", "Research"],
      achievements: ["Published 50+ Papers", "ACM Fellow"]
    },
    {
      id: 4,
      name: "David Kim",
      role: "Head of Product",
      bio: "Product strategist with 12+ years experience at Microsoft and Slack. Expert in user experience design and product-market fit.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/davidkim",
      skills: ["Product Strategy", "UX Design", "Analytics"],
      achievements: ["Product of the Year Award", "Design Thinking Certified"]
    },
    {
      id: 5,
      name: "Lisa Thompson",
      role: "VP of Marketing",
      bio: "Growth marketing expert with proven track record at HubSpot and Salesforce. Passionate about building authentic brand connections.",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/lisathompson",
      skills: ["Growth Marketing", "Brand Strategy", "Content"],
      achievements: ["Marketing Leader of the Year", "TEDx Speaker"]
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Head of Customer Success",
      bio: "Customer experience specialist with 10+ years at Zendesk and Intercom. Dedicated to ensuring customer satisfaction and success.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://linkedin.com/in/jameswilson",
      skills: ["Customer Success", "Support Strategy", "Training"],
      achievements: ["Customer Champion Award", "CS Leadership Certified"]
    }
  ];

  const handleLinkedInClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
          <div className="inline-flex items-center space-x-2 glassmorphic px-4 py-2 rounded-squircle mb-6">
            <Icon name="Users" size={20} className="text-primary" />
            <span className="text-sm font-caption text-muted-foreground uppercase tracking-wide">
              Our Team
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-heading font-heading-bold text-foreground mb-6">
            Meet the{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Innovators
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our diverse team of experts combines decades of experience in AI, engineering, and human resources to revolutionize the hiring landscape.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`glassmorphic rounded-squircle p-6 group hover:glow-primary spring-transition cursor-pointer stagger-${index + 1}`}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              {/* Avatar */}
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto relative">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent p-1 ${
                    hoveredMember === member.id ? 'animate-pulse' : ''
                  }`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-background">
                      <Image
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 spring-transition"
                      />
                    </div>
                  </div>
                  
                  {/* LinkedIn Badge */}
                  <button
                    onClick={() => handleLinkedInClick(member.linkedin)}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0077B5] rounded-full flex items-center justify-center hover:scale-110 spring-transition elevation-2"
                  >
                    <Icon name="Linkedin" size={16} color="white" />
                  </button>
                </div>

                {/* Member Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-heading font-heading-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary font-body font-body-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs font-caption rounded-squircle"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="space-y-2">
                  {member.achievements.map((achievement, achievementIndex) => (
                    <div
                      key={achievementIndex}
                      className="flex items-center space-x-2 text-xs text-muted-foreground"
                    >
                      <Icon name="Award" size={12} className="text-accent flex-shrink-0" />
                      <span>{achievement}</span>
                    </div>
                  ))}
                </div>

                {/* Hover Effect Overlay */}
                {hoveredMember === member.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-squircle pointer-events-none"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Join Team CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="glassmorphic p-8 rounded-squircle max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-squircle flex items-center justify-center mx-auto mb-4">
              <Icon name="UserPlus" size={32} className="text-primary" />
            </div>
            
            <h3 className="text-2xl font-heading font-heading-semibold text-foreground mb-4">
              Join Our Team
            </h3>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              We're always looking for talented individuals who share our passion for innovation and excellence. Explore career opportunities with us.
            </p>
            
            <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-squircle hover:scale-105 spring-transition glow-primary ripple">
              <Icon name="Briefcase" size={18} />
              <span className="font-body font-body-medium">View Open Positions</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamShowcase;
