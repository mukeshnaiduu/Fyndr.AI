import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ActivityFeed = ({ activities = [] }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'user_added': return 'UserPlus';
            case 'role_changed': return 'UserCog';
            case 'permission_updated': return 'Shield';
            case 'login': return 'LogIn';
            case 'logout': return 'LogOut';
            case 'message_sent': return 'MessageCircle';
            case 'project_assigned': return 'Briefcase';
            // New types for team requests/invitations
            case 'join_request': return 'Inbox';
            case 'invitation_sent': return 'Send';
            case 'invitation_received': return 'Bell';
            default: return 'Activity';
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'user_added': return 'text-success';
            case 'role_changed': return 'text-primary';
            case 'permission_updated': return 'text-warning';
            case 'login': return 'text-accent';
            case 'logout': return 'text-muted-foreground';
            case 'message_sent': return 'text-secondary';
            case 'project_assigned': return 'text-primary';
            case 'join_request': return 'text-warning';
            case 'invitation_sent': return 'text-primary';
            case 'invitation_received': return 'text-accent';
            default: return 'text-muted-foreground';
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
        <div className="glass-card h-full">
            <div className="flex items-center justify-between p-4 border-b border-glass-border">
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
                <Icon name="Activity" size={20} className="text-muted-foreground" />
            </div>

            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {activities.length === 0 ? (
                    <div className="text-center py-8">
                        <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No recent activity</p>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.type)}`}>
                                <Icon name={getActivityIcon(activity.type)} size={14} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                    {activity.user?.avatar && (
                                        <Image
                                            src={activity.user.avatar}
                                            alt={activity.user.name}
                                            className="w-6 h-6 rounded-full object-cover"
                                        />
                                    )}
                                    <p className="text-sm text-foreground">
                                        <span className="font-medium">{activity.user?.name}</span>
                                        {' '}
                                        <span className="text-muted-foreground">{activity.description}</span>
                                    </p>
                                </div>

                                {activity.details && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {activity.details}
                                    </p>
                                )}

                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatTimeAgo(activity.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {activities.length > 0 && (
                <div className="p-4 border-t border-glass-border">
                    <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors">
                        View All Activity
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
