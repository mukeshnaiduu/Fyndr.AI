import React from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';

const NotificationStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Total',
      value: stats.total,
      icon: 'Bell',
      color: 'text-foreground',
      bgColor: 'bg-muted'
    },
    {
      label: 'Unread',
      value: stats.unread,
      icon: 'Mail',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'High Priority',
      value: stats.high,
      icon: 'AlertTriangle',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      label: 'Today',
      value: stats.today,
      icon: 'Clock',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  return (
    <div className="glassmorphic rounded-squircle p-4 border elevation-1">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="BarChart3" size={20} className="text-muted-foreground" />
        <h3 className="font-heading font-heading-semibold text-foreground">
          Statistics
        </h3>
      </div>

      <div className="space-y-3">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-squircle bg-background/50 hover:bg-background/80 spring-transition"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-squircle flex items-center justify-center ${item.bgColor}`}>
                <Icon name={item.icon} size={16} className={item.color} />
              </div>
              <span className="text-sm font-body font-body-medium text-foreground">
                {item.label}
              </span>
            </div>
            <span className={`text-lg font-heading font-heading-bold ${item.color}`}>
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="mt-6 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Read Progress</span>
            <span>{Math.round(((stats.total - stats.unread) / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((stats.total - stats.unread) / stats.total) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-success h-2 rounded-full"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Priority Distribution</span>
            <span>{Math.round((stats.high / stats.total) * 100)}% High</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.high / stats.total) * 100}%` }}
              transition={{ duration: 1, delay: 0.7 }}
              className="bg-error h-2 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
        <div className="absolute top-4 right-4 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
      </div>
    </div>
  );
};

export default NotificationStats;
