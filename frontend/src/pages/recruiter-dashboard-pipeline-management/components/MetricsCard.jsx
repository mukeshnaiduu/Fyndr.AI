import React from 'react';
import Icon from 'components/AppIcon';

const MetricsCard = ({ title, value, change, changeType, icon, color = 'primary' }) => {
  const getColorClasses = (colorType) => {
    const colors = {
      primary: 'text-primary bg-primary/10',
      success: 'text-success bg-success/10',
      warning: 'text-warning bg-warning/10',
      error: 'text-error bg-error/10',
      accent: 'text-accent bg-accent/10'
    };
    return colors[colorType] || colors.primary;
  };

  const getChangeColor = (type) => {
    return type === 'increase' ? 'text-success' : type === 'decrease' ? 'text-error' : 'text-muted-foreground';
  };

  return (
    <div className="glassmorphic-card p-6 hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(color)}`}>
          <Icon name={icon} size={24} />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 ${getChangeColor(changeType)}`}>
            <Icon 
              name={changeType === 'increase' ? 'TrendingUp' : changeType === 'decrease' ? 'TrendingDown' : 'Minus'} 
              size={16} 
            />
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
};

export default MetricsCard;
