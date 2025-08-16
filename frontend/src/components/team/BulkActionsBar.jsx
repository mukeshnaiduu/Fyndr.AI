import React from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const BulkActionsBar = ({
    selectedCount = 0,
    onSelectAll,
    onDeselectAll,
    onBulkRoleChange,
    onBulkDelete,
    onBulkExport,
    totalCount = 0
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="glass-card border border-glass-border p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Icon name="CheckSquare" size={20} className="text-primary" />
                        <span className="text-sm font-medium text-foreground">
                            {selectedCount} of {totalCount} selected
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSelectAll}
                            iconName="CheckSquare"
                            iconPosition="left"
                        >
                            Select All
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDeselectAll}
                            iconName="Square"
                            iconPosition="left"
                        >
                            Deselect All
                        </Button>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBulkRoleChange}
                        iconName="UserCog"
                        iconPosition="left"
                    >
                        Change Roles
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBulkExport}
                        iconName="Download"
                        iconPosition="left"
                    >
                        Export
                    </Button>

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onBulkDelete}
                        iconName="Trash2"
                        iconPosition="left"
                    >
                        Remove
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BulkActionsBar;
