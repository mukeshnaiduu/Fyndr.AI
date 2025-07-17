import React from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';


const OptimizationScore = ({ score = 75, tips = [] }) => {
  const defaultTips = [
    {
      id: 1,
      type: 'improvement',
      title: 'Add more quantified achievements',
      description: 'Include specific numbers and metrics in your experience section',
      impact: 'high'
    },
    {
      id: 2,
      type: 'keyword',
      title: 'Include relevant keywords',
      description: 'Add industry-specific terms from your target job descriptions',
      impact: 'medium'
    },
    {
      id: 3,
      type: 'format',
      title: 'Optimize section order',
      description: 'Move your most relevant experience to the top',
      impact: 'low'
    }
  ];

  const activeTips = tips.length > 0 ? tips : defaultTips;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-success to-success/80';
    if (score >= 60) return 'from-warning to-warning/80';
    return 'from-error to-error/80';
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'high': return 'AlertTriangle';
      case 'medium': return 'AlertCircle';
      case 'low': return 'Info';
      default: return 'Info';
    }
  };

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Optimization Score</h3>
        <Button variant="ghost" size="sm">
          <Icon name="RefreshCw" size={16} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center space-x-6 mb-6">
        {/* Circular Progress */}
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted opacity-20"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="progress-radial"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={`${getScoreGradient(score).split(' ')[0].replace('from-', 'text-')}`} />
                <stop offset="100%" className={`${getScoreGradient(score).split(' ')[1].replace('to-', 'text-')}`} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}%
            </span>
          </div>
        </div>

        {/* Score Details */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-xl font-semibold text-foreground">
              {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
            </h4>
            <Icon 
              name={score >= 80 ? 'CheckCircle' : score >= 60 ? 'AlertCircle' : 'XCircle'} 
              size={20} 
              className={getScoreColor(score)}
            />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your resume is {score >= 80 ? 'well-optimized' : score >= 60 ? 'moderately optimized' : 'poorly optimized'} for ATS systems and recruiter preferences.
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-muted-foreground">ATS Compatible</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span className="text-muted-foreground">Keyword Match</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Format Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Tips */}
      <div>
        <h4 className="font-medium text-foreground mb-4">Improvement Suggestions</h4>
        <div className="space-y-3">
          {activeTips.map((tip) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-3 p-3 bg-muted rounded-card hover:bg-muted/80 transition-colors"
            >
              <Icon 
                name={getImpactIcon(tip.impact)} 
                size={16} 
                className={`mt-0.5 ${getImpactColor(tip.impact)}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-sm font-medium text-foreground">{tip.title}</h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tip.impact === 'high' ? 'bg-error/10 text-error' :
                    tip.impact === 'medium'? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                  }`}>
                    {tip.impact} impact
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{tip.description}</p>
              </div>
              <Button variant="ghost" size="sm">
                <Icon name="ArrowRight" size={14} />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizationScore;
