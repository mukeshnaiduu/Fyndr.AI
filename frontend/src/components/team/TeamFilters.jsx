import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Select from 'components/ui/Select';

const TeamFilters = ({ onFilterChange, activeFilters = {} }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const roleOptions = [
        { value: '', label: 'All Roles' },
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'recruiter', label: 'Recruiter' },
        { value: 'coordinator', label: 'Coordinator' },
        { value: 'viewer', label: 'Viewer' }
    ];

    const departmentOptions = [
        { value: '', label: 'All Departments' },
        { value: 'engineering', label: 'Engineering' },
        { value: 'hr', label: 'Human Resources' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'sales', label: 'Sales' },
        { value: 'operations', label: 'Operations' }
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'away', label: 'Away' },
        { value: 'offline', label: 'Offline' }
    ];

    const activityOptions = [
        { value: '', label: 'All Activity' },
        { value: 'today', label: 'Active Today' },
        { value: 'week', label: 'Active This Week' },
        { value: 'month', label: 'Active This Month' },
        { value: 'inactive', label: 'Inactive' }
    ];

    const handleFilterChange = (filterType, value) => {
        onFilterChange({
            ...activeFilters,
            [filterType]: value
        });
    };

    const clearAllFilters = () => {
        onFilterChange({});
    };

    const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

    return (
        <div className="glass-card border border-glass-border">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-2">
                    <Icon name="Filter" size={20} className="text-muted-foreground" />
                    <h3 className="font-medium text-foreground">Filters</h3>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            iconName="X"
                            iconPosition="left"
                        >
                            Clear All
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <Icon
                            name={isExpanded ? "ChevronUp" : "ChevronDown"}
                            size={16}
                        />
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-glass-border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Select
                            label="Role"
                            options={roleOptions}
                            value={activeFilters.role || ''}
                            onChange={(value) => handleFilterChange('role', value)}
                            className="mb-0"
                        />

                        <Select
                            label="Department"
                            options={departmentOptions}
                            value={activeFilters.department || ''}
                            onChange={(value) => handleFilterChange('department', value)}
                            className="mb-0"
                        />

                        <Select
                            label="Status"
                            options={statusOptions}
                            value={activeFilters.status || ''}
                            onChange={(value) => handleFilterChange('status', value)}
                            className="mb-0"
                        />

                        <Select
                            label="Activity"
                            options={activityOptions}
                            value={activeFilters.activity || ''}
                            onChange={(value) => handleFilterChange('activity', value)}
                            className="mb-0"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamFilters;
