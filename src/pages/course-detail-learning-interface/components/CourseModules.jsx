import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const CourseModules = ({ modules, currentModule, onModuleSelect, onLessonSelect }) => {
  const [expandedModules, setExpandedModules] = useState(new Set([0]));

  const toggleModule = (moduleIndex) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleIndex)) {
      newExpanded.delete(moduleIndex);
    } else {
      newExpanded.add(moduleIndex);
    }
    setExpandedModules(newExpanded);
  };

  const calculateModuleProgress = (module) => {
    const completedLessons = module.lessons.filter(lesson => lesson.completed).length;
    return (completedLessons / module.lessons.length) * 100;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLessonIcon = (lesson) => {
    switch (lesson.type) {
      case 'video':
        return 'Play';
      case 'quiz':
        return 'HelpCircle';
      case 'assignment':
        return 'FileText';
      case 'reading':
        return 'BookOpen';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="space-y-4">
      {modules.map((module, moduleIndex) => {
        const isExpanded = expandedModules.has(moduleIndex);
        const progress = calculateModuleProgress(module);
        const isCurrentModule = currentModule === moduleIndex;

        return (
          <div
            key={moduleIndex}
            className={`glassmorphic-card overflow-hidden transition-all duration-300 ${
              isCurrentModule ? 'ring-2 ring-primary/50' : ''
            }`}
          >
            {/* Module Header */}
            <button
              onClick={() => toggleModule(moduleIndex)}
              className="w-full p-6 text-left hover:bg-white/5 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    progress === 100 
                      ? 'bg-success/20 text-success' 
                      : isCurrentModule 
                        ? 'bg-primary/20 text-primary' :'bg-muted/20 text-muted-foreground'
                  }`}>
                    {progress === 100 ? (
                      <Icon name="CheckCircle" size={20} />
                    ) : (
                      <span className="font-semibold">{moduleIndex + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">{module.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{module.lessons.length} lessons</span>
                      <span>{formatDuration(module.duration)}</span>
                      <span>{Math.round(progress)}% complete</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Progress Ring */}
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white/20"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${2 * Math.PI * 12}`}
                        strokeDashoffset={`${2 * Math.PI * 12 * (1 - progress / 100)}`}
                        className="text-primary transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-foreground">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>

                  <Icon
                    name={isExpanded ? "ChevronUp" : "ChevronDown"}
                    size={20}
                    className="text-muted-foreground transition-transform duration-200"
                  />
                </div>
              </div>
            </button>

            {/* Module Content */}
            {isExpanded && (
              <div className="border-t border-white/10">
                {/* Module Description */}
                {module.description && (
                  <div className="px-6 py-4 bg-white/5">
                    <p className="text-muted-foreground text-sm">{module.description}</p>
                  </div>
                )}

                {/* Lessons List */}
                <div className="divide-y divide-white/10">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <button
                      key={lessonIndex}
                      onClick={() => onLessonSelect(moduleIndex, lessonIndex)}
                      className="w-full p-4 text-left hover:bg-white/5 transition-colors duration-200 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                          lesson.completed
                            ? 'bg-success/20 text-success'
                            : lesson.current
                              ? 'bg-primary/20 text-primary' :'bg-muted/20 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                        }`}>
                          {lesson.completed ? (
                            <Icon name="Check" size={16} />
                          ) : (
                            <Icon name={getLessonIcon(lesson)} size={16} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium transition-colors duration-200 ${
                            lesson.current ? 'text-primary' : 'text-foreground group-hover:text-primary'
                          }`}>
                            {lesson.title}
                          </h4>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-muted-foreground capitalize">
                              {lesson.type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(lesson.duration)}
                            </span>
                            {lesson.isPreview && (
                              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                                Preview
                              </span>
                            )}
                          </div>
                        </div>

                        {lesson.current && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Module Actions */}
                <div className="p-4 bg-white/5 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {module.lessons.filter(l => l.completed).length} of {module.lessons.length} lessons completed
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onModuleSelect(moduleIndex)}
                    >
                      Start Module
                    </Button>
                    {progress > 0 && progress < 100 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onModuleSelect(moduleIndex)}
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CourseModules;
