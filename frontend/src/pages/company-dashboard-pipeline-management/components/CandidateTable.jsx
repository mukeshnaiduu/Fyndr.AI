import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Image from 'components/AppImage';
import recruiterAPI from '../../../services/recruiterAPI';
import { useRealTime } from '../../../hooks/useRealTime';
import showToast from 'utils/showToast';

const CandidateTable = ({ jobId }) => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [sortBy, setSortBy] = useState('applied_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState(null);
  const { on, off } = useRealTime();

  const loadApplicants = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await recruiterAPI.listApplicants(jobId, { page, page_size: 20 });
      const items = res.results || res || [];
      setHasNextPage(Boolean(res.next));
      setCandidates(items);
    } catch (e) {
      setError(e?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  }, [jobId, page]);

  useEffect(() => {
    loadApplicants();

    const onAppCreated = (payload) => {
      const app = payload?.application || payload;
      if (app?.job_id === jobId) {
        setCandidates(prev => [app, ...prev]);
      }
    };
    const onStatusUpdated = (payload) => {
      const id = payload?.application_id || payload?.id;
      if (!id) return;
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: payload.new_status || payload.status } : c));
    };
    on('application_created', onAppCreated);
    on('status_updated', onStatusUpdated);
    return () => {
      off('application_created', onAppCreated);
      off('status_updated', onStatusUpdated);
    };
  }, [loadApplicants, on, off, jobId]);

  const STATUS_OPTIONS = [
    { label: 'Pending', value: 'pending' },
    { label: 'Applied', value: 'applied' },
    { label: 'In Review', value: 'in_review' },
    { label: 'Interview', value: 'interview' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Offer', value: 'offer' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Declined', value: 'declined' },
    { label: 'Withdrawn', value: 'withdrawn' },
    { label: 'Failed', value: 'failed' }
  ];

  const getStatusLabel = (value) => STATUS_OPTIONS.find(s => s.value === value)?.label || value;

  const getStageColor = (statusValue) => {
    const map = {
      pending: 'bg-muted/20 text-muted-foreground',
      applied: 'bg-blue-500/20 text-blue-400',
      in_review: 'bg-yellow-500/20 text-yellow-400',
      interview: 'bg-orange-500/20 text-orange-400',
      rejected: 'bg-error/20 text-error',
      offer: 'bg-emerald-500/20 text-emerald-400',
      accepted: 'bg-green-500/20 text-green-400',
      declined: 'bg-warning/20 text-warning',
      withdrawn: 'bg-muted/20 text-muted-foreground',
      failed: 'bg-error/20 text-error'
    };
    return map[statusValue] || 'bg-gray-500/20 text-gray-400';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-warning';
    return 'text-error';
  };

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCandidates(
      selectedCandidates.length === candidates.length
        ? []
        : candidates.map(c => c.id)
    );
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} for candidates:`, selectedCandidates);
  };

  const sorted = useMemo(() => {
    const arr = [...candidates];
    return arr.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal === bVal) return 0;
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }, [candidates, sortBy, sortOrder]);

  const updateStatus = async (candidateId, newStatus) => {
    try {
      setUpdatingId(candidateId);
      await recruiterAPI.updateApplicationStatus(candidateId, newStatus);
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
      showToast('Status updated');
    } catch (e) {
      console.error('Failed to update status', e);
      showToast(e?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="glassmorphic-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Candidates</h2>
        {loading && <span className="text-sm text-muted-foreground">Loading…</span>}
        {error && <span className="text-sm text-error">{error}</span>}
        {selectedCandidates.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {selectedCandidates.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              iconName="Mail"
              onClick={() => handleBulkAction('message')}
            >
              Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Calendar"
              onClick={() => handleBulkAction('schedule')}
            >
              Schedule
            </Button>
            <Button
              variant="destructive"
              size="sm"
              iconName="X"
              onClick={() => handleBulkAction('reject')}
            >
              Reject
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-3">
                <input
                  type="checkbox"
                  checked={selectedCandidates.length === candidates.length}
                  onChange={handleSelectAll}
                  className="rounded border-white/20 bg-transparent"
                />
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">Candidate</span>
                  <Icon
                    name={sortBy === 'name' && sortOrder === 'desc' ? 'ChevronDown' : 'ChevronUp'}
                    size={14}
                    className="text-muted-foreground"
                  />
                </div>
              </th>
              <th className="text-left p-3">
                <span className="text-sm font-medium text-foreground">Position</span>
              </th>
              <th className="text-left p-3">
                <span className="text-sm font-medium text-foreground">Stage</span>
              </th>
              <th
                className="text-left p-3 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">Score</span>
                  <Icon
                    name={sortBy === 'score' && sortOrder === 'desc' ? 'ChevronDown' : 'ChevronUp'}
                    size={14}
                    className="text-muted-foreground"
                  />
                </div>
              </th>
              <th className="text-left p-3">
                <span className="text-sm font-medium text-foreground">Skills</span>
              </th>
              <th className="text-left p-3">
                <span className="text-sm font-medium text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((candidate) => (
              <tr
                key={candidate.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={() => handleSelectCandidate(candidate.id)}
                    className="rounded border-white/20 bg-transparent"
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-3">
                    <Image src={candidate.avatar || 'https://api.dicebear.com/8.x/identicon/svg?seed=' + (candidate.email || candidate.full_name || candidate.id)} alt={candidate.full_name || candidate.name || 'Candidate'} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="font-medium text-foreground">{candidate.full_name || candidate.name || 'Anonymous'}</div>
                      <div className="text-sm text-muted-foreground">{candidate.email || '—'}</div>
                      <div className="text-xs text-muted-foreground">{candidate.location}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-sm text-foreground">{candidate.position || candidate.job_title || '—'}</div>
                  <div className="text-xs text-muted-foreground">{candidate.experience || candidate.experience_years ? `${candidate.experience_years} yrs` : ''}</div>
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(candidate.status || 'pending')}`}>
                      {getStatusLabel(candidate.status || 'pending')}
                    </span>
                    <select
                      className="bg-transparent border border-white/20 rounded px-2 py-1 text-xs text-foreground"
                      value={candidate.status || 'pending'}
                      onChange={(e) => updateStatus(candidate.id, e.target.value)}
                      disabled={updatingId === candidate.id}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="p-3">
                  {candidate.score != null && (
                    <span className={`text-lg font-bold ${getScoreColor(candidate.score)}`}>
                      {candidate.score}%
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {(candidate.skills || []).slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {(candidate.skills || []).length > 2 && (
                      <span className="px-2 py-1 bg-muted/20 text-muted-foreground text-xs rounded-full">
                        +{(candidate.skills || []).length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Eye"
                      onClick={() => console.log('View candidate', candidate.id)}
                      className="hover:bg-white/10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="Mail"
                      onClick={() => console.log('Message candidate', candidate.id)}
                      className="hover:bg-white/10"
                    />
                    {candidate.files && (
                      <Button
                        variant="ghost"
                        size="icon"
                        iconName="Download"
                        title="Download resume"
                        onClick={() => window.open(recruiterAPI.getDownloadUrl(candidate.id, 'resume'), '_blank')}
                        className="hover:bg-white/10"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="MoreHorizontal"
                      onClick={() => console.log('More actions', candidate.id)}
                      className="hover:bg-white/10"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
        <div className="text-sm text-muted-foreground">Page {page}</div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="ChevronLeft" disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button variant="outline" size="sm" iconName="ChevronRight" disabled={!hasNextPage || loading} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateTable;
