import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Image from 'components/AppImage';

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Senior Software Engineer",
      company: "TechCorp",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c3c8?w=150&h=150&fit=crop&crop=face",
      content: `Fyndr.AI transformed my job search completely. The AI-powered matching connected me with opportunities I never would have found otherwise. The interview preparation tools were incredibly helpful, and I landed my dream job within 3 weeks!`,
      rating: 5,
      skills: ["React", "Node.js", "Python", "AWS"],
      outcome: "Hired in 3 weeks",
      type: "job-seeker"
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "Head of Talent Acquisition",
      company: "InnovateLabs",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: `As a recruiter, Fyndr.AI has been a game-changer. The bias-free screening and intelligent candidate matching have improved our hiring quality by 40%. The platform saves us countless hours while finding better candidates.`,
      rating: 5,
      skills: ["Talent Acquisition", "AI Screening", "Team Building"],
      outcome: "40% better quality",
      type: "recruiter"
    },
    {
      id: 3,
      name: "Emily Watson",
      role: "VP of Engineering",
      company: "StartupXYZ",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: `Fyndr.AI helped us scale our engineering team from 5 to 50 people in just 6 months. The analytics dashboard gives us incredible insights into our hiring funnel, and the collaboration tools keep our entire team aligned.`,
      rating: 5,
      skills: ["Engineering Leadership", "Team Scaling", "Analytics"],
      outcome: "10x team growth",
      type: "employer"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Product Manager",
      company: "FinanceFlow",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: `The video interview feature with AI insights is phenomenal. It helped me prepare better and understand my strengths. The real-time feedback during practice sessions boosted my confidence significantly.`,
      rating: 5,
      skills: ["Product Management", "Strategy", "Analytics"],
      outcome: "Confidence boost",
      type: "job-seeker"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      role: "HR Director",
      company: "GlobalTech",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      content: `The compliance tracking and bias-free hiring features ensure we meet all diversity goals while maintaining high standards. Fyndr.AI has made our hiring process more efficient and equitable.`,
      rating: 5,
      skills: ["HR Management", "Compliance", "Diversity"],
      outcome: "100% compliance",
      type: "employer"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'job-seeker': return 'from-primary to-primary/80';
      case 'recruiter': return 'from-accent to-accent/80';
      case 'employer': return 'from-success to-success/80';
      default: return 'from-primary to-primary/80';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'job-seeker': return 'User';
      case 'recruiter': return 'Search';
      case 'employer': return 'Building';
      default: return 'User';
    }
  };

  const currentTestimonial = testimonials[currentIndex];

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
            Success Stories
          </h2>
          <p className="text-lg text-muted-foreground font-body leading-relaxed max-w-2xl mx-auto">
            Hear from thousands of professionals who transformed their careers and hiring processes with Fyndr.AI.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="glassmorphic rounded-[1.25rem] p-8 sm:p-12 elevation-3"
            >
              {/* Testimonial Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20">
                      <Image
                        src={currentTestimonial.avatar}
                        alt={currentTestimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${getTypeColor(currentTestimonial.type)} rounded-full flex items-center justify-center`}>
                      <Icon name={getTypeIcon(currentTestimonial.type)} size={12} color="white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-heading-semibold text-foreground tracking-wide">
                      {currentTestimonial.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-body">
                      {currentTestimonial.role} at {currentTestimonial.company}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Icon key={i} name="Star" size={16} className="text-warning fill-current" />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground font-caption">
                    {currentTestimonial.outcome}
                  </div>
                </div>
              </div>

              {/* Testimonial Content */}
              <blockquote className="text-lg text-foreground font-body leading-relaxed mb-8 italic">
                "{currentTestimonial.content}"
              </blockquote>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {currentTestimonial.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary text-xs font-body font-body-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Icon name="Quote" size={48} className="text-primary" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              iconName="ChevronLeft"
              iconSize={20}
            />

            {/* Dots Indicator */}
            <div className="flex items-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2 h-2 rounded-full spring-transition ${index === currentIndex
                      ? 'bg-primary scale-125' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              iconName="ChevronRight"
              iconSize={20}
            />
          </div>

          {/* Auto-play Toggle */}
          <div className="flex items-center justify-center mt-4">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="flex items-center space-x-2 text-xs text-muted-foreground hover:text-foreground spring-transition"
            >
              <Icon name={isAutoPlaying ? "Pause" : "Play"} size={14} />
              <span>{isAutoPlaying ? 'Pause' : 'Play'} Auto-scroll</span>
            </button>
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-heading font-heading-bold text-primary mb-2">
              4.9/5
            </div>
            <div className="text-sm text-muted-foreground font-caption">
              Average Rating
            </div>
          </div>
          <div>
            <div className="text-3xl font-heading font-heading-bold text-accent mb-2">
              25K+
            </div>
            <div className="text-sm text-muted-foreground font-caption">
              Success Stories
            </div>
          </div>
          <div>
            <div className="text-3xl font-heading font-heading-bold text-success mb-2">
              98%
            </div>
            <div className="text-sm text-muted-foreground font-caption">
              Satisfaction Rate
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-success/25 rounded-full particle-float" style={{ animationDelay: '5s' }}></div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
