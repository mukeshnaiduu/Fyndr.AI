import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const FeaturedCarousel = ({ featuredResources, onResourceClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredResources.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredResources.length, isAutoPlaying]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredResources.length) % featuredResources.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredResources.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentResource = featuredResources[currentIndex];

  const getBadgeColor = (type) => {
    switch (type) {
      case 'trending': return 'bg-gradient-to-r from-pink-500 to-rose-500';
      case 'new': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'popular': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'recommended': return 'bg-gradient-to-r from-purple-500 to-violet-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return 'Play';
      case 'article': return 'FileText';
      case 'practice': return 'Code';
      case 'quiz': return 'HelpCircle';
      default: return 'BookOpen';
    }
  };

  return (
    <div className="relative glassmorphic rounded-2xl overflow-hidden group">
      {/* Main Content */}
      <div className="relative h-80 md:h-96">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={currentResource.image}
            alt={currentResource.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
          {/* Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getBadgeColor(currentResource.badge)}`}>
              <Icon name="TrendingUp" size={14} className="mr-1" />
              {currentResource.badge.charAt(0).toUpperCase() + currentResource.badge.slice(1)}
            </span>
          </div>

          {/* Title and Description */}
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-2">
              {currentResource.title}
            </h2>
            <p className="text-white/90 text-sm md:text-base line-clamp-2 mb-4">
              {currentResource.description}
            </p>
          </div>

          {/* Meta Information */}
          <div className="flex items-center space-x-4 mb-4 text-white/80 text-sm">
            <div className="flex items-center space-x-1">
              <Icon name={getTypeIcon(currentResource.type)} size={16} />
              <span className="capitalize">{currentResource.type}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={16} />
              <span>{currentResource.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Star" size={16} className="text-yellow-400" />
              <span>{currentResource.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Users" size={16} />
              <span>{currentResource.enrollments} enrolled</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => onResourceClick(currentResource)}
              className="bg-primary hover:bg-primary/90"
              iconName="Play"
              iconPosition="left"
            >
              Start Learning
            </Button>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              iconName="BookmarkPlus"
              iconPosition="left"
            >
              Save for Later
            </Button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 text-white border-white/20 opacity-0 group-hover:opacity-100 transition-spring"
        >
          <Icon name="ChevronLeft" size={20} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 text-white border-white/20 opacity-0 group-hover:opacity-100 transition-spring"
        >
          <Icon name="ChevronRight" size={20} />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {featuredResources.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-spring ${
              index === currentIndex 
                ? 'bg-white' :'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Auto-play Indicator */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="w-8 h-8 bg-black/20 hover:bg-black/40 text-white border-white/20"
        >
          <Icon name={isAutoPlaying ? "Pause" : "Play"} size={16} />
        </Button>
      </div>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-primary transition-none"
            style={{
              animation: 'progress 5s linear infinite',
              animationPlayState: isAutoPlaying ? 'running' : 'paused'
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default FeaturedCarousel;
