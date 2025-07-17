import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

const CreatePostModal = ({ isOpen, onClose, onCreatePost }) => {
  const [postType, setPostType] = useState('general');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [jobDetails, setJobDetails] = useState({
    title: '',
    company: '',
    location: '',
    skills: []
  });
  const [eventDetails, setEventDetails] = useState({
    title: '',
    date: '',
    location: '',
    description: ''
  });
  const [privacy, setPrivacy] = useState('public');

  const postTypeOptions = [
    { value: 'general', label: 'General Post' },
    { value: 'job', label: 'Job Opportunity' },
    { value: 'event', label: 'Event Announcement' },
    { value: 'achievement', label: 'Achievement' }
  ];

  const privacyOptions = [
    { value: 'public', label: 'Public' },
    { value: 'alumni', label: 'Alumni Only' },
    { value: 'connections', label: 'Connections Only' }
  ];

  const skillOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'react', label: 'React' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'aws', label: 'AWS' },
    { value: 'docker', label: 'Docker' },
    { value: 'kubernetes', label: 'Kubernetes' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newPost = {
      id: Date.now(),
      type: postType,
      content,
      image: selectedImage,
      privacy,
      timestamp: new Date(),
      author: {
        name: 'John Doe',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        isVerified: true,
        isOnline: true
      },
      likes: 0,
      comments: [],
      isLiked: false
    };

    if (postType === 'job') {
      newPost.jobDetails = jobDetails;
    } else if (postType === 'event') {
      newPost.eventDetails = eventDetails;
    }

    onCreatePost(newPost);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setPostType('general');
    setContent('');
    setSelectedImage(null);
    setJobDetails({ title: '', company: '', location: '', skills: [] });
    setEventDetails({ title: '', date: '', location: '', description: '' });
    setPrivacy('public');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glassmorphic rounded-xl shadow-elevation-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-foreground">Create Post</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Post Type & Privacy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Post Type"
              options={postTypeOptions}
              value={postType}
              onChange={setPostType}
            />
            <Select
              label="Privacy"
              options={privacyOptions}
              value={privacy}
              onChange={setPrivacy}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, achievements, or opportunities..."
              rows={4}
              className="w-full bg-muted rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              required
            />
          </div>

          {/* Job Details */}
          {postType === 'job' && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-foreground flex items-center space-x-2">
                <Icon name="Briefcase" size={16} className="text-blue-500" />
                <span>Job Details</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Job Title"
                  value={jobDetails.title}
                  onChange={(e) => setJobDetails(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Senior React Developer"
                  required
                />
                <Input
                  label="Company"
                  value={jobDetails.company}
                  onChange={(e) => setJobDetails(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="e.g., Tech Corp"
                  required
                />
              </div>
              
              <Input
                label="Location"
                value={jobDetails.location}
                onChange={(e) => setJobDetails(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., San Francisco, CA (Remote)"
              />
              
              <Select
                label="Required Skills"
                options={skillOptions}
                value={jobDetails.skills}
                onChange={(skills) => setJobDetails(prev => ({ ...prev, skills }))}
                multiple
                searchable
                placeholder="Select required skills"
              />
            </div>
          )}

          {/* Event Details */}
          {postType === 'event' && (
            <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-foreground flex items-center space-x-2">
                <Icon name="Calendar" size={16} className="text-green-500" />
                <span>Event Details</span>
              </h3>
              
              <Input
                label="Event Title"
                value={eventDetails.title}
                onChange={(e) => setEventDetails(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Alumni Networking Meetup"
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date & Time"
                  type="datetime-local"
                  value={eventDetails.date}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
                <Input
                  label="Location"
                  value={eventDetails.location}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Virtual / San Francisco"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Event Description
                </label>
                <textarea
                  value={eventDetails.description}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your event..."
                  rows={3}
                  className="w-full bg-muted rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Add Image (Optional)
            </label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-primary/50 transition-spring">
              {selectedImage ? (
                <div className="relative">
                  <Image
                    src={selectedImage}
                    alt="Selected image"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ) : (
                <div>
                  <Icon name="ImagePlus" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Click to upload an image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-spring"
                  >
                    <Icon name="Upload" size={16} className="mr-2" />
                    Choose Image
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!content.trim()}
              className="min-w-[100px]"
            >
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
