import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Image from 'components/AppImage';
import { apiRequest, getApiUrl } from 'utils/api';

const ApplicationsTab = ({ userProfile }) => {
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchApplications();
        fetchStats();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            const response = await fetch(getApiUrl('/jobapplier/applications/'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch applications');
            }

            const data = await response.json();
            setApplications(data.applications || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(getApiUrl('/jobapplier/applications/stats/'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(getApiUrl(`/jobapplier/applications/${applicationId}/status/`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Refresh applications
            await fetchApplications();
            await fetchStats();

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-20 right-4 bg-success text-success-foreground px-4 py-2 rounded-lg z-50';
            successMessage.textContent = 'Application status updated successfully!';
            document.body.appendChild(successMessage);
            setTimeout(() => {
                document.body.removeChild(successMessage);
            }, 3000);
        } catch (err) {
            console.error('Error updating status:', err);
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'fixed top-20 right-4 bg-error text-error-foreground px-4 py-2 rounded-lg z-50';
            errorMessage.textContent = 'Failed to update application status';
            document.body.appendChild(errorMessage);
            setTimeout(() => {
                document.body.removeChild(errorMessage);
            }, 3000);
        }
    };

    const handleWithdrawApplication = async (applicationId) => {
        if (!confirm('Are you sure you want to withdraw this application?')) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(getApiUrl(`/jobapplier/applications/${applicationId}/withdraw/`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to withdraw application');
            }

            // Refresh applications
            await fetchApplications();
            await fetchStats();

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-20 right-4 bg-warning text-warning-foreground px-4 py-2 rounded-lg z-50';
            successMessage.textContent = 'Application withdrawn successfully';
            document.body.appendChild(successMessage);
            setTimeout(() => {
                document.body.removeChild(successMessage);
            }, 3000);
        } catch (err) {
            console.error('Error withdrawing application:', err);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'applied': return 'Send';
            case 'reviewing': return 'Eye';
            case 'interviewing': return 'MessageCircle';
            case 'offered': return 'Award';
            case 'hired': return 'CheckCircle';
            case 'rejected': return 'XCircle';
            case 'withdrawn': return 'ArrowLeft';
            default: return 'FileText';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'applied': return 'text-primary bg-primary/10';
            case 'reviewing': return 'text-warning bg-warning/10';
            case 'interviewing': return 'text-accent bg-accent/10';
            case 'offered': return 'text-success bg-success/10';
            case 'hired': return 'text-success bg-success/20';
            case 'rejected': return 'text-error bg-error/10';
            case 'withdrawn': return 'text-muted-foreground bg-muted/10';
            default: return 'text-muted-foreground bg-muted/10';
        }
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'browser': return 'Globe';
            case 'api': return 'Zap';
            case 'email': return 'Mail';
            case 'manual': return 'User';
            default: return 'FileText';
        }
    };

    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    const sortedApplications = [...filteredApplications].sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.applied_at) - new Date(a.applied_at);
        } else if (sortBy === 'oldest') {
            return new Date(a.applied_at) - new Date(b.applied_at);
        } else if (sortBy === 'company') {
            return a.job.company.localeCompare(b.job.company);
        } else if (sortBy === 'title') {
            return a.job.title.localeCompare(b.job.title);
        }
        return 0;
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Applications</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={fetchApplications} variant="outline">
                        <Icon name="RefreshCw" size={16} className="mr-2" />
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Job Applications</h2>
                    <p className="text-muted-foreground">Track and manage your job applications</p>
                </div>
                <Button
                    onClick={fetchApplications}
                    variant="outline"
                    size="sm"
                >
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glassmorphic p-4 rounded-squircle">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-squircle">
                                <Icon name="FileText" size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Applications</p>
                                <p className="text-xl font-bold text-foreground">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glassmorphic p-4 rounded-squircle">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-warning/10 rounded-squircle">
                                <Icon name="Clock" size={20} className="text-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                                <p className="text-xl font-bold text-foreground">{stats.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glassmorphic p-4 rounded-squircle">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-accent/10 rounded-squircle">
                                <Icon name="MessageCircle" size={20} className="text-accent" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Interviewing</p>
                                <p className="text-xl font-bold text-foreground">{stats.interviewing}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glassmorphic p-4 rounded-squircle">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-success/10 rounded-squircle">
                                <Icon name="CheckCircle" size={20} className="text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Success Rate</p>
                                <p className="text-xl font-bold text-foreground">{stats.success_rate}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Sorting */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-white/20 rounded-lg bg-white/10 backdrop-blur text-foreground focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All Applications</option>
                        <option value="applied">Applied</option>
                        <option value="reviewing">Under Review</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offered">Offered</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                        <option value="withdrawn">Withdrawn</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-white/20 rounded-lg bg-white/10 backdrop-blur text-foreground focus:ring-2 focus:ring-primary"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="company">Company A-Z</option>
                        <option value="title">Job Title A-Z</option>
                    </select>
                </div>

                <div className="text-sm text-muted-foreground">
                    {sortedApplications.length} application{sortedApplications.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Applications List */}
            {sortedApplications.length === 0 ? (
                <div className="glassmorphic p-12 rounded-lg text-center">
                    <Icon name="Briefcase" size={64} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        {filter === 'all' ? 'No Applications Yet' : `No ${filter} Applications`}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        {filter === 'all'
                            ? 'Start applying to jobs to see them here'
                            : `You don't have any ${filter} applications at the moment`}
                    </p>
                    {filter === 'all' && (
                        <Button
                            onClick={() => window.location.href = '/job-search-application-hub'}
                            variant="default"
                        >
                            <Icon name="Search" size={16} className="mr-2" />
                            Browse Jobs
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedApplications.map((application) => (
                        <motion.div
                            key={application.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glassmorphic p-6 rounded-lg hover:shadow-lg transition-all duration-200"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-start space-x-4">
                                        {/* Company Logo */}
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Icon name="Building2" size={24} className="text-primary" />
                                        </div>

                                        {/* Job Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-foreground truncate">
                                                    {application.job.title}
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                    <Icon name={getStatusIcon(application.status)} size={12} className="mr-1" />
                                                    {application.status_display}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                                                <div className="flex items-center space-x-1">
                                                    <Icon name="Building2" size={14} />
                                                    <span>{application.job.company}</span>
                                                </div>
                                                {application.job.location && (
                                                    <div className="flex items-center space-x-1">
                                                        <Icon name="MapPin" size={14} />
                                                        <span>{application.job.location}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-1">
                                                    <Icon name={getMethodIcon(application.application_method)} size={14} />
                                                    <span>Applied via {application.application_method}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                                                {application.last_updated && (
                                                    <span>Updated {new Date(application.last_updated).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2 ml-4">
                                    {application.status === 'applied' && (
                                        <select
                                            value={application.status}
                                            onChange={(e) => handleStatusUpdate(application.id, e.target.value)}
                                            className="px-2 py-1 text-xs border border-white/20 rounded bg-white/10 backdrop-blur text-foreground"
                                        >
                                            <option value="applied">Applied</option>
                                            <option value="reviewing">Under Review</option>
                                            <option value="interviewing">Interviewing</option>
                                            <option value="offered">Offered</option>
                                            <option value="hired">Hired</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    )}

                                    {!['hired', 'rejected', 'withdrawn'].includes(application.status) && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleWithdrawApplication(application.id)}
                                        >
                                            <Icon name="X" size={14} className="mr-1" />
                                            Withdraw
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setSelectedApplication(application)}
                                    >
                                        <Icon name="Eye" size={14} className="mr-1" />
                                        Details
                                    </Button>
                                </div>
                            </div>

                            {/* Notes */}
                            {application.notes && (
                                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">{application.notes}</p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Application Detail Modal */}
            {selectedApplication && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glassmorphic max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-foreground">Application Details</h2>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedApplication(null)}
                                >
                                    <Icon name="X" size={16} />
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* Job Information */}
                                <div>
                                    <h3 className="font-semibold text-foreground mb-3">Job Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Title:</strong> {selectedApplication.job.title}</div>
                                        <div><strong>Company:</strong> {selectedApplication.job.company}</div>
                                        {selectedApplication.job.location && (
                                            <div><strong>Location:</strong> {selectedApplication.job.location}</div>
                                        )}
                                        {selectedApplication.job.url && (
                                            <div>
                                                <strong>Job Posting:</strong>{' '}
                                                <a
                                                    href={selectedApplication.job.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline"
                                                >
                                                    View Original
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Application Details */}
                                <div>
                                    <h3 className="font-semibold text-foreground mb-3">Application Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Status:</strong>
                                            <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(selectedApplication.status)}`}>
                                                {selectedApplication.status_display}
                                            </span>
                                        </div>
                                        <div><strong>Applied:</strong> {new Date(selectedApplication.applied_at).toLocaleString()}</div>
                                        <div><strong>Method:</strong> {selectedApplication.application_method}</div>
                                        {selectedApplication.last_updated && (
                                            <div><strong>Last Updated:</strong> {new Date(selectedApplication.last_updated).toLocaleString()}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                {selectedApplication.notes && (
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-3">Notes</h3>
                                        <div className="p-3 bg-muted/50 rounded-lg text-sm">
                                            {selectedApplication.notes}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                                    {!['hired', 'rejected', 'withdrawn'].includes(selectedApplication.status) && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                handleWithdrawApplication(selectedApplication.id);
                                                setSelectedApplication(null);
                                            }}
                                        >
                                            <Icon name="X" size={16} className="mr-2" />
                                            Withdraw Application
                                        </Button>
                                    )}
                                    <Button
                                        variant="default"
                                        onClick={() => setSelectedApplication(null)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationsTab;
