import React, { useEffect, useState, useRef } from 'react';
import MainLayout from 'components/layout/MainLayout';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import TeamMemberCard from 'components/team/TeamMemberCard';
import TeamFilters from 'components/team/TeamFilters';
import BulkActionsBar from 'components/team/BulkActionsBar';
import ActivityFeed from 'components/team/ActivityFeed';
import InviteTeamModal from 'components/team/InviteTeamModal';
import { apiRequest } from 'utils/api';
import showToast from 'utils/showToast';

const backendToUiRole = (role) => {
    if (role === 'hiring_manager') return 'manager';
    if (['admin', 'recruiter', 'viewer'].includes(role)) return role;
    return 'recruiter';
};
const uiToBackendRole = (role) => role === 'manager' ? 'hiring_manager' : role;

export default function CompanyTeamManagement() {
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});
    const [teamMembers, setTeamMembers] = useState([]);
    const [pastMembers, setPastMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [companyRequests, setCompanyRequests] = useState([]);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [viewRecruiter, setViewRecruiter] = useState(null);
    const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);
    const [manageMember, setManageMember] = useState(null);
    const [isManageOpen, setIsManageOpen] = useState(false);

    const normalizeActivity = (item, idxOffset = 0) => ({
        id: Date.now() + idxOffset + Math.floor(Math.random() * 1000),
        type: item.type,
        user: item.user || { name: item.actor || 'System' },
        description: item.description,
        details: item.details,
        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
    });

    const pushActivity = (activity) => {
        const item = normalizeActivity({ ...activity, timestamp: new Date() });
        setRecentActivities(prev => [item, ...prev].slice(0, 30));
    };

    const refreshMembers = async () => {
        try {
            const data = await apiRequest('/team/company/members/');
            const members = (data.members || []).map(m => ({
                id: m.relationship_id,
                name: m.name,
                email: m.email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&size=100&background=random&color=fff`,
                role: backendToUiRole(m.role),
                department: 'hr',
                status: 'active',
                lastLogin: '—',
                permissions: Array.isArray(m.permissions) ? m.permissions : Object.keys(m.permissions || {}),
                stats: { jobsPosted: 0, candidatesReviewed: 0, interviewsScheduled: 0, hiresMade: 0 },
                isActive: true,
            }));
            setTeamMembers(members);
            const past = (data.past_members || []).map(m => ({
                id: m.relationship_id,
                name: m.name,
                email: m.email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&size=100&background=random&color=fff`,
                role: backendToUiRole(m.role),
                department: 'hr',
                status: 'past',
                lastLogin: '—',
                permissions: Array.isArray(m.permissions) ? m.permissions : Object.keys(m.permissions || {}),
                stats: { jobsPosted: 0, candidatesReviewed: 0, interviewsScheduled: 0, hiresMade: 0 },
                isActive: false,
                leftAt: m.left_at || m.updated_at || null,
            }));
            setPastMembers(past);
        } catch (e) { }
    };

    const refreshCompanyRequests = async () => {
        try {
            const data = await apiRequest('/team/invitations/');
            const items = (Array.isArray(data) ? data : []).filter(i => (i.initiated_by === 'recruiter' || i?.permissions?.initiated_by === 'recruiter') && i.status === 'pending');
            setCompanyRequests(items);
        } catch (e) { }
    };

    const processCompanyRequest = async (relationshipId, action) => {
        try {
            await apiRequest(`/team/company/requests/${relationshipId}/process/`, 'PATCH', { action });
            await refreshCompanyRequests();
            if (action === 'accept') {
                await refreshMembers();
                pushActivity({ type: 'user_added', user: { name: 'You' }, description: 'approved a join request' });
            } else {
                pushActivity({ type: 'invitation_received', user: { name: 'You' }, description: 'declined a join request' });
            }
            showToast(`Request ${action}ed`, 'success');
        } catch (e) {
            showToast(e.message || 'Failed to process request', 'error');
        }
    };

    const openViewRecruiter = async (recruiterId) => {
        try {
            const data = await apiRequest(`/auth/recruiters/${recruiterId}/`);
            setViewRecruiter(data);
            setIsRecruiterModalOpen(true);
        } catch (e) {
            showToast(e?.message || 'Failed to load recruiter profile', 'error');
        }
    };

    const handleInviteTeam = async (inviteData) => {
        try {
            const recruiterIds = Array.from(new Set(inviteData.recruiter_ids || []));
            const backendRole = uiToBackendRole(inviteData.role);
            let success = 0;
            for (const rid of recruiterIds) {
                try {
                    await apiRequest('/team/invitations/', 'POST', { recruiter_id: rid, role: backendRole, permissions: inviteData.permissions || [] });
                    success++;
                } catch (err) {
                    const msg = err?.message || 'Failed to send invitation';
                    showToast(msg, 'error');
                }
            }
            pushActivity({ type: 'invitation_sent', user: { name: 'You' }, description: `sent ${success}/${recruiterIds.length} invitation${recruiterIds.length !== 1 ? 's' : ''}`, details: `Role: ${inviteData.role}` });
            if (success > 0) showToast('Invitations sent', 'success');
            await refreshCompanyRequests();
        } catch (e) { }
    };

    const handleUserSave = async (userData) => {
        try {
            await apiRequest(`/team/company/members/${userData.id}/`, 'PATCH', { role: uiToBackendRole(userData.role), permissions: userData.permissions });
            await refreshMembers();
            showToast('User updated', 'success');
        } catch (e) { }
    };

    const handleBulkDelete = async () => {
        try {
            for (const id of selectedMembers) {
                await apiRequest(`/team/company/members/${id}/`, 'DELETE');
            }
            setSelectedMembers([]);
            refreshMembers();
            pushActivity({ type: 'permission_updated', user: { name: 'You' }, description: 'revoked team member(s)', details: `${selectedMembers.length} member(s) removed` });
            showToast('Selected members revoked', 'success');
        } catch (e) { }
    };

    useEffect(() => {
        (async () => {
            await refreshMembers();
            await refreshCompanyRequests();
        })();
    }, []);

    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = !filters.role || member.role === filters.role;
        const matchesDepartment = !filters.department || member.department === filters.department;
        const matchesStatus = !filters.status || member.status === filters.status;
        return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Company Team Management</h1>
                        <p className="text-muted-foreground">Manage your hiring team members, assign roles, and approve recruiter requests</p>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} iconName={viewMode === 'grid' ? 'List' : 'Grid3X3'} iconPosition="left">{viewMode === 'grid' ? 'List View' : 'Grid View'}</Button>
                        <Button onClick={() => setIsInviteModalOpen(true)} iconName="UserPlus" iconPosition="left">Invite Team</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        {companyRequests.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-xl font-semibold">Pending Requests</h2>
                                {companyRequests.map((req) => (
                                    <div key={req.id} className="flex items-start justify-between p-4 border rounded-md hover:bg-muted/30">
                                        <div className="space-y-1">
                                            <div className="font-medium">{req.recruiter_name || 'Recruiter'}</div>
                                            <div className="text-xs text-muted-foreground">{req.recruiter_email || '—'}</div>
                                            <div className="text-sm text-muted-foreground">Requested Role: {backendToUiRole(req.role)}</div>
                                            {req.message && <div className="text-xs text-muted-foreground">Message: {req.message}</div>}
                                            <div className="text-xs text-muted-foreground">Requested: {new Date(req.invited_at).toLocaleString()}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => openViewRecruiter(req.recruiter_id)}>View</Button>
                                            <Button size="sm" variant="outline" onClick={() => processCompanyRequest(req.id, 'decline')}>Decline</Button>
                                            <Button size="sm" onClick={() => processCompanyRequest(req.id, 'accept')}>Accept</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Input type="text" placeholder="Search team members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm" iconName="Download" iconPosition="left">Export</Button>
                                </div>
                            </div>
                            <TeamFilters onFilterChange={setFilters} activeFilters={filters} />
                        </div>

                        <BulkActionsBar selectedCount={selectedMembers.length} totalCount={filteredMembers.length} onSelectAll={() => setSelectedMembers(filteredMembers.map(m => m.id))} onDeselectAll={() => setSelectedMembers([])} onBulkRoleChange={() => { }} onBulkDelete={handleBulkDelete} onBulkExport={() => { }} />

                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                            {filteredMembers.map((member) => (
                                <div key={member.id} className="relative">
                                    <div className="absolute top-4 left-4 z-10">
                                        <input type="checkbox" checked={selectedMembers.includes(member.id)} onChange={() => setSelectedMembers(prev => prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id])} className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary" />
                                    </div>
                                    <TeamMemberCard
                                        member={member}
                                        onRoleChange={() => { setManageMember(member); setIsManageOpen(true); }}
                                        onMessage={() => { /* no-op */ }}
                                        onManageAccess={() => { setManageMember(member); setIsManageOpen(true); }}
                                    />
                                </div>
                            ))}
                        </div>

                        {filteredMembers.length === 0 && (
                            <div className="text-center py-12">
                                <h3 className="text-lg font-semibold text-foreground mb-2">No team members found</h3>
                                <p className="text-muted-foreground mb-4">{searchQuery || Object.values(filters).some(Boolean) ? 'Try adjusting your search or filters' : 'Start by inviting team members to collaborate'}</p>
                                <Button onClick={() => setIsInviteModalOpen(true)} iconName="UserPlus" iconPosition="left">Invite Team Members</Button>
                            </div>
                        )}

                        {pastMembers.length > 0 && (
                            <div className="mt-10">
                                <h2 className="text-xl font-semibold mb-3">Past Members</h2>
                                <div className="space-y-2">
                                    {pastMembers.map(pm => (
                                        <div key={pm.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img src={pm.avatar} alt={pm.name} className="h-8 w-8 rounded-full" />
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium truncate">{pm.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{pm.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs px-2 py-0.5 rounded bg-muted capitalize">{pm.role}</span>
                                                {pm.leftAt && (
                                                    <span className="text-xs text-muted-foreground">Left: {new Date(pm.leftAt).toLocaleDateString()}</span>
                                                )}
                                                <span className="text-xs text-muted-foreground">past</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <ActivityFeed activities={recentActivities} />
                    </div>
                </div>
            </div>

            <InviteTeamModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} onInvite={handleInviteTeam} />

            {isRecruiterModalOpen && viewRecruiter && (
                <div className="fixed inset-0 z-modal bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50" onClick={() => setIsRecruiterModalOpen(false)}>
                    <div className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border/30 dark:ring-white/10 bg-background animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between gap-3 p-4 border-b border-border/40 dark:border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
                            <div className="flex items-center gap-3 min-w-0">
                                {viewRecruiter.profile_image_url && (
                                    <img src={viewRecruiter.profile_image_url} alt={viewRecruiter.name} className="h-10 w-10 rounded-lg object-cover ring-1 ring-border/40 dark:ring-white/10" />
                                )}
                                <div className="min-w-0">
                                    <h3 className="text-lg font-semibold truncate text-foreground">{viewRecruiter.name}</h3>
                                    {viewRecruiter.job_title && (
                                        <div className="text-xs text-muted-foreground truncate">{viewRecruiter.job_title}</div>
                                    )}
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" iconName="X" onClick={() => setIsRecruiterModalOpen(false)}>Close</Button>
                        </div>
                        <RecruiterDetailsTabs recruiter={viewRecruiter} />
                    </div>
                </div>
            )}

            {isManageOpen && manageMember && (
                <div className="fixed inset-0 z-modal bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-xl bg-background border border-border rounded-lg shadow-xl">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="text-lg font-semibold">Manage {manageMember.name}</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsManageOpen(false)}>Close</Button>
                        </div>
                        <div className="p-4 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Role</label>
                                    <select
                                        className="mt-1 w-full border border-border rounded-md bg-background p-2 text-sm"
                                        value={manageMember.role}
                                        onChange={(e) => setManageMember({ ...manageMember, role: e.target.value })}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="recruiter">Recruiter</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <div className="mt-2 text-sm text-muted-foreground">Active member</div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Permissions</label>
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {['view_candidates', 'manage_jobs', 'schedule_interviews', 'send_offers', 'view_analytics', 'manage_team'].map(pid => (
                                        <label key={pid} className="flex items-start gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                className="mt-1"
                                                checked={(manageMember.permissions || []).includes(pid)}
                                                onChange={(e) => {
                                                    const has = (manageMember.permissions || []).includes(pid);
                                                    const next = e.target.checked
                                                        ? [...(manageMember.permissions || []), pid]
                                                        : (manageMember.permissions || []).filter(x => x !== pid);
                                                    setManageMember({ ...manageMember, permissions: next });
                                                }}
                                            />
                                            <span className="capitalize">{pid.replace(/_/g, ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-border flex items-center justify-between">
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    try {
                                        await apiRequest(`/team/company/members/${manageMember.id}/`, 'DELETE');
                                        setIsManageOpen(false);
                                        setManageMember(null);
                                        await refreshMembers();
                                        showToast('Member removed', 'success');
                                    } catch (e) {
                                        showToast(e?.message || 'Failed to remove', 'error');
                                    }
                                }}
                            >
                                Remove Member
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => { setIsManageOpen(false); setManageMember(null); }}>Cancel</Button>
                                <Button onClick={async () => {
                                    try {
                                        await handleUserSave(manageMember);
                                        setIsManageOpen(false);
                                        setManageMember(null);
                                    } catch (_) { }
                                }}>Save</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

function RecruiterDetailsTabs({ recruiter }) {
    const [tab, setTab] = React.useState('overview');
    const TabBtn = ({ id, children }) => (
        <button
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${tab === id
                ? 'bg-primary/20 dark:bg-primary/25 text-foreground ring-1 ring-primary/30 dark:ring-primary/20'
                : 'bg-muted/60 dark:bg-muted/20 text-foreground/80 hover:bg-muted/80 dark:hover:bg-muted/30'
                }`}
        >
            {children}
        </button>
    );
    const KeyVal = ({ k, v }) => (
        <div className="grid grid-cols-3 gap-3 py-1 text-sm">
            <div className="text-muted-foreground break-all">{k}</div>
            <div className="col-span-2 break-words">{renderVal(v)}</div>
        </div>
    );
    const renderVal = (v) => {
        if (v == null || v === '') return '—';
        if (Array.isArray(v)) return v.length ? v.map((x, i) => <span key={i} className="inline-block mr-1 mb-1 px-2 py-0.5 bg-muted/30 dark:bg-muted/20 rounded text-xs">{String(x)}</span>) : '—';
        if (typeof v === 'object') return <pre className="whitespace-pre-wrap break-words text-xs bg-muted/20 dark:bg-muted/30 p-2 rounded ring-1 ring-border/20 dark:ring-white/5">{JSON.stringify(v, null, 2)}</pre>;
        if (String(v).startsWith('http')) return <a href={v} className="text-primary" target="_blank" rel="noreferrer">{String(v)}</a>;
        return String(v);
    };
    return (
        <div className="px-4">
            <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-background/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-border/40 dark:border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <TabBtn id="overview">Overview</TabBtn>
                <TabBtn id="contact">Contact</TabBtn>
                <TabBtn id="experience">Experience</TabBtn>
                <TabBtn id="skills">Skills</TabBtn>
                <TabBtn id="documents">Documents</TabBtn>
                <TabBtn id="all">All Fields</TabBtn>
            </div>
            <div className="mt-4 max-h-[60vh] overflow-auto pr-3 pb-6">
                {tab === 'overview' && (
                    <div className="space-y-3">
                        <KeyVal k="Name" v={recruiter.name} />
                        <KeyVal k="Job Title" v={recruiter.job_title} />
                        <KeyVal k="Location" v={recruiter.location} />
                        <KeyVal k="Years of Experience" v={recruiter.years_of_experience} />
                        <KeyVal k="Bio" v={recruiter.bio} />
                    </div>
                )}
                {tab === 'contact' && (
                    <div className="space-y-1">
                        <KeyVal k="Email" v={recruiter.email} />
                        <KeyVal k="Phone" v={recruiter.phone} />
                        <KeyVal k="LinkedIn" v={recruiter.linkedin_url} />
                        <KeyVal k="Website" v={recruiter.website} />
                    </div>
                )}
                {tab === 'experience' && (
                    <div className="space-y-1">
                        <KeyVal k="Current Company" v={recruiter.current_company?.name} />
                        <KeyVal k="Company Associations" v={recruiter.company_associations} />
                        <KeyVal k="Education" v={recruiter.education} />
                        <KeyVal k="Certifications" v={recruiter.certifications} />
                    </div>
                )}
                {tab === 'skills' && (
                    <div>
                        <KeyVal k="Skills" v={recruiter.skills} />
                        <KeyVal k="Tools" v={recruiter.tools} />
                        <KeyVal k="Languages" v={recruiter.languages} />
                    </div>
                )}
                {tab === 'documents' && (
                    <div className="space-y-1">
                        <KeyVal k="Resume URL" v={recruiter.resume_url} />
                        <KeyVal k="Portfolio URL" v={recruiter.portfolio_url} />
                    </div>
                )}
                {tab === 'all' && (
                    <div className="space-y-2">
                        {Object.entries(recruiter).map(([k, v]) => (
                            <KeyVal key={k} k={k} v={v} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
