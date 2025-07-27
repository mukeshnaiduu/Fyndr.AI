import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import Button from 'components/ui/Button';
import { Checkbox } from 'components/ui/Checkbox';

const TeamSetupStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [formData, setFormData] = useState({
    teamMembers: data.teamMembers || [],
    inviteEmails: data.inviteEmails || [''],
    defaultRole: data.defaultRole || 'company',
    ...data
  });

  const [errors, setErrors] = useState({});
  const [showPermissions, setShowPermissions] = useState(false);

  const roleOptions = [
    { value: 'admin', label: 'Admin', description: 'Full access to all features' },
    { value: 'company', label: 'Company', description: 'Can manage jobs and candidates' },
    { value: 'hiring-manager', label: 'Hiring Manager', description: 'Can review candidates and make decisions' },
    { value: 'interviewer', label: 'Interviewer', description: 'Can conduct interviews and provide feedback' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access to reports and analytics' }
  ];

  const permissions = {
    admin: ['manage_users', 'manage_jobs', 'manage_candidates', 'view_analytics', 'manage_billing', 'manage_integrations'],
    company: ['manage_jobs', 'manage_candidates', 'view_analytics'],
    'hiring-manager': ['view_jobs', 'manage_candidates', 'view_analytics'],
    interviewer: ['view_jobs', 'view_candidates', 'conduct_interviews'],
    viewer: ['view_jobs', 'view_candidates', 'view_analytics']
  };

  const permissionLabels = {
    manage_users: 'Manage team members',
    manage_jobs: 'Create and edit job postings',
    manage_candidates: 'Review and manage candidates',
    view_analytics: 'View reports and analytics',
    manage_billing: 'Manage billing and subscriptions',
    manage_integrations: 'Configure integrations',
    view_jobs: 'View job postings',
    view_candidates: 'View candidate profiles',
    conduct_interviews: 'Schedule and conduct interviews'
  };

  const mockTeamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a1e3c0?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'company',
      status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const handleAddEmail = () => {
    setFormData(prev => ({
      ...prev,
      inviteEmails: [...prev.inviteEmails, '']
    }));
  };

  const handleRemoveEmail = (index) => {
    setFormData(prev => ({
      ...prev,
      inviteEmails: prev.inviteEmails.filter((_, i) => i !== index)
    }));
  };

  const handleEmailChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      inviteEmails: prev.inviteEmails.map((email, i) => i === index ? value : email)
    }));
  };

  const handleRoleChange = (memberId, newRole) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const validEmails = formData.inviteEmails.filter(email => email.trim());
    const invalidEmails = validEmails.filter(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    if (invalidEmails.length > 0) {
      newErrors.inviteEmails = 'Please enter valid email addresses';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate(formData);
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Team Setup</h2>
        <p className="text-muted-foreground">
          Invite team members and configure their roles and permissions
        </p>
      </div>

      {/* Current Team Members */}
      <div className="p-6 rounded-card bg-white dark:bg-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-foreground mb-4">Current Team Members</h3>

        <div className="space-y-4">
          {mockTeamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-muted rounded-card">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-primary">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/no_image.png';
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${member.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                  {member.status}
                </span>

                <Select
                  options={roleOptions}
                  value={member.role}
                  onChange={(value) => handleRoleChange(member.id, value)}
                  className="w-40"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite New Members */}
      <div className="p-6 rounded-card bg-white dark:bg-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Invite Team Members</h3>
          <Button variant="outline" size="sm" onClick={handleAddEmail} iconName="Plus" iconPosition="left">
            Add Email
          </Button>
        </div>

        <div className="space-y-4">
          {formData.inviteEmails.map((email, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                />
              </div>

              <Select
                options={roleOptions}
                value={formData.defaultRole}
                onChange={(value) => setFormData(prev => ({ ...prev, defaultRole: value }))}
                className="w-48"
              />

              {formData.inviteEmails.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveEmail(index)}
                  iconName="Trash2"
                />
              )}
            </div>
          ))}
        </div>

        {errors.inviteEmails && (
          <p className="text-sm text-error mt-2">{errors.inviteEmails}</p>
        )}
      </div>

      {/* Role Permissions */}
      <div className="p-6 rounded-card bg-white dark:bg-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Role Permissions</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPermissions(!showPermissions)}
            iconName={showPermissions ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            {showPermissions ? 'Hide' : 'Show'} Details
          </Button>
        </div>

        {showPermissions && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Permission</th>
                  {roleOptions.map(role => (
                    <th key={role.value} className="text-center py-3 px-4 font-medium text-foreground capitalize">
                      {role.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissionLabels).map(([permission, label]) => (
                  <tr key={permission} className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm text-foreground">{label}</td>
                    {roleOptions.map(role => (
                      <td key={role.value} className="text-center py-3 px-4">
                        {permissions[role.value]?.includes(permission) ? (
                          <Icon name="Check" size={16} className="text-success mx-auto" />
                        ) : (
                          <Icon name="X" size={16} className="text-muted-foreground mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team Settings */}
      <div className="p-6 rounded-card bg-white dark:bg-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-foreground mb-4">Team Settings</h3>

        <div className="space-y-4">
          <Checkbox
            label="Allow team members to invite others"
            description="Team members with admin role can invite new members"
            checked={formData.allowInvites || false}
            onChange={(e) => setFormData(prev => ({ ...prev, allowInvites: e.target.checked }))}
          />

          <Checkbox
            label="Require approval for new team members"
            description="All new invitations must be approved by an admin"
            checked={formData.requireApproval || true}
            onChange={(e) => setFormData(prev => ({ ...prev, requireApproval: e.target.checked }))}
          />

          <Checkbox
            label="Enable team activity notifications"
            description="Get notified when team members perform important actions"
            checked={formData.activityNotifications || true}
            onChange={(e) => setFormData(prev => ({ ...prev, activityNotifications: e.target.checked }))}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} iconName="ChevronLeft" iconPosition="left">
          Previous
        </Button>
        <Button onClick={handleNext} iconName="ChevronRight" iconPosition="right">
          Next: DEI & Compliance
        </Button>
      </div>
    </div>
  );
};

export default TeamSetupStep;
