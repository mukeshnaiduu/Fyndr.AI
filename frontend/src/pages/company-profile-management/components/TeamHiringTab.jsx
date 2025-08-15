import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const TeamHiringTab = ({ profile, onUpdate, isEditing, setIsEditing }) => {
  const [form, setForm] = useState({
    role_title: '',
    team_size: '',
    department: '',
    current_openings: '',
    hiring_focus: [],
  });

  useEffect(() => {
    setForm({
      role_title: profile?.role_title || '',
      team_size: profile?.team_size || '',
      department: profile?.department || '',
      current_openings: profile?.current_openings ?? '',
      hiring_focus: Array.isArray(profile?.hiring_focus) ? profile.hiring_focus : [],
    });
  }, [profile]);

  const [newFocus, setNewFocus] = useState('');

  const handleSave = () => {
    const payload = {
      ...form,
      current_openings: form.current_openings === '' ? null : Number(form.current_openings),
    };
    onUpdate(payload);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team & Hiring Information</h3>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          {isEditing ? 'Save Changes' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Role
          </label>
          <Input
            value={form.role_title}
            placeholder="e.g., HR Manager, Recruiter"
            readOnly={!isEditing}
            onChange={(e) => setForm({ ...form, role_title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Size
          </label>
          <Input
            value={form.team_size}
            placeholder="e.g., 5-10 people"
            readOnly={!isEditing}
            onChange={(e) => setForm({ ...form, team_size: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          <Input
            value={form.department}
            placeholder="e.g., Human Resources, Talent Acquisition"
            readOnly={!isEditing}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Openings
          </label>
          <Input
            value={form.current_openings}
            placeholder="Number of current job openings"
            readOnly={!isEditing}
            onChange={(e) => setForm({ ...form, current_openings: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hiring Focus
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.hiring_focus.map((focus, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center"
              >
                {focus}
                {isEditing && (
                  <button className="ml-2 text-blue-600 hover:text-blue-800" onClick={() => setForm({ ...form, hiring_focus: form.hiring_focus.filter((_, i) => i !== index) })}>
                    <Icon name="X" size={14} />
                  </button>
                )}
              </span>
            ))}
            {!form.hiring_focus.length && <span className="text-gray-500">No hiring focus specified</span>}
          </div>
          {isEditing && (
            <div className="flex gap-2 mt-2">
              <Input
                value={newFocus}
                placeholder="Add hiring focus (e.g., Software Engineering, Sales)"
                onChange={(e) => setNewFocus(e.target.value)}
              />
              <button className="px-3 py-2 text-sm border rounded-md" onClick={() => {
                if (newFocus.trim()) {
                  setForm({ ...form, hiring_focus: [...form.hiring_focus, newFocus.trim()] });
                  setNewFocus('');
                }
              }}>Add</button>
            </div>
          )}
        </div>

        {/* Team Members */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Team Members
          </label>
          <div className="space-y-2">
            {profile?.team_members?.map((member, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                </div>
                {isEditing && (
                  <button className="text-red-500 hover:text-red-700">
                    <Icon name="Trash2" size={16} />
                  </button>
                )}
              </div>
            )) || <p className="text-gray-500">No team members added</p>}
          </div>
          {isEditing && (
            <button className="mt-3 px-4 py-2 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Icon name="Plus" size={16} className="mr-2" />
              Add Team Member
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { TeamHiringTab };
