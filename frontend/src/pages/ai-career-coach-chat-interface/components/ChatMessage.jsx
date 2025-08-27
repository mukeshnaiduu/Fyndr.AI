import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Icon from 'components/AppIcon';


const ChatMessage = ({ message, isUser, timestamp, isTyping = false }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isTyping) {
    return (
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
          <Icon name="Bot" size={16} color="white" />
        </div>
        <div className="glassmorphic-card p-4 rounded-2xl rounded-tl-md max-w-xs">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start space-x-3 mb-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser
        ? 'bg-gradient-to-br from-accent to-primary' : 'bg-gradient-to-br from-primary to-accent'
        }`}>
        {isUser ? (
          <Icon name="User" size={16} color="white" />
        ) : (
          <Icon name="Bot" size={16} color="white" />
        )}
      </div>

      <div className={`max-w-xs lg:max-w-md ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`glassmorphic-card p-4 rounded-2xl ${isUser
          ? 'bg-primary/20 border-primary/30 rounded-tr-md' : 'bg-white/20 border-white/20 rounded-tl-md'
          }`}>
          {message.type === 'text' && (
            <div className="prose prose-invert max-w-none text-foreground text-sm leading-relaxed">
              <style>{`
                .prose table {
                  width: 100%;
                  border-collapse: collapse;
                  border: 1px solid rgba(255,255,255,0.2);
                }
                .prose thead tr {
                  background: rgba(255,255,255,0.06);
                }
                .prose th, .prose td {
                  border: 1px solid rgba(255,255,255,0.2);
                  padding: 0.5rem 0.75rem;
                }
              `}</style>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}

          {message.type === 'job_recommendation' && (
            <div className="space-y-3">
              <p className="text-foreground text-sm">{message.content}</p>
              <div className="glassmorphic-surface p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Briefcase" size={16} className="text-primary" />
                  <span className="font-medium text-foreground text-sm">{message.jobTitle}</span>
                </div>
                <p className="text-muted-foreground text-xs mb-2">{message.company}</p>
                <div className="flex items-center justify-between">
                  <span className="text-accent text-xs font-medium">{message.salary}</span>
                  <button className="text-primary text-xs hover:underline">View Details</button>
                </div>
              </div>
            </div>
          )}

          {message.type === 'skill_assessment' && (
            <div className="space-y-3">
              <p className="text-foreground text-sm">{message.content}</p>
              <div className="glassmorphic-surface p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Award" size={16} className="text-accent" />
                  <span className="font-medium text-foreground text-sm">Skill Assessment</span>
                </div>
                <div className="space-y-2">
                  {message.skills?.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-foreground text-xs">{skill.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                        <span className="text-accent text-xs font-medium">{skill.level}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {message.type === 'course_suggestion' && (
            <div className="space-y-3">
              <p className="text-foreground text-sm">{message.content}</p>
              <div className="glassmorphic-surface p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="BookOpen" size={16} className="text-primary" />
                  <span className="font-medium text-foreground text-sm">{message.courseTitle}</span>
                </div>
                <p className="text-muted-foreground text-xs mb-2">{message.courseDescription}</p>
                <div className="flex items-center justify-between">
                  <span className="text-accent text-xs font-medium">{message.duration}</span>
                  <button className="text-primary text-xs hover:underline">Start Learning</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
