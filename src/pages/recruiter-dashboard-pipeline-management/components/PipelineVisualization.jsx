import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const PipelineVisualization = () => {
  const [pipelineData] = useState([
    { stage: 'Applied', count: 245, color: 'bg-blue-500', percentage: 100 },
    { stage: 'Screening', count: 156, color: 'bg-yellow-500', percentage: 64 },
    { stage: 'Interview', count: 89, color: 'bg-orange-500', percentage: 36 },
    { stage: 'Technical', count: 45, color: 'bg-purple-500', percentage: 18 },
    { stage: 'Final', count: 23, color: 'bg-green-500', percentage: 9 },
    { stage: 'Offer', count: 12, color: 'bg-emerald-500', percentage: 5 }
  ]);

  const handleStageClick = (stage) => {
    console.log(`Clicked on ${stage} stage`);
  };

  return (
    <div className="glassmorphic-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Candidate Pipeline</h2>
        <div className="flex items-center space-x-2">
          <select className="glassmorphic border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground bg-transparent">
            <option value="all">All Positions</option>
            <option value="frontend">Frontend Developer</option>
            <option value="backend">Backend Developer</option>
            <option value="fullstack">Full Stack Developer</option>
          </select>
          <button className="glassmorphic border border-white/20 rounded-lg p-2 hover:bg-white/10 transition-all duration-200">
            <Icon name="MoreHorizontal" size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {pipelineData.map((stage, index) => (
          <div key={stage.stage} className="relative">
            <div 
              className="flex items-center justify-between p-4 glassmorphic-surface rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
              onClick={() => handleStageClick(stage.stage)}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${stage.color}`}></div>
                <div>
                  <h3 className="font-medium text-foreground">{stage.stage}</h3>
                  <p className="text-sm text-muted-foreground">{stage.percentage}% conversion</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-foreground">{stage.count}</span>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </div>
            </div>
            
            {/* Funnel Connector */}
            {index < pipelineData.length - 1 && (
              <div className="flex justify-center my-2">
                <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Conversion Rate</span>
          <span className="font-medium text-success">4.9%</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-muted-foreground">Avg. Time to Hire</span>
          <span className="font-medium text-foreground">28 days</span>
        </div>
      </div>
    </div>
  );
};

export default PipelineVisualization;
