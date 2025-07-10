import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const CourseTabNavigation = ({ activeTab, onTabChange, children }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BookOpen' },
    { id: 'modules', label: 'Modules', icon: 'List' },
    { id: 'discussion', label: 'Discussion', icon: 'MessageCircle' },
    { id: 'resources', label: 'Resources', icon: 'Download' }
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-white/20 mb-6">
        <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground hover:bg-white/10'
              }`}
            >
              <Icon name={tab.icon} size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {children}
      </div>
    </div>
  );
};

export default CourseTabNavigation;
