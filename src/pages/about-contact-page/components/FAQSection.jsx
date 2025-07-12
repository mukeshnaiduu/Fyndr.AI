import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from 'components/AppIcon';

const FAQSection = () => {
  const [openItems, setOpenItems] = useState(new Set([0])); // First item open by default

  const faqData = [
    {
      question: "What makes HireHub AI different from other hiring platforms?",
      answer: "HireHub AI leverages advanced artificial intelligence to eliminate bias in the hiring process, provides real-time video interview capabilities with AI-powered insights, and offers personalized experiences for job seekers, recruiters, and employers. Our platform combines cutting-edge technology with human-centered design to create more meaningful connections between talent and opportunities."
    },
    {
      question: "How does the AI-powered screening process work?",
      answer: "Our AI analyzes resumes, cover letters, and interview responses using natural language processing and machine learning algorithms. The system evaluates candidates based on skills, experience, and cultural fit while actively working to eliminate unconscious bias. All AI decisions are transparent and can be reviewed by human recruiters to ensure fairness and accuracy."
    },
    {
      question: "Is my personal data secure on Fyndr.AI?",
      answer: "Absolutely. We implement enterprise-grade security measures including end-to-end encryption, secure data storage, and compliance with GDPR, CCPA, and other privacy regulations. Your personal information is never shared without explicit consent, and you have full control over your data visibility and privacy settings."
    },
    {
      question: "What types of interviews can I conduct on the platform?",
      answer: "Fyndr.AI supports various interview formats including one-on-one video interviews, panel interviews, technical coding assessments with real-time collaboration, whiteboard sessions, screen sharing for presentations, and AI-assisted behavioral interviews. All sessions can be recorded for later review with participant consent."
    },
    {
      question: "How much does HireHub AI cost?",
      answer: "We offer flexible pricing plans for different user types. Job seekers can use basic features for free, while premium features are available through subscription. Recruiters and employers have tiered pricing based on company size and feature requirements. Contact our sales team for custom enterprise solutions and volume discounts."
    },
    {
      question: "Can I integrate Fyndr.AI with my existing HR systems?",
      answer: "Yes, Fyndr.AI offers robust API integrations with popular HR systems including Workday, BambooHR, Greenhouse, and many others. Our technical team provides comprehensive support for custom integrations and can work with your IT department to ensure seamless data flow between systems."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We provide 24/7 customer support through multiple channels including live chat, email, and phone. Our support team includes technical specialists, customer success managers, and training experts. We also offer comprehensive documentation, video tutorials, and regular webinars to help users maximize their platform experience."
    },
    {
      question: "How accurate is the AI matching system?",
      answer: "Our AI matching system achieves over 95% accuracy in candidate-job fit predictions, continuously improving through machine learning and user feedback. The system considers multiple factors including skills, experience, cultural fit, and career aspirations. We regularly audit and update our algorithms to maintain high accuracy and fairness standards."
    }
  ];

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const expandAll = () => {
    setOpenItems(new Set(faqData.map((_, index) => index)));
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  return (
    <section className="py-20 bg-gradient-to-b from-card/50 to-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 glassmorphic px-4 py-2 rounded-squircle mb-6">
            <Icon name="HelpCircle" size={20} className="text-primary" />
            <span className="text-sm font-caption text-muted-foreground uppercase tracking-wide">
              FAQ
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-heading font-heading-bold text-foreground mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Find answers to common questions about HireHub AI's features, pricing, and how our platform can transform your hiring process.
          </p>

          {/* Expand/Collapse Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={expandAll}
              className="inline-flex items-center space-x-2 text-sm text-primary hover:text-accent spring-transition"
            >
              <Icon name="ChevronDown" size={16} />
              <span>Expand All</span>
            </button>
            <div className="w-px h-4 bg-border"></div>
            <button
              onClick={collapseAll}
              className="inline-flex items-center space-x-2 text-sm text-primary hover:text-accent spring-transition"
            >
              <Icon name="ChevronUp" size={16} />
              <span>Collapse All</span>
            </button>
          </div>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`glassmorphic rounded-squircle overflow-hidden border spring-transition ${
                openItems.has(index) ? 'glow-primary' : 'hover:border-primary/20'
              } stagger-${index + 1}`}
            >
              {/* Question Header */}
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-muted/50 spring-transition group"
                aria-expanded={openItems.has(index)}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-lg font-heading font-heading-semibold text-foreground pr-4 group-hover:text-primary spring-transition">
                  {item.question}
                </h3>
                
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 spring-transition ${
                  openItems.has(index) ? 'bg-primary text-white' : 'text-primary'
                }`}>
                  <motion.div
                    animate={{ rotate: openItems.has(index) ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon name="ChevronDown" size={16} />
                  </motion.div>
                </div>
              </button>

              {/* Answer Content */}
              <AnimatePresence>
                {openItems.has(index) && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-border/50">
                      <div className="pt-4">
                        <p className="text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                        
                        {/* Helpful Actions */}
                        <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-border/30">
                          <span className="text-sm text-muted-foreground">
                            Was this helpful?
                          </span>
                          <button className="inline-flex items-center space-x-1 text-sm text-success hover:text-success/80 spring-transition">
                            <Icon name="ThumbsUp" size={14} />
                            <span>Yes</span>
                          </button>
                          <button className="inline-flex items-center space-x-1 text-sm text-muted-foreground hover:text-error spring-transition">
                            <Icon name="ThumbsDown" size={14} />
                            <span>No</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="glassmorphic p-8 rounded-squircle">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-squircle flex items-center justify-center mx-auto mb-4">
              <Icon name="MessageCircle" size={32} className="text-primary" />
            </div>
            
            <h3 className="text-2xl font-heading font-heading-semibold text-foreground mb-4">
              Still Have Questions?
            </h3>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Can't find the answer you're looking for? Our support team is here to help you get the most out of HireHub AI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-squircle hover:scale-105 spring-transition glow-primary ripple">
                <Icon name="MessageCircle" size={18} />
                <span className="font-body font-body-medium">Live Chat</span>
              </button>
              
              <button className="inline-flex items-center space-x-2 border border-primary text-primary px-6 py-3 rounded-squircle hover:bg-primary hover:text-white spring-transition ripple">
                <Icon name="Mail" size={18} />
                <span className="font-body font-body-medium">Email Support</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
