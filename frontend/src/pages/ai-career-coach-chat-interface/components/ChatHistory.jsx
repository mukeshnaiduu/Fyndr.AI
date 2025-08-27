import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const ChatHistory = ({ conversations, onSelectConversation, currentConversationId, onNewChat, onDeleteConversation, className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: 'MessageCircle' },
    { id: 'resume', label: 'Resume', icon: 'FileText' },
    { id: 'jobs', label: 'Jobs', icon: 'Briefcase' },
    { id: 'skills', label: 'Skills', icon: 'Award' },
    { id: 'interview', label: 'Interview', icon: 'MessageSquare' },
    { id: 'career', label: 'Career', icon: 'TrendingUp' }
  ];

  const filteredConversations = conversations.filter(conv => {
    const title = (conv.title || 'Conversation');
    const last = (conv.lastMessage || '');
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      last.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || conv.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return messageDate.toLocaleDateString();
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Chat History</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNewChat && onNewChat()}
            className="hover:bg-white/10"
          >
            <Icon name="Plus" size={18} />
          </Button>
        </div>

        {/* Search */}
        <Input
          type="search"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs"
            >
              <Icon name={category.icon} size={12} className="mr-1" />
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-slim">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="MessageCircle" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">No conversations found</p>
            <p className="text-sm text-muted-foreground">Start a new conversation to begin</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group w-full p-3 rounded-lg mb-2 text-left transition-all duration-200 hover:bg-white/10 cursor-pointer ${currentConversationId === conversation.id
                  ? 'bg-primary/20 border border-primary/30' : 'hover:scale-[1.02]'
                  }`}
                role="button"
                tabIndex={0}
                onClick={() => onSelectConversation(conversation.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectConversation(conversation.id);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${conversation.category === 'resume' ? 'bg-primary/20' :
                    conversation.category === 'jobs' ? 'bg-accent/20' :
                      conversation.category === 'skills' ? 'bg-warning/20' :
                        conversation.category === 'interview' ? 'bg-success/20' : 'bg-secondary/20'
                    }`}>
                    <Icon
                      name={categories.find(c => c.id === conversation.category)?.icon || 'MessageCircle'}
                      size={16}
                      className={
                        conversation.category === 'resume' ? 'text-primary' :
                          conversation.category === 'jobs' ? 'text-accent' :
                            conversation.category === 'skills' ? 'text-warning' :
                              conversation.category === 'interview' ? 'text-success' : 'text-secondary'
                      }
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground text-sm truncate" title={conversation.title}>
                        {conversation.title}
                      </h4>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(conversation.lastActivity)}
                        </span>
                        {onDeleteConversation && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete conversation"
                            className="opacity-0 group-hover:opacity-100 hover:bg-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this conversation? This cannot be undone.')) {
                                onDeleteConversation(conversation.id);
                              }
                            }}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {conversation.messageCount} messages
                      </span>
                      {conversation.hasUnread && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
