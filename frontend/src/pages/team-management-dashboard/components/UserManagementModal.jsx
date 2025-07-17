import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import { Checkbox } from 'components/ui/Checkbox';
import Image from 'components/AppImage';

const UserManagementModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    department: user?.department || '',
    permissions: user?.permissions || [],
    isActive: user?.isActive !== false
  });

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'coordinator', label: 'Coordinator' },
    { value: 'viewer', label: 'Viewer' }
  ];

  const departmentOptions = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'operations', label: 'Operations' }
  ];

  const permissionOptions = [
    { id: 'view_candidates', label: 'View Candidates', description: 'Access to candidate profiles and applications' },
    { id: 'manage_jobs', label: 'Manage Jobs', description: 'Create, edit, and delete job postings' },
    { id: 'schedule_interviews', label: 'Schedule Interviews', description: 'Book and manage interview slots' },
    { id: 'send_offers', label: 'Send Offers', description: 'Generate and send job offers' },
    { id: 'view_analytics', label: 'View Analytics', description: 'Access hiring metrics and reports' },
    { id: 'manage_team', label: 'Manage Team', description: 'Add, remove, and modify team members' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
    onClose();
  };

  const handlePermissionChange = (permissionId, checked) => {
    const updatedPermissions = checked
      ? [...formData.permissions, permissionId]
      : formData.permissions.filter(id => id !== permissionId);
    
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-glass-border">
          <h2 className="text-xl font-semibold text-foreground">Manage User</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-4 p-4 bg-muted rounded-card">
            <Image
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-foreground">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  user.status === 'active' ? 'bg-success' : 
                  user.status === 'away' ? 'bg-warning' : 'bg-muted-foreground'
                }`} />
                <span className="text-xs text-muted-foreground capitalize">{user.status}</span>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Role and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Role"
              options={roleOptions}
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value })}
              required
            />
            <Select
              label="Department"
              options={departmentOptions}
              value={formData.department}
              onChange={(value) => setFormData({ ...formData, department: value })}
              required
            />
          </div>

          {/* Account Status */}
          <div className="space-y-3">
            <Checkbox
              label="Active Account"
              description="User can access the system and perform assigned tasks"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Permissions</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permissionOptions.map((permission) => (
                <Checkbox
                  key={permission.id}
                  label={permission.label}
                  description={permission.description}
                  checked={formData.permissions.includes(permission.id)}
                  onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                />
              ))}
            </div>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-card">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{user.stats?.jobsPosted || 0}</p>
              <p className="text-xs text-muted-foreground">Jobs Posted</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{user.stats?.candidatesReviewed || 0}</p>
              <p className="text-xs text-muted-foreground">Candidates Reviewed</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{user.stats?.interviewsScheduled || 0}</p>
              <p className="text-xs text-muted-foreground">Interviews Scheduled</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{user.stats?.hiresMade || 0}</p>
              <p className="text-xs text-muted-foreground">Hires Made</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-glass-border">
            <Button
              variant="destructive"
              onClick={() => {
                // Handle user deletion
                onClose();
              }}
              iconName="Trash2"
              iconPosition="left"
            >
              Delete User
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" iconName="Save" iconPosition="left">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal;
