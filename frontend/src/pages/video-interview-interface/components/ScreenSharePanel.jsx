import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const ScreenSharePanel = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareType, setShareType] = useState('screen');
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationTool, setAnnotationTool] = useState('pen');
  const [annotationColor, setAnnotationColor] = useState('#ef4444');
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const canvasRef = useRef(null);
  const screenRef = useRef(null);

  const shareTypes = [
    { id: 'screen', name: 'Entire Screen', icon: 'Monitor' },
    { id: 'window', name: 'Application Window', icon: 'Square' },
    { id: 'tab', name: 'Browser Tab', icon: 'Globe' }
  ];

  const annotationTools = [
    { id: 'pen', name: 'Pen', icon: 'Pen' },
    { id: 'arrow', name: 'Arrow', icon: 'ArrowRight' },
    { id: 'rectangle', name: 'Rectangle', icon: 'Square' },
    { id: 'circle', name: 'Circle', icon: 'Circle' },
    { id: 'text', name: 'Text', icon: 'Type' }
  ];

  const annotationColors = [
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899'  // pink
  ];

  useEffect(() => {
    // Mock screen sharing status
    if (isSharing) {
      const interval = setInterval(() => {
        // Simulate screen content updates
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isSharing]);

  const handleStartSharing = async () => {
    try {
      // In a real implementation, this would use navigator.mediaDevices.getDisplayMedia()
      setIsSharing(true);
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const handleStopSharing = () => {
    setIsSharing(false);
    setIsAnnotating(false);
    setAnnotations([]);
  };

  const handleAnnotationStart = (e) => {
    if (!isAnnotating) return;

    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPath([{ x, y }]);
  };

  const handleAnnotationMove = (e) => {
    if (!isDrawing || !isAnnotating) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPath(prev => [...prev, { x, y }]);
  };

  const handleAnnotationEnd = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentPath.length > 0) {
      const newAnnotation = {
        id: Date.now(),
        tool: annotationTool,
        color: annotationColor,
        points: currentPath,
        timestamp: new Date()
      };

      setAnnotations(prev => [...prev, newAnnotation]);
      setCurrentPath([]);
    }
  };

  const handleClearAnnotations = () => {
    setAnnotations([]);
    setCurrentPath([]);
  };

  const renderAnnotation = (annotation) => {
    if (annotation.points.length < 2) return null;

    let pathData = `M ${annotation.points[0].x} ${annotation.points[0].y}`;
    for (let i = 1; i < annotation.points.length; i++) {
      pathData += ` L ${annotation.points[i].x} ${annotation.points[i].y}`;
    }

    return (
      <path
        key={annotation.id}
        d={pathData}
        stroke={annotation.color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  const renderCurrentPath = () => {
    if (currentPath.length < 2) return null;

    let pathData = `M ${currentPath[0].x} ${currentPath[0].y}`;
    for (let i = 1; i < currentPath.length; i++) {
      pathData += ` L ${currentPath[i].x} ${currentPath[i].y}`;
    }

    return (
      <path
        d={pathData}
        stroke={annotationColor}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    );
  };

  return (
    <div className="h-full flex flex-col rounded-squircle bg-background">
      {/* Screen Share Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="Share" size={20} className="text-primary" />
          <h3 className="font-heading font-heading-semibold text-foreground">
            Screen Share
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {isSharing && (
            <div className="flex items-center space-x-2 bg-success/10 text-success px-3 py-1 rounded-squircle">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs font-body font-body-medium">
                Sharing
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAnnotating(!isAnnotating)}
            iconName="Edit"
            iconSize={16}
            className={isAnnotating ? 'text-primary' : 'text-muted-foreground'}
          />
        </div>
      </div>

      {!isSharing ? (
        /* Share Options */
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-squircle flex items-center justify-center mx-auto">
              <Icon name="Share" size={32} color="white" />
            </div>
            <h4 className="text-lg font-heading font-heading-semibold text-foreground">
              Share Your Screen
            </h4>
            <p className="text-sm text-muted-foreground max-w-md">
              Choose what you'd like to share with the interviewer. You can share your entire screen, a specific application, or a browser tab.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full max-w-md">
            {shareTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setShareType(type.id)}
                className={`flex items-center space-x-4 p-4 rounded-squircle border-2 spring-transition ${shareType === type.id
                  ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
              >
                <div className={`w-10 h-10 rounded-squircle flex items-center justify-center ${shareType === type.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                  <Icon name={type.icon} size={20} />
                </div>
                <div className="text-left">
                  <h5 className="font-body font-body-medium text-foreground">
                    {type.name}
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Share {type.name.toLowerCase()}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <Button
            variant="default"
            onClick={handleStartSharing}
            iconName="Play"
            iconPosition="left"
            iconSize={16}
            className="glow-primary"
          >
            Start Sharing
          </Button>
        </div>
      ) : (
        /* Screen Share View */
        <div className="flex-1 flex flex-col">
          {/* Annotation Controls */}
          {isAnnotating && (
            <div className="p-4 border-b border-border space-y-4">
              {/* Annotation Tools */}
              <div className="flex flex-wrap gap-2">
                {annotationTools.map((tool) => (
                  <Button
                    key={tool.id}
                    variant={annotationTool === tool.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAnnotationTool(tool.id)}
                    iconName={tool.icon}
                    iconPosition="left"
                    iconSize={14}
                  >
                    {tool.name}
                  </Button>
                ))}
              </div>

              {/* Annotation Colors */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-body font-body-medium text-foreground">
                  Color:
                </span>
                <div className="flex space-x-2">
                  {annotationColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAnnotationColor(color)}
                      className={`w-6 h-6 rounded-full border-2 spring-transition ${annotationColor === color ? 'border-foreground scale-110' : 'border-border'
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAnnotations}
                  iconName="Trash2"
                  iconPosition="left"
                  iconSize={14}
                  className="ml-auto text-error hover:text-error"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Screen Content */}
          <div className="flex-1 relative bg-gradient-to-br from-muted to-card">
            {/* Mock Screen Content */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-squircle flex items-center justify-center mx-auto">
                  <Icon name="Monitor" size={48} color="white" />
                </div>
                <h4 className="text-xl font-heading font-heading-semibold text-foreground">
                  Screen Sharing Active
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your {shareType} is being shared with the interviewer
                </p>
              </div>
            </div>

            {/* Annotation Canvas */}
            {isAnnotating && (
              <svg
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair"
                onMouseDown={handleAnnotationStart}
                onMouseMove={handleAnnotationMove}
                onMouseUp={handleAnnotationEnd}
                onMouseLeave={handleAnnotationEnd}
              >
                {annotations.map(renderAnnotation)}
                {renderCurrentPath()}
              </svg>
            )}
          </div>

          {/* Screen Share Controls */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-body font-body-medium text-foreground">
                    Sharing {shareType}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {annotations.length} annotations
                </span>
              </div>
              <Button
                variant="destructive"
                onClick={handleStopSharing}
                iconName="Square"
                iconPosition="left"
                iconSize={16}
              >
                Stop Sharing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
        <div className="absolute top-16 left-6 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute bottom-28 right-10 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '4s' }}></div>
      </div>
    </div>
  );
};

export default ScreenSharePanel;
