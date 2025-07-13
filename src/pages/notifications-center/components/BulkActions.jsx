import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const BulkActions = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onMarkAllRead,
  onMarkAllUnread,
  onArchiveSelected,
  onDeleteSelected,
  isAllSelected
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSelectToggle = () => {
    if (isAllSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  const handleDeleteConfirm = () => {
    onDeleteSelected();
    setShowConfirmDelete(false);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="glassmorphic rounded-squircle p-4 border elevation-2 glow-primary dark:bg-neutral-900/80"
      >
        <div className="flex items-center justify-between">
          {/* Selection Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectToggle}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-sm font-body font-body-medium text-foreground dark:text-white">
                {selectedCount} of {totalCount} selected
              </span>
            </div>

            {selectedCount < totalCount && (
              <Button
                variant="ghost"
                size="xs"
                onClick={onSelectAll}
                iconName="CheckSquare"
                iconPosition="left"
                iconSize={12}
              >
                Select All
              </Button>
            )}

            <Button
              variant="ghost"
              size="xs"
              onClick={onDeselectAll}
              iconName="Square"
              iconPosition="left"
              iconSize={12}
            >
              Deselect All
            </Button>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllRead}
              iconName="Check"
              iconPosition="left"
              iconSize={14}
            >
              Mark Read
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllUnread}
              iconName="Mail"
              iconPosition="left"
              iconSize={14}
            >
              Mark Unread
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onArchiveSelected}
              iconName="Archive"
              iconPosition="left"
              iconSize={14}
            >
              Archive
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowConfirmDelete(true)}
              iconName="Trash2"
              iconPosition="left"
              iconSize={14}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Selection Progress</span>
            <span>{Math.round((selectedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(selectedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="bg-primary h-2 rounded-full"
            />
          </div>
        </div>

        {/* Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-squircle">
          <div className="absolute top-2 left-4 w-1 h-1 bg-primary/30 rounded-full particle-float"></div>
          <div className="absolute bottom-2 right-4 w-1.5 h-1.5 bg-accent/40 rounded-full particle-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glassmorphic rounded-squircle p-6 max-w-md w-full elevation-3"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-error/10 rounded-squircle flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-error" />
              </div>
              <div>
                <h3 className="font-heading font-heading-semibold text-foreground">
                  Delete Notifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete {selectedCount} selected notification{selectedCount > 1 ? 's' : ''}?
              This will permanently remove them from your notification history.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                iconName="Trash2"
                iconPosition="left"
                iconSize={14}
              >
                Delete {selectedCount} Notification{selectedCount > 1 ? 's' : ''}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default BulkActions;
