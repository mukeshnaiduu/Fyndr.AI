import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const DiscussionForum = ({ discussions, onAddDiscussion, onAddReply }) => {
  const [newDiscussion, setNewDiscussion] = useState('');
  const [expandedDiscussions, setExpandedDiscussions] = useState(new Set());
  const [replyText, setReplyText] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});

  const toggleDiscussion = (discussionId) => {
    const newExpanded = new Set(expandedDiscussions);
    if (newExpanded.has(discussionId)) {
      newExpanded.delete(discussionId);
    } else {
      newExpanded.add(discussionId);
    }
    setExpandedDiscussions(newExpanded);
  };

  const handleSubmitDiscussion = (e) => {
    e.preventDefault();
    if (newDiscussion.trim()) {
      onAddDiscussion(newDiscussion);
      setNewDiscussion('');
    }
  };

  const handleSubmitReply = (discussionId) => {
    const reply = replyText[discussionId];
    if (reply && reply.trim()) {
      onAddReply(discussionId, reply);
      setReplyText({ ...replyText, [discussionId]: '' });
      setShowReplyForm({ ...showReplyForm, [discussionId]: false });
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* New Discussion Form */}
      <div className="glassmorphic-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="MessageCircle" size={20} className="text-primary mr-2" />
          Start a Discussion
        </h3>
        <form onSubmit={handleSubmitDiscussion} className="space-y-4">
          <Input
            type="text"
            placeholder="What would you like to discuss?"
            value={newDiscussion}
            onChange={(e) => setNewDiscussion(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newDiscussion.trim()}
              iconName="Send"
              iconPosition="right"
            >
              Post Discussion
            </Button>
          </div>
        </form>
      </div>

      {/* Discussion List */}
      <div className="space-y-4">
        {discussions.map((discussion) => {
          const isExpanded = expandedDiscussions.has(discussion.id);
          const showReply = showReplyForm[discussion.id];

          return (
            <div key={discussion.id} className="glassmorphic-card overflow-hidden">
              {/* Discussion Header */}
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                      {discussion.author.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-foreground">{discussion.author.name}</h4>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {formatTimeAgo(discussion.timestamp)}
                      </span>
                      {discussion.author.isInstructor && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Instructor
                        </span>
                      )}
                    </div>
                    
                    <p className="text-foreground leading-relaxed">{discussion.content}</p>
                    
                    {/* Discussion Actions */}
                    <div className="flex items-center space-x-4 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDiscussion(discussion.id)}
                        iconName="MessageCircle"
                        iconPosition="left"
                      >
                        {discussion.replies.length} replies
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowReplyForm({
                          ...showReplyForm,
                          [discussion.id]: !showReply
                        })}
                        iconName="Reply"
                        iconPosition="left"
                      >
                        Reply
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Heart"
                        iconPosition="left"
                      >
                        {discussion.likes}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              {showReply && (
                <div className="px-6 pb-4 border-t border-white/10 pt-4">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-xs">You</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <Input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText[discussion.id] || ''}
                        onChange={(e) => setReplyText({
                          ...replyText,
                          [discussion.id]: e.target.value
                        })}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowReplyForm({
                            ...showReplyForm,
                            [discussion.id]: false
                          })}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(discussion.id)}
                          disabled={!replyText[discussion.id]?.trim()}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies */}
              {isExpanded && discussion.replies.length > 0 && (
                <div className="border-t border-white/10 bg-white/5">
                  <div className="p-6 space-y-4">
                    {discussion.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                          <span className="text-foreground font-medium text-xs">
                            {reply.author.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-foreground text-sm">
                              {reply.author.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(reply.timestamp)}
                            </span>
                            {reply.author.isInstructor && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                Instructor
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {reply.content}
                          </p>
                          
                          <div className="flex items-center space-x-3 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              iconName="Heart"
                              iconPosition="left"
                              className="text-xs"
                            >
                              {reply.likes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {discussions.length === 0 && (
        <div className="glassmorphic-card p-12 text-center">
          <Icon name="MessageCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No discussions yet</h3>
          <p className="text-muted-foreground">
            Be the first to start a discussion about this course!
          </p>
        </div>
      )}
    </div>
  );
};

export default DiscussionForum;
