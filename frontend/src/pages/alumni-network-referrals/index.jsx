import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import PostCard from './components/PostCard';
import CreatePostModal from './components/CreatePostModal';
import AlumniDirectory from './components/AlumniDirectory';
import ReferralTracker from './components/ReferralTracker';
import ProfileModal from './components/ProfileModal';
import RequestReferralModal from './components/RequestReferralModal';

const AlumniNetworkReferrals = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRequestReferralOpen, setIsRequestReferralOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);

    // Initialize with mock posts
    const mockPosts = [
      {
        id: 1,
        type: 'job',
        content: `Exciting opportunity at Google! We're looking for a Senior Frontend Developer to join our Search team. This role involves building user-facing features that impact billions of users worldwide.\n\nKey requirements:\n• 5+ years of React/JavaScript experience\n• Strong understanding of web performance\n• Experience with large-scale applications\n\nGreat benefits, competitive salary, and amazing team culture. Happy to provide referrals for qualified candidates!`,
        author: {
          name: 'Sarah Johnson', title: 'Senior Product Manager', company: 'Google', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          isVerified: true,
          isOnline: true
        },
        jobDetails: {
          title: 'Senior Frontend Developer', company: 'Google', location: 'Bengaluru, Karnataka',
          skills: ['React', 'JavaScript', 'TypeScript', 'Node.js']
        },
        timestamp: new Date(Date.now() - 3600000),
        likes: 24,
        comments: [
          {
            author: {
              name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
            },
            content: 'This sounds like an amazing opportunity! I have a friend who might be perfect for this role.',
            timestamp: new Date(Date.now() - 1800000)
          }
        ],
        isLiked: false
      },
      {
        id: 2,
        type: 'achievement', content: `Thrilled to announce that I've been promoted to Engineering Manager at Microsoft! 🎉\n\nThis journey has been incredible, and I couldn't have done it without the support of my amazing team and mentors. Special thanks to everyone who believed in me.\n\nFor anyone looking to transition into management, I'm happy to share my experience and provide guidance. The key is to focus on people development and creating psychological safety for your team.`,
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
        author: {
          name: 'Michael Chen',
          title: 'Engineering Manager',
          company: 'Microsoft',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          isVerified: true,
          isOnline: false
        },
        timestamp: new Date(Date.now() - 7200000),
        likes: 156,
        comments: [
          {
            author: {
              name: 'Sarah Johnson',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
            },
            content: 'Congratulations Michael! Well deserved. Your leadership skills have always been impressive.',
            timestamp: new Date(Date.now() - 6000000)
          },
          {
            author: {
              name: 'Emily Rodriguez',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
            },
            content: 'Amazing news! Would love to hear more about your transition journey.',
            timestamp: new Date(Date.now() - 5400000)
          }
        ],
        isLiked: true
      },
      {
        id: 3,
        type: 'event',
        content: `Join us for the Bay Area Alumni Networking Meetup! 🌟\n\nWe're bringing together alumni from various companies for an evening of networking, knowledge sharing, and career discussions.\n\nWhat to expect:\n• Panel discussion on career growth\n• Networking sessions by industry\n• Startup pitch presentations\n• Food and drinks\n\nGreat opportunity to expand your network and learn from fellow alumni!`,
        author: {
          name: 'Emily Rodriguez', title: 'UX Design Lead', company: 'Airbnb', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          isVerified: false,
          isOnline: true
        },
        eventDetails: {
          title: 'Bengaluru Alumni Networking Meetup', date: '2025-01-15 18:00', location: 'Bengaluru, Karnataka'
        },
        timestamp: new Date(Date.now() - 10800000),
        likes: 89,
        comments: [
          {
            author: {
              name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
            },
            content: 'Count me in! This sounds like a fantastic networking opportunity.',
            timestamp: new Date(Date.now() - 9000000)
          }
        ],
        isLiked: false
      }
    ];

    setPosts(mockPosts);
  }, []);

  const tabs = [
    { id: 'feed', label: 'Feed', icon: 'Home', count: posts.length },
    { id: 'directory', label: 'Directory', icon: 'Users', count: 245 },
    { id: 'referrals', label: 'Referrals', icon: 'UserCheck', count: 12 }
  ];

  const handleCreatePost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = (postId, isLiked) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1 }
        : post
    ));
  };

  const handleComment = (postId, comment) => {
    const newComment = {
      author: {
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      },
      content: comment,
      timestamp: new Date()
    };

    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, comments: [...(post.comments || []), newComment] }
        : post
    ));
  };

  const handleShare = (postId) => {
    // Mock share functionality
    console.log('Sharing post:', postId);
  };

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
  };

  const handleRequestReferral = () => {
    setIsRequestReferralOpen(true);
  };

  const handleSubmitReferralRequest = (request) => {
    console.log('Referral request submitted:', request);
    // In a real app, this would be sent to the backend
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Alumni Network & Referrals
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with fellow alumni, share opportunities, and build your professional network
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="glassmorphic rounded-xl p-6 text-center">
            <Icon name="Users" size={32} className="mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">2,450</p>
            <p className="text-sm text-muted-foreground">Alumni Connected</p>
          </div>
          <div className="glassmorphic rounded-xl p-6 text-center">
            <Icon name="Briefcase" size={32} className="mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">1,234</p>
            <p className="text-sm text-muted-foreground">Job Referrals</p>
          </div>
          <div className="glassmorphic rounded-xl p-6 text-center">
            <Icon name="MessageCircle" size={32} className="mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">5,678</p>
            <p className="text-sm text-muted-foreground">Active Discussions</p>
          </div>
          <div className="glassmorphic rounded-xl p-6 text-center">
            <Icon name="TrendingUp" size={32} className="mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">89%</p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glassmorphic rounded-xl p-2 mb-8"
        >
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-spring ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-elevation-2'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
              >
                <Icon name={tab.icon} size={20} />
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.id
                    ? 'bg-white/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {activeTab === 'feed' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Create Post */}
                <div className="glassmorphic rounded-xl p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Icon name="User" size={24} className="text-white" />
                    </div>
                    <button
                      onClick={() => setIsCreatePostOpen(true)}
                      className="flex-1 text-left px-4 py-3 bg-muted rounded-full text-muted-foreground hover:bg-muted/80 transition-spring"
                    >
                      What's on your mind?
                    </button>
                    <Button onClick={() => setIsCreatePostOpen(true)}>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Post
                    </Button>
                  </div>
                </div>

                {/* Posts */}
                <div className="space-y-6">
                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="glassmorphic rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleRequestReferral}
                    >
                      <Icon name="UserPlus" size={16} className="mr-3" />
                      Request Referral
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Icon name="Search" size={16} className="mr-3" />
                      Find Alumni
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Icon name="Calendar" size={16} className="mr-3" />
                      Upcoming Events
                    </Button>
                  </div>
                </div>

                {/* Trending Topics */}
                <div className="glassmorphic rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Trending Topics</h3>
                  <div className="space-y-3">
                    {['#TechCareers', '#RemoteWork', '#StartupLife', '#ProductManagement', '#DataScience'].map((topic, index) => (
                      <button
                        key={index}
                        className="block w-full text-left px-3 py-2 rounded-lg text-primary hover:bg-primary/10 transition-spring"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Connections */}
                <div className="glassmorphic rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">Recent Connections</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Alex Thompson', title: 'Software Engineer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' },
                      { name: 'Lisa Wang', title: 'Product Designer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face' },
                      { name: 'James Wilson', title: 'Data Scientist', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' }
                    ].map((connection, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <img
                          src={connection.avatar}
                          alt={connection.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{connection.name}</p>
                          <p className="text-xs text-muted-foreground">{connection.title}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Icon name="MessageCircle" size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'directory' && (
            <AlumniDirectory onProfileClick={handleProfileClick} />
          )}

          {activeTab === 'referrals' && (
            <ReferralTracker onRequestReferral={handleRequestReferral} />
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onCreatePost={handleCreatePost}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={selectedProfile}
      />

      <RequestReferralModal
        isOpen={isRequestReferralOpen}
        onClose={() => setIsRequestReferralOpen(false)}
        onSubmitRequest={handleSubmitReferralRequest}
      />
    </div>
  );
};

export default AlumniNetworkReferrals;
