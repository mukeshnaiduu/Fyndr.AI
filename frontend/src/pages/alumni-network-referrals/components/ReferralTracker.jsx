import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const ReferralTracker = ({ onRequestReferral }) => {
  const [activeTab, setActiveTab] = useState('requests');

  const referralRequests = [
    {
      id: 1,
      position: 'Senior Frontend Developer',
      company: 'Google',
      requester: {
        name: 'Alex Johnson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        title: 'Software Engineer'
      },
      status: 'pending',
      requestDate: '2025-01-05',
      deadline: '2025-01-15',
      points: 50,
      description: 'Looking for a referral for a senior frontend position at Google. I have 5+ years of React experience and have worked on large-scale applications.',
      skills: ['React', 'TypeScript', 'Node.js']
    },
    {
      id: 2,
      position: 'Product Manager',
      company: 'Microsoft',
      requester: {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        title: 'Associate Product Manager'
      },
      status: 'in_progress',
      requestDate: '2025-01-03',
      deadline: '2025-01-12',
      points: 75,
      description: 'Seeking referral for PM role at Microsoft. I have experience in product strategy and user research.',
      skills: ['Product Strategy', 'Analytics', 'User Research']
    },
    {
      id: 3,
      position: 'Data Scientist',
      company: 'Netflix',
      requester: {
        name: 'Michael Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        title: 'Junior Data Analyst'
      },
      status: 'completed',
      requestDate: '2024-12-20',
      deadline: '2024-12-30',
      points: 100,
      description: 'Successfully referred for data scientist position. Thank you for the help!',
      skills: ['Python', 'Machine Learning', 'SQL']
    }
  ];

  const myReferrals = [
    {
      id: 1,
      position: 'UX Designer',
      company: 'Airbnb',
      referee: {
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        title: 'Senior UX Designer'
      },
      status: 'interview_scheduled',
      submittedDate: '2025-01-01',
      points: 80,
      progress: [
        { step: 'Application Submitted', completed: true, date: '2025-01-01' },
        { step: 'Resume Reviewed', completed: true, date: '2025-01-03' },
        { step: 'Phone Screen', completed: true, date: '2025-01-05' },
        { step: 'Technical Interview', completed: false, date: '2025-01-10' },
        { step: 'Final Interview', completed: false, date: null }
      ]
    },
    {
      id: 2,
      position: 'Backend Engineer',
      company: 'Stripe',
      referee: {
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
        title: 'Software Engineer'
      },
      status: 'hired',
      submittedDate: '2024-12-15',
      points: 150,
      progress: [
        { step: 'Application Submitted', completed: true, date: '2024-12-15' },
        { step: 'Resume Reviewed', completed: true, date: '2024-12-17' },
        { step: 'Phone Screen', completed: true, date: '2024-12-20' },
        { step: 'Technical Interview', completed: true, date: '2024-12-22' },
        { step: 'Final Interview', completed: true, date: '2024-12-28' },
        { step: 'Offer Extended', completed: true, date: '2025-01-02' }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'in_progress': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      case 'completed': return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'interview_scheduled': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20';
      case 'hired': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'hired': return 'Hired';
      default: return 'Unknown';
    }
  };

  const ReferralRequestCard = ({ request }) => (
    <div className="glassmorphic rounded-xl p-6 hover:shadow-elevation-3 transition-spring">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <Image
            src={request.requester.avatar}
            alt={request.requester.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-foreground">{request.position}</h3>
            <p className="text-sm text-muted-foreground">{request.company}</p>
            <p className="text-sm text-muted-foreground">by {request.requester.name}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
            {getStatusText(request.status)}
          </span>
          <p className="text-sm text-muted-foreground mt-1">{request.points} points</p>
        </div>
      </div>

      <p className="text-sm text-foreground mb-4">{request.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {request.skills.map((skill, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>Requested: {new Date(request.requestDate).toLocaleDateString()}</span>
        <span>Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
      </div>

      <div className="flex items-center space-x-3">
        {request.status === 'pending' && (
          <>
            <Button variant="default" size="sm">
              Accept Request
            </Button>
            <Button variant="outline" size="sm">
              Decline
            </Button>
          </>
        )}
        {request.status === 'in_progress' && (
          <Button variant="outline" size="sm">
            Update Status
          </Button>
        )}
        <Button variant="ghost" size="sm">
          <Icon name="MessageCircle" size={16} className="mr-2" />
          Message
        </Button>
      </div>
    </div>
  );

  const MyReferralCard = ({ referral }) => (
    <div className="glassmorphic rounded-xl p-6 hover:shadow-elevation-3 transition-spring">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <Image
            src={referral.referee.avatar}
            alt={referral.referee.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-foreground">{referral.position}</h3>
            <p className="text-sm text-muted-foreground">{referral.company}</p>
            <p className="text-sm text-muted-foreground">Referred: {referral.referee.name}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
            {getStatusText(referral.status)}
          </span>
          <p className="text-sm text-muted-foreground mt-1">{referral.points} points</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {referral.progress.map((step, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              step.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              {step.completed && <Icon name="Check" size={10} className="text-white" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.step}
              </p>
              {step.date && (
                <p className="text-xs text-muted-foreground">
                  {new Date(step.date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Submitted: {new Date(referral.submittedDate).toLocaleDateString()}</span>
        <Button variant="ghost" size="sm">
          <Icon name="ExternalLink" size={16} className="mr-2" />
          View Details
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glassmorphic rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Referral Tracker</h2>
          <Button onClick={onRequestReferral}>
            <Icon name="Plus" size={16} className="mr-2" />
            Request Referral
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={20} className="text-blue-500" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={20} className="text-purple-500" />
              <span className="text-sm text-muted-foreground">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={20} className="text-green-500" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">8</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Star" size={20} className="text-yellow-500" />
              <span className="text-sm text-muted-foreground">Total Points</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">1,250</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-spring ${
              activeTab === 'requests' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Referral Requests ({referralRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('my-referrals')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-spring ${
              activeTab === 'my-referrals' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Referrals ({myReferrals.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'requests' && (
          <>
            {referralRequests.map(request => (
              <ReferralRequestCard key={request.id} request={request} />
            ))}
            {referralRequests.length === 0 && (
              <div className="glassmorphic rounded-xl p-12 text-center">
                <Icon name="Inbox" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No referral requests</h3>
                <p className="text-muted-foreground">You'll see referral requests from other alumni here</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'my-referrals' && (
          <>
            {myReferrals.map(referral => (
              <MyReferralCard key={referral.id} referral={referral} />
            ))}
            {myReferrals.length === 0 && (
              <div className="glassmorphic rounded-xl p-12 text-center">
                <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No referrals yet</h3>
                <p className="text-muted-foreground">Start by requesting a referral from your network</p>
                <Button className="mt-4" onClick={onRequestReferral}>
                  Request Referral
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReferralTracker;
