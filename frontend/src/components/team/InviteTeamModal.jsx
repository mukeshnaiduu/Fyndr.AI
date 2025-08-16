import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';
import { Checkbox } from 'components/ui/Checkbox';
import { apiRequest } from 'utils/api';

const InviteTeamModal = ({ isOpen, onClose, onInvite }) => {
    const [inviteType] = useState('recruiter');
    // Internal options for recruiters; we fetch once when opened
    const [recruiterOptions, setRecruiterOptions] = useState([]);
    const [selectedRecruiters, setSelectedRecruiters] = useState([]); // array of ids
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [permissions, setPermissions] = useState([]);

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

    // fetch recruiters once when modal opens
    useEffect(() => {
        if (!isOpen) return;
        let active = true;
        (async () => {
            try {
                const res = await apiRequest(`/auth/recruiters/?limit=20`);
                if (!active) return;
                const opts = (res.results || []).map(r => ({ value: r.id, label: `${r.name} (${r.email})` }));
                setRecruiterOptions(opts);
            } catch (e) {
                // ignore
            }
        })();
        return () => { active = false; };
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const inviteData = {
            type: 'recruiter',
            recruiter_ids: (Array.isArray(selectedRecruiters) ? selectedRecruiters : [selectedRecruiters]).filter(Boolean),
            role: selectedRole,
            department: selectedDepartment,
            permissions,
            customMessage
        };

        onInvite(inviteData);
        onClose();
    };

    const handlePermissionChange = (permissionId, checked) => {
        if (checked) {
            setPermissions([...permissions, permissionId]);
        } else {
            setPermissions(permissions.filter(id => id !== permissionId));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-background border border-gray-200 dark:border-glass-border rounded-lg shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-glass-border">
                    <h2 className="text-xl font-semibold text-foreground">Invite Team Members</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <Icon name="X" size={20} />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Invite Type - fixed to recruiters */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">Invite Recruiters</label>
                        <p className="text-xs text-muted-foreground">Search and select existing recruiter users to invite.</p>
                    </div>

                    {/* Recruiter Picker */}
                    <div className="space-y-2">
                        <Select
                            label="Select Recruiters"
                            options={recruiterOptions}
                            value={selectedRecruiters}
                            onChange={setSelectedRecruiters}
                            multiple
                            searchable
                            placeholder="Choose recruiters"
                            required
                        />
                    </div>

                    {/* Role and Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Role"
                            options={roleOptions}
                            value={selectedRole}
                            onChange={setSelectedRole}
                            placeholder="Select role"
                            required
                        />
                        <Select
                            label="Department"
                            options={departmentOptions}
                            value={selectedDepartment}
                            onChange={setSelectedDepartment}
                            placeholder="Select department"
                            required
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
                                    checked={permissions.includes(permission.id)}
                                    onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Custom Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Custom Message (Optional)</label>
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Add a personal message to the invitation..."
                            className="w-full h-24 px-3 py-2 bg-background border border-border rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-glass-border">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" iconName="Send" iconPosition="left">
                            Send Invitations
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteTeamModal;
