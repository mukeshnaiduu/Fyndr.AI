import React from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const EmptyState = ({ type = 'all', onClearFilters }) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: 'Search',
          title: 'No notifications found',
          description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
          action: 'Clear Search',
          actionIcon: 'X'
        };
      case 'unread':
        return {
          icon: 'CheckCircle',
          title: 'All caught up!',
          description: 'You have no unread notifications. Great job staying on top of things!',
          action: 'View All',
          actionIcon: 'Bell'
        };
      case 'archived':
        return {
          icon: 'Archive',
          title: 'No archived notifications',
          description: 'Notifications you archive will appear here for easy reference.',
          action: 'View All',
          actionIcon: 'Bell'
        };
      case 'filtered':
        return {
          icon: 'Filter',
          title: 'No matching notifications',
          description: 'No notifications match your current filters. Try adjusting your criteria.',
          action: 'Clear Filters',
          actionIcon: 'X'
        };
      default:
        return {
          icon: 'Bell',
          title: 'No notifications yet',
          description: 'When you receive notifications, they\'ll appear here. Stay tuned for updates!',
          action: 'Refresh',
          actionIcon: 'RefreshCw'
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-squircle flex items-center justify-center">
          <Icon name={content.icon} size={48} className="text-muted-foreground" />
        </div>
        
        {/* Floating Particles */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/30 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-accent/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 -right-4 w-2 h-2 bg-secondary/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center max-w-md"
      >
        <h3 className="text-xl font-heading font-heading-semibold text-foreground mb-2">
          {content.title}
        </h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {content.description}
        </p>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant="outline"
            onClick={onClearFilters}
            iconName={content.actionIcon}
            iconPosition="left"
            iconSize={16}
            className="glow-primary"
          >
            {content.action}
          </Button>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full"
        />
        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/3 right-1/3 w-3 h-3 bg-accent/20 rounded-full"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-secondary/20 rounded-full"
        />
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-squircle"></div>
    </div>
  );
};

export default EmptyState;
