import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const CourseResources = ({ resources }) => {
  const [downloadingItems, setDownloadingItems] = useState(new Set());

  const handleDownload = async (resourceId, filename) => {
    setDownloadingItems(prev => new Set([...prev, resourceId]));
    
    // Simulate download delay
    setTimeout(() => {
      setDownloadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(resourceId);
        return newSet;
      });
      
      // Create download link
      const link = document.createElement('a');
      link.href = '#'; // In real app, this would be the actual file URL
      link.download = filename;
      link.click();
    }, 2000);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return 'FileText';
      case 'video':
        return 'Play';
      case 'audio':
        return 'Volume2';
      case 'image':
        return 'Image';
      case 'code':
        return 'Code';
      case 'zip':
        return 'Archive';
      default:
        return 'File';
    }
  };

  const getFileColor = (type) => {
    switch (type) {
      case 'pdf':
        return 'text-red-500';
      case 'video':
        return 'text-blue-500';
      case 'audio':
        return 'text-purple-500';
      case 'image':
        return 'text-green-500';
      case 'code':
        return 'text-yellow-500';
      case 'zip':
        return 'text-gray-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const groupedResources = resources.reduce((acc, resource) => {
    const category = resource.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(resource);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Download All Button */}
      <div className="glassmorphic-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Course Resources</h3>
            <p className="text-muted-foreground">
              Download all course materials including slides, code samples, and additional resources
            </p>
          </div>
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
            onClick={() => handleDownload('all', 'course-resources.zip')}
            disabled={downloadingItems.has('all')}
            loading={downloadingItems.has('all')}
          >
            Download All
          </Button>
        </div>
      </div>

      {/* Resource Categories */}
      {Object.entries(groupedResources).map(([category, categoryResources]) => (
        <div key={category} className="glassmorphic-card p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Folder" size={20} className="text-primary mr-2" />
            {category}
          </h4>
          
          <div className="space-y-3">
            {categoryResources.map((resource) => {
              const isDownloading = downloadingItems.has(resource.id);
              
              return (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-4 glassmorphic-surface rounded-lg hover:bg-white/10 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center ${getFileColor(resource.type)}`}>
                      <Icon name={getFileIcon(resource.type)} size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-foreground truncate">{resource.title}</h5>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-muted-foreground uppercase">
                          {resource.type}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(resource.size)}
                        </span>
                        {resource.isNew && (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {resource.canPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Eye"
                        onClick={() => console.log('Preview:', resource.title)}
                      >
                        Preview
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Download"
                      onClick={() => handleDownload(resource.id, resource.filename)}
                      disabled={isDownloading}
                      loading={isDownloading}
                    >
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Additional Resources */}
      <div className="glassmorphic-card p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="ExternalLink" size={20} className="text-primary mr-2" />
          External Resources
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="https://reactjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 glassmorphic-surface rounded-lg hover:bg-white/10 transition-colors duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <Icon name="BookOpen" size={20} className="text-primary" />
              <div>
                <h5 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  React Documentation
                </h5>
                <p className="text-sm text-muted-foreground">Official React documentation</p>
              </div>
              <Icon name="ExternalLink" size={16} className="text-muted-foreground ml-auto" />
            </div>
          </a>

          <a
            href="https://github.com/facebook/react"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 glassmorphic-surface rounded-lg hover:bg-white/10 transition-colors duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Github" size={20} className="text-primary" />
              <div>
                <h5 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  React GitHub Repository
                </h5>
                <p className="text-sm text-muted-foreground">Source code and issues</p>
              </div>
              <Icon name="ExternalLink" size={16} className="text-muted-foreground ml-auto" />
            </div>
          </a>

          <a
            href="https://stackoverflow.com/questions/tagged/reactjs"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 glassmorphic-surface rounded-lg hover:bg-white/10 transition-colors duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <Icon name="HelpCircle" size={20} className="text-primary" />
              <div>
                <h5 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  Stack Overflow
                </h5>
                <p className="text-sm text-muted-foreground">Community Q&A</p>
              </div>
              <Icon name="ExternalLink" size={16} className="text-muted-foreground ml-auto" />
            </div>
          </a>

          <a
            href="https://reactjs.org/community/support.html"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 glassmorphic-surface rounded-lg hover:bg-white/10 transition-colors duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Users" size={20} className="text-primary" />
              <div>
                <h5 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  React Community
                </h5>
                <p className="text-sm text-muted-foreground">Forums and support</p>
              </div>
              <Icon name="ExternalLink" size={16} className="text-muted-foreground ml-auto" />
            </div>
          </a>
        </div>
      </div>

      {/* Offline Downloads */}
      <div className="glassmorphic-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Wifi" size={20} className="text-primary mr-2" />
            Offline Access
          </h4>
          <Button variant="outline" size="sm">
            Manage Downloads
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 glassmorphic-surface rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Download" size={16} className="text-success" />
              <span className="text-sm text-foreground">Video Lectures (HD)</span>
            </div>
            <span className="text-sm text-muted-foreground">2.1 GB</span>
          </div>
          
          <div className="flex items-center justify-between p-3 glassmorphic-surface rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Download" size={16} className="text-success" />
              <span className="text-sm text-foreground">Course Materials</span>
            </div>
            <span className="text-sm text-muted-foreground">45 MB</span>
          </div>
          
          <div className="flex items-center justify-between p-3 glassmorphic-surface rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Clock" size={16} className="text-warning" />
              <span className="text-sm text-foreground">Quiz Data (Pending)</span>
            </div>
            <span className="text-sm text-muted-foreground">12 MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseResources;
