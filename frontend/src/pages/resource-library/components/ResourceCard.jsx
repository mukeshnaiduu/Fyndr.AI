import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const ResourceCard = ({ resource, onBookmark, onRate, onShare }) => {
  const [isBookmarked, setIsBookmarked] = useState(resource.isBookmarked);
  const [userRating, setUserRating] = useState(resource.userRating || 0);
  const [showRating, setShowRating] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark(resource.id, !isBookmarked);
  };

  const handleRating = (rating) => {
    setUserRating(rating);
    setShowRating(false);
    onRate(resource.id, rating);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'Hard': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
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
    <div className="glassmorphic rounded-xl p-4 hover:shadow-elevation-2 transition-spring group">
      {/* Thumbnail */}
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <Image
          src={resource.thumbnail}
          alt={resource.title}
          className="w-full h-40 object-cover group-hover:scale-105 transition-spring"
        />
        
        {/* Type Icon Overlay */}
        <div className="absolute top-2 left-2 w-8 h-8 glassmorphic rounded-full flex items-center justify-center">
          <Icon name={getTypeIcon(resource.type)} size={16} className="text-primary" />
        </div>

        {/* Progress Overlay */}
        {resource.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div 
              className="h-full bg-primary transition-spring"
              style={{ width: `${resource.progress}%` }}
            />
          </div>
        )}

        {/* Completion Badge */}
        {resource.isCompleted && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center">
            <Icon name="Check" size={16} className="text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-spring">
          {resource.title}
        </h3>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
              {resource.difficulty}
            </span>
            <span className="text-muted-foreground flex items-center space-x-1">
              <Icon name="Clock" size={14} />
              <span>{resource.duration}</span>
            </span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <Icon name="Star" size={14} className="text-yellow-500" />
            <span className="text-muted-foreground">{resource.rating}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-secondary/50 text-secondary-foreground rounded-full"
            >
              {tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="px-2 py-1 text-xs text-muted-foreground">
              +{resource.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {resource.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            {/* Bookmark */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              className={`h-8 w-8 ${isBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              <Icon name={isBookmarked ? "Bookmark" : "BookmarkPlus"} size={16} />
            </Button>

            {/* Rating */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRating(!showRating)}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <Icon name="Star" size={16} />
              </Button>

              {showRating && (
                <div className="absolute bottom-10 left-0 glassmorphic rounded-lg p-2 flex space-x-1 z-10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className={`p-1 rounded ${
                        star <= userRating ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'
                      }`}
                    >
                      <Icon name="Star" size={14} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Share */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onShare(resource)}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              <Icon name="Share2" size={16} />
            </Button>
          </div>

          {/* View Button */}
          <Button variant="outline" size="sm">
            <Icon name="Eye" size={14} className="mr-1" />
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
