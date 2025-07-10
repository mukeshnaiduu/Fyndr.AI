import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const PostCard = ({ post, onLike, onComment, onShare }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    onLike(post.id, newLikedState);
  };

  const handleComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'job': return 'Briefcase';
      case 'event': return 'Calendar';
      case 'achievement': return 'Trophy';
      default: return 'MessageCircle';
    }
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'job': return 'text-blue-500';
      case 'event': return 'text-green-500';
      case 'achievement': return 'text-yellow-500';
      default: return 'text-primary';
    }
  };

  return (
    <div className="glassmorphic rounded-xl p-6 shadow-elevation-2 hover:shadow-elevation-3 transition-spring">
      {/* Post Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {post.author.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-foreground">{post.author.name}</h3>
            {post.author.isVerified && (
              <Icon name="CheckCircle" size={16} className="text-blue-500" />
            )}
            <Icon 
              name={getPostTypeIcon(post.type)} 
              size={14} 
              className={getPostTypeColor(post.type)} 
            />
          </div>
          <p className="text-sm text-muted-foreground">{post.author.title}</p>
          <p className="text-sm text-muted-foreground">{post.author.company}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(post.timestamp)}</p>
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Icon name="MoreHorizontal" size={20} />
        </Button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-foreground leading-relaxed mb-3">{post.content}</p>
        
        {post.image && (
          <div className="rounded-lg overflow-hidden mb-3">
            <Image
              src={post.image}
              alt="Post image"
              className="w-full h-64 object-cover hover:scale-105 transition-spring"
            />
          </div>
        )}

        {post.type === 'job' && post.jobDetails && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Briefcase" size={16} className="text-blue-500" />
              <span className="font-medium text-blue-700 dark:text-blue-300">Job Opportunity</span>
            </div>
            <h4 className="font-semibold text-foreground mb-1">{post.jobDetails.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">{post.jobDetails.company}</p>
            <div className="flex flex-wrap gap-2">
              {post.jobDetails.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {post.type === 'event' && post.eventDetails && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Calendar" size={16} className="text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-300">Event</span>
            </div>
            <h4 className="font-semibold text-foreground mb-1">{post.eventDetails.title}</h4>
            <p className="text-sm text-muted-foreground mb-1">{post.eventDetails.date}</p>
            <p className="text-sm text-muted-foreground">{post.eventDetails.location}</p>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            <Icon name={isLiked ? "Heart" : "Heart"} size={18} fill={isLiked ? "currentColor" : "none"} />
            <span>{likeCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
          >
            <Icon name="MessageCircle" size={18} />
            <span>{post.comments?.length || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare(post.id)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
          >
            <Icon name="Share2" size={18} />
            <span>Share</span>
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          <Icon name="Bookmark" size={18} />
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/10">
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {post.comments.map((comment, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Image
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <p className="font-medium text-sm text-foreground">{comment.author.name}</p>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(comment.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="flex items-center space-x-3">
            <Image
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleComment}
                disabled={!newComment.trim()}
                className="text-primary hover:text-primary/80 disabled:text-muted-foreground"
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
