import React from 'react';
import Icon from 'components/AppIcon';

const TeamMetricsCard = ({ title, value, change, icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    accent: 'bg-accent/10 text-accent'
  };

  return (
    <div className="glass-card p-6 hover-lift">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <Icon 
                name={change.type === 'increase' ? 'TrendingUp' : 'TrendingDown'} 
                size={14} 
                className={change.type === 'increase' ? 'text-success' : 'text-error'}
              />
              <span className={`text-xs ml-1 ${
                change.type === 'increase' ? 'text-success' : 'text-error'
              }`}>
                {change.value}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-card ${colorClasses[color]}`}>
          <Icon name={icon} size={24} />
        </div>
      </div>
    </div>
  );
};

export default TeamMetricsCard;
