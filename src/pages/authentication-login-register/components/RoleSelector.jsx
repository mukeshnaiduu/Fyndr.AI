import React from 'react';
import Select from 'components/ui/Select';

const RoleSelector = ({ selectedRole, onRoleChange, error }) => {
  const roleOptions = [
    {
      value: 'job_seeker',
      label: 'Job Seeker',
      description: 'Looking for new opportunities and career growth'
    },
    {
      value: 'recruiter',
      label: 'Recruiter',
      description: 'HR professional seeking top talent'
    },
    {
      value: 'employer',
      label: 'Employer',
      description: 'Company hiring manager or team lead'
    },
    {
      value: 'administrator',
      label: 'Administrator',
      description: 'Platform manager with system access'
    }
  ];

  return (
    <div className="space-y-2">
      <Select
        label="Select Your Role"
        description="Choose the role that best describes you"
        placeholder="Choose your role..."
        options={roleOptions}
        value={selectedRole}
        onChange={onRoleChange}
        error={error}
        required
        searchable
        className="mb-4"
      />
      
      {selectedRole && (
        <div className="glassmorphic p-3 rounded-squircle border border-primary/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-body font-body-medium text-foreground">
              {roleOptions.find(role => role.value === selectedRole)?.label} selected
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-4">
            {roleOptions.find(role => role.value === selectedRole)?.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoleSelector;
