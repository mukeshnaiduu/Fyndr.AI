import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const AITranscriptPanel = ({ isOpen, onClose, transcript, onSeekTo, currentTime }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSummary, setShowSummary] = useState(false);
  const transcriptRef = useRef(null);

  const summary = `This lesson covers advanced React patterns including render props, higher-order components, and compound components. Key topics include component composition, state management patterns, and performance optimization techniques. The instructor demonstrates practical examples of each pattern and explains when to use them in real-world applications.`;

  const filteredTranscript = transcript.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSeek = (timestamp) => {
    onSeekTo(timestamp);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSegment = () => {
    return transcript.findIndex(item => 
      currentTime >= item.timestamp && 
      currentTime < (transcript[transcript.indexOf(item) + 1]?.timestamp || Infinity)
    );
  };

  useEffect(() => {
    const currentSegmentIndex = getCurrentSegment();
    if (currentSegmentIndex !== -1 && transcriptRef.current) {
      const currentElement = transcriptRef.current.children[currentSegmentIndex];
      if (currentElement) {
        currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Mobile Overlay */}
      <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto h-2/3 lg:h-auto glassmorphic border-t lg:border border-white/20 lg:rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Icon name="FileText" size={20} className="text-primary" />
            <h3 className="font-semibold text-foreground">AI Transcript</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={showSummary ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowSummary(!showSummary)}
              iconName="Sparkles"
              iconPosition="left"
            >
              Summary
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <Icon name="X" size={18} />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <Input
            type="search"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          {searchQuery && (
            <div className="mt-2 text-sm text-muted-foreground">
              {filteredTranscript.length} results found
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showSummary ? (
            /* AI Summary */
            <div className="p-4">
              <div className="glassmorphic-surface p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Icon name="Sparkles" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-primary">AI Generated Summary</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{summary}</p>
              </div>
              
              {/* Key Points */}
              <div className="mt-6">
                <h4 className="font-medium text-foreground mb-3">Key Points</h4>
                <div className="space-y-2">
                  {[
                    "Render props pattern for component composition",
                    "Higher-order components for cross-cutting concerns",
                    "Compound components for flexible APIs",
                    "Performance optimization with React.memo",
                    "State management best practices"
                  ].map((point, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Icon name="ChevronRight" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Transcript */
            <div ref={transcriptRef} className="p-4 space-y-2">
              {(searchQuery ? filteredTranscript : transcript).map((item, index) => {
                const isCurrentSegment = getCurrentSegment() === transcript.indexOf(item);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleSeek(item.timestamp)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-white/10 ${
                      isCurrentSegment ? 'bg-primary/20 border border-primary/30' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`text-xs font-mono px-2 py-1 rounded ${
                        isCurrentSegment ? 'bg-primary text-white' : 'bg-white/20 text-muted-foreground'
                      }`}>
                        {formatTime(item.timestamp)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${
                          isCurrentSegment ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}>
                          {searchQuery ? (
                            item.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) =>
                              part.toLowerCase() === searchQuery.toLowerCase() ? (
                                <mark key={i} className="bg-warning/30 text-foreground">{part}</mark>
                              ) : (
                                part
                              )
                            )
                          ) : (
                            item.text
                          )}
                        </p>
                        
                        {item.speaker && (
                          <div className="text-xs text-primary mt-1">
                            {item.speaker}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              
              {searchQuery && filteredTranscript.length === 0 && (
                <div className="text-center py-8">
                  <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Download" size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Download transcript</span>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                Export
              </Button>
              <Button variant="outline" size="sm">
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITranscriptPanel;
