import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const TemplateCarousel = ({ selectedTemplate, onTemplateChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const templates = [
    {
      id: 'modern',
      name: 'Modern Professional',
      preview: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=400&fit=crop',
      description: 'Clean, contemporary design perfect for tech and creative roles',
      features: ['ATS-friendly', 'Modern layout', 'Color accents']
    },
    {
      id: 'classic',
      name: 'Classic Executive',
      preview: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=400&fit=crop',
      description: 'Traditional format ideal for corporate and executive positions',
      features: ['Conservative design', 'Professional', 'Time-tested']
    },
    {
      id: 'creative',
      name: 'Creative Portfolio',
      preview: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=400&fit=crop',
      description: 'Bold design for creative professionals and designers',
      features: ['Visual impact', 'Creative layout', 'Portfolio focus']
    },
    {
      id: 'minimal',
      name: 'Minimal Clean',
      preview: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=400&fit=crop',
      description: 'Minimalist approach focusing on content clarity',
      features: ['Clean lines', 'Content-focused', 'Easy to read']
    },
    {
      id: 'technical',
      name: 'Technical Pro',
      preview: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=400&fit=crop',
      description: 'Structured format perfect for technical and engineering roles',
      features: ['Technical focus', 'Structured', 'Skills emphasis']
    }
  ];

  const nextTemplate = () => {
    setCurrentIndex((prev) => (prev + 1) % templates.length);
  };

  const prevTemplate = () => {
    setCurrentIndex((prev) => (prev - 1 + templates.length) % templates.length);
  };

  const selectTemplate = (template) => {
    onTemplateChange(template.id);
  };

  const visibleTemplates = templates.slice(currentIndex, currentIndex + 3).concat(
    templates.slice(0, Math.max(0, currentIndex + 3 - templates.length))
  );

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Choose Template</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={prevTemplate}>
            <Icon name="ChevronLeft" size={20} />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {templates.length}
          </span>
          <Button variant="ghost" size="icon" onClick={nextTemplate}>
            <Icon name="ChevronRight" size={20} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatePresence mode="wait">
          {visibleTemplates.map((template, index) => (
            <motion.div
              key={`${template.id}-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`relative group cursor-pointer rounded-card overflow-hidden border-2 transition-all duration-300 hover-lift ${
                selectedTemplate === template.id
                  ? 'border-primary shadow-elevation-2'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => selectTemplate(template)}
            >
              <div className="aspect-[3/4] bg-muted overflow-hidden">
                <img
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{template.name}</h4>
                  {selectedTemplate === template.id && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="Check" size={12} color="white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Check" size={14} color="white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TemplateCarousel;
