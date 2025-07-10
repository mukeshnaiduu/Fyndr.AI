import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const WhiteboardPanel = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#a78bfa');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [redoStack, setRedoStack] = useState([]);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const tools = [
    { id: 'pen', name: 'Pen', icon: 'Pen' },
    { id: 'eraser', name: 'Eraser', icon: 'Eraser' },
    { id: 'line', name: 'Line', icon: 'Minus' },
    { id: 'rectangle', name: 'Rectangle', icon: 'Square' },
    { id: 'circle', name: 'Circle', icon: 'Circle' },
    { id: 'text', name: 'Text', icon: 'Type' }
  ];

  const colors = [
    '#a78bfa', // primary
    '#fb923c', // accent
    '#4ade80', // success
    '#ef4444', // error
    '#fbbf24', // warning
    '#1e293b', // foreground
    '#64748b'  // muted-foreground
  ];

  const strokeWidths = [1, 3, 5, 8, 12];

  const handleMouseDown = (e) => {
    if (currentTool === 'text') return;
    
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath([{ x, y }]);
    setRedoStack([]);
    setCanRedo(false);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath(prev => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    if (currentPath.length > 0) {
      const newPath = {
        id: Date.now(),
        points: currentPath,
        tool: currentTool,
        color: currentColor,
        strokeWidth: strokeWidth
      };
      
      setPaths(prev => [...prev, newPath]);
      setCurrentPath([]);
      setCanUndo(true);
    }
  };

  const handleUndo = () => {
    if (paths.length > 0) {
      const lastPath = paths[paths.length - 1];
      setRedoStack(prev => [...prev, lastPath]);
      setPaths(prev => prev.slice(0, -1));
      setCanRedo(true);
      setCanUndo(paths.length > 1);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const pathToRedo = redoStack[redoStack.length - 1];
      setPaths(prev => [...prev, pathToRedo]);
      setRedoStack(prev => prev.slice(0, -1));
      setCanUndo(true);
      setCanRedo(redoStack.length > 1);
    }
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
    setRedoStack([]);
    setCanUndo(false);
    setCanRedo(false);
  };

  const renderPath = (path) => {
    if (path.points.length < 2) return null;
    
    let pathData = `M ${path.points[0].x} ${path.points[0].y}`;
    for (let i = 1; i < path.points.length; i++) {
      pathData += ` L ${path.points[i].x} ${path.points[i].y}`;
    }
    
    return (
      <path
        key={path.id}
        d={pathData}
        stroke={path.color}
        strokeWidth={path.strokeWidth}
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
        stroke={currentColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    );
  };

  return (
    <div className="h-full flex flex-col glassmorphic rounded-squircle">
      {/* Whiteboard Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="PenTool" size={20} className="text-primary" />
          <h3 className="font-heading font-heading-semibold text-foreground">
            Whiteboard
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={!canUndo}
            iconName="Undo"
            iconSize={16}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={!canRedo}
            iconName="Redo"
            iconSize={16}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            iconName="Trash2"
            iconSize={16}
            className="text-error hover:text-error"
          />
        </div>
      </div>

      {/* Tools Panel */}
      <div className="p-4 border-b border-border space-y-4">
        {/* Drawing Tools */}
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={currentTool === tool.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTool(tool.id)}
              iconName={tool.icon}
              iconPosition="left"
              iconSize={16}
              className="flex-shrink-0"
            >
              {tool.name}
            </Button>
          ))}
        </div>

        {/* Color Palette */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-body font-body-medium text-foreground">
            Color:
          </span>
          <div className="flex space-x-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-6 h-6 rounded-full border-2 spring-transition ${
                  currentColor === color ? 'border-foreground scale-110' : 'border-border'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Stroke Width */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-body font-body-medium text-foreground">
            Size:
          </span>
          <div className="flex space-x-2">
            {strokeWidths.map((width) => (
              <button
                key={width}
                onClick={() => setStrokeWidth(width)}
                className={`w-8 h-8 rounded-squircle border-2 flex items-center justify-center spring-transition ${
                  strokeWidth === width ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                <div
                  className="rounded-full bg-foreground"
                  style={{ 
                    width: `${Math.min(width, 6)}px`, 
                    height: `${Math.min(width, 6)}px` 
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={canvasRef}
          className="w-full h-full cursor-crosshair bg-white/50 rounded-b-squircle"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Pattern */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Rendered Paths */}
          {paths.map(renderPath)}
          
          {/* Current Path */}
          {renderCurrentPath()}
        </svg>

        {/* Collaborative Cursors */}
        <div className="absolute top-4 left-4 glassmorphic px-3 py-1.5 rounded-squircle">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs text-foreground font-body font-body-medium">
              2 users active
            </span>
          </div>
        </div>
      </div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
        <div className="absolute top-20 left-8 w-1 h-1 bg-primary/20 rounded-full particle-float"></div>
        <div className="absolute bottom-24 right-12 w-1.5 h-1.5 bg-accent/30 rounded-full particle-float" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
};

export default WhiteboardPanel;
