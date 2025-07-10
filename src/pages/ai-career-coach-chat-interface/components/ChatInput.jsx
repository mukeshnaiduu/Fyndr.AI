import React, { useState, useRef, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const ChatInput = ({ onSendMessage, onVoiceRecord, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      // Stop recording logic would go here
      if (onVoiceRecord) {
        onVoiceRecord(false);
      }
    } else {
      setIsRecording(true);
      // Start recording logic would go here
      if (onVoiceRecord) {
        onVoiceRecord(true);
      }
    }
  };

  return (
    <div className="glassmorphic-card p-4 border-t border-white/20">
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "AI is thinking..." : "Ask me anything about your career..."}
            disabled={disabled}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 min-h-[48px] max-h-[120px]"
            rows={1}
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceToggle}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 ${
              isRecording ? 'text-error animate-pulse' : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Icon name={isRecording ? "MicOff" : "Mic"} size={16} />
          </Button>
        </div>
        
        <Button
          variant="default"
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="h-12 w-12 rounded-xl"
        >
          <Icon name="Send" size={18} />
        </Button>
      </div>
      
      {isRecording && (
        <div className="mt-3 flex items-center justify-center space-x-2 text-error">
          <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
          <span className="text-sm">Recording... Tap mic to stop</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
