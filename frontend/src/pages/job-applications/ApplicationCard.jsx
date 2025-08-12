import React, { useState } from 'react';
import jobApplicationService from '../../services/jobApplicationService';

const ApplicationCard = ({ application, onStatusUpdate, onRemove, className = "" }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const confirmation = application.confirmationNumber || application.confirmation_number;
  const atsUrl = application.jobUrl;

  const isAbsoluteUrl = (url) => {
    try { return /^https?:\/\//i.test(url); } catch { return false; }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interview':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'offer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(application.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerify = async () => {
    if (!application?.id) return;
    try {
      setIsVerifying(true);
      setVerifyMessage('Starting verification...');
      // Mark verified (manual) immediately
      try {
        await jobApplicationService.verifyApplication(application.id, { source: 'manual' });
      } catch (e) {
        // non-fatal
      }
      // Start realtime tracking (also calls backend monitoring via dynamicAPI inside service)
      await jobApplicationService.startRealtimeTracking(application.id);
      setVerifyMessage('Verification started: we will update status if the ATS shows your submission.');
      setTimeout(() => setVerifyMessage(''), 5000);
    } catch (e) {
      console.error('Verify failed:', e);
      setVerifyMessage('Could not start verification. You can still open the ATS link to check.');
      setTimeout(() => setVerifyMessage(''), 7000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmApplied = async () => {
    if (!application?.id) return;
    try {
      const didApply = window.confirm('Did you apply on the careers site just now?');
      if (!didApply) return;
      setConfirming(true);
      const confirmationNumber = prompt('Optional: Enter confirmation number (if any)', '') || undefined;
      const updated = await jobApplicationService.confirmApplied(application.id, {
        confirmationNumber,
        applicationUrl: application.jobUrl
      });
      if (updated?.success) {
        onStatusUpdate?.(application.id, 'applied');
      }
    } catch (e) {
      console.error('Confirm applied failed:', e);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {application.jobTitle || 'Job Title'}
          </h3>
          <p className="text-gray-600 mb-2">
            {application.company || 'Company Name'}
          </p>
          <p className="text-sm text-gray-500">
            {application.location || 'Location'}
          </p>
        </div>

        {/* Status and Confirmation */}
        <div className="flex flex-col items-end gap-1">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
            {application.status || 'Applied'}
          </span>
          {application.is_verified && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 border border-green-200">
              Verified{application.verified_source ? ` · ${application.verified_source}` : ''}
            </span>
          )}
          {confirmation && (
            <button
              type="button"
              className="text-[11px] text-gray-500 hover:text-gray-700"
              title={`Confirmation: ${confirmation}`}
              onClick={() => navigator.clipboard?.writeText(confirmation)}
            >
              #{String(confirmation).slice(-8)} • Copy
            </button>
          )}
        </div>
      </div>

      {/* Application Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Applied:</span>
          <span className="text-gray-900">
            {application.appliedDate ? formatDate(application.appliedDate) : 'N/A'}
          </span>
        </div>

        {application.lastUpdate && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Last Update:</span>
            <span className="text-gray-900">
              {formatDate(application.lastUpdate)}
            </span>
          </div>
        )}

        {application.salary && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Salary:</span>
            <span className="text-gray-900">
              ${application.salary.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          {/* Status Update Dropdown */}
          <select
            value={application.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={isUpdating}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="applied">Applied</option>
            <option value="in review">In Review</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        <div className="flex space-x-2">
          {/* View on ATS / Job */}
          {isAbsoluteUrl(atsUrl) && (
            <button
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              onClick={() => window.open(atsUrl, '_blank')}
              title={atsUrl}
            >
              {/workday/i.test(atsUrl) || /myworkdayjobs/i.test(atsUrl) ? 'Open in Workday' : 'Open on ATS'}
            </button>
          )}
          {!isAbsoluteUrl(atsUrl) && (
            <button
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              onClick={() => window.open(application.jobUrl || '#', '_blank')}
            >
              View Job
            </button>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className={`text-sm font-medium ${isVerifying ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-700'}`}
            title="Check ATS for your submission and update status if found"
          >
            {isVerifying ? 'Verifying…' : 'Verify'}
          </button>

          {/* Confirm Applied Button */}
          <button
            onClick={handleConfirmApplied}
            disabled={confirming}
            className={`text-sm font-medium ${confirming ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
            title="Mark as Applied if you submitted on the careers site"
          >
            {confirming ? 'Saving…' : 'I Applied'}
          </button>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(application.id)}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Verification helper message */}
      {verifyMessage && (
        <div className="mt-3 text-xs text-gray-600">
          {verifyMessage}
        </div>
      )}

      {/* Notes Section */}
      {application.notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Notes:</span> {application.notes}
          </p>
        </div>
      )}

      {/* Artifacts Section */}
      {Array.isArray(application.automation_log) && application.automation_log.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Artifacts</p>
          <ul className="space-y-1">
            {application.automation_log.map((item, idx) => (
              <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                <span className="inline-block px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border">{item.type || 'file'}</span>
                {item.path ? (
                  <a href={item.path} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                    {item.path}
                  </a>
                ) : (
                  <span className="truncate">{item.name || 'artifact'}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;
