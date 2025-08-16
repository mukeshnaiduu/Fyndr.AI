import React, { useEffect, useState, useRef } from 'react';
import MainLayout from 'components/layout/MainLayout';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import ActivityFeed from 'components/team/ActivityFeed';
import { apiRequest } from 'utils/api';
import showToast from 'utils/showToast';

const backendToUiRole = (role) => {
    if (role === 'hiring_manager') return 'manager';
    if (['admin', 'recruiter', 'viewer'].includes(role)) return role;
    return 'recruiter';
};

export default function RecruiterTeamManagement() {
    const [recruiterInvitations, setRecruiterInvitations] = useState([]);
    const [companiesQuery, setCompaniesQuery] = useState('');
    const [companiesOptions, setCompaniesOptions] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [requestMessage, setRequestMessage] = useState('');
    const [recentActivities, setRecentActivities] = useState([]);
    const [recruiterCompanies, setRecruiterCompanies] = useState([]);
    const [currentCompany, setCurrentCompany] = useState(null);
    const [viewCompany, setViewCompany] = useState(null);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const activityPollRef = useRef(null);

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

    const refreshRecruiterInvitations = async () => {
        try {
            const data = await apiRequest('/team/invitations/');
            setRecruiterInvitations(Array.isArray(data) ? data : []);
        } catch (e) {
            // silent
        }
    };

    const refreshRecruiterActivities = async () => {
        try {
            const invites = await apiRequest('/team/invitations/');
            const list = (Array.isArray(invites) ? invites : []).filter(i => (i.initiated_by === 'company' || !i.initiated_by));
            const mapped = list.slice(0, 20).map((i, idx) => normalizeActivity({
                type: 'invitation_received',
                user: { name: i.company_name || 'Company' },
                description: 'invited you to join their team',
                details: `Role: ${backendToUiRole(i.role || 'recruiter')}, Status: ${i.status}`,
                timestamp: i.created_at || i.updated_at || new Date(),
            }, idx));
            setRecentActivities(mapped);
        } catch (e) { }
    };

    const startActivityPolling = () => {
        stopActivityPolling();
        activityPollRef.current = setInterval(() => {
            refreshRecruiterActivities();
        }, 30000);
    };
    const stopActivityPolling = () => { if (activityPollRef.current) clearInterval(activityPollRef.current); };

    useEffect(() => {
        (async () => {
            await refreshRecruiterInvitations();
            await refreshRecruiterActivities();
            startActivityPolling();
            try {
                const companies = await apiRequest('/team/recruiter/companies/');
                setRecruiterCompanies(Array.isArray(companies) ? companies : []);
            } catch (_) { }
            try {
                const me = await apiRequest('/auth/profile/');
                if (me?.current_company) setCurrentCompany(me.current_company);
            } catch (_) { }
        })();
        return () => stopActivityPolling();
    }, []);

    // Companies search for recruiter join request
    useEffect(() => {
        let active = true;
        const fetchCompanies = async () => {
            try {
                const res = await apiRequest(`/auth/companies/?q=${encodeURIComponent(companiesQuery)}&limit=20`);
                if (!active) return;
                const opts = (res.results || []).map(c => ({ value: c.id, label: c.name }));
                setCompaniesOptions(opts);
            } catch (e) { }
        };
        fetchCompanies();
        return () => { active = false; };
    }, [companiesQuery]);

    const respondToInvitation = async (invitationId, action) => {
        try {
            await apiRequest(`/team/recruiter/invitations/${invitationId}/respond/`, 'POST', { action });
            await refreshRecruiterInvitations();
            pushActivity({ type: action === 'accept' ? 'user_added' : 'invitation_received', user: { name: 'You' }, description: action === 'accept' ? 'accepted an invitation' : 'declined an invitation' });
            showToast(action === 'accept' ? 'Invitation accepted' : 'Invitation declined', 'success');
        } catch (e) {
            showToast(e.message || 'Failed to respond to invitation', 'error');
        }
    };

    const openViewCompany = async (companyId) => {
        try {
            const data = await apiRequest(`/auth/companies/${companyId}/`);
            setViewCompany(data);
            setIsCompanyModalOpen(true);
        } catch (e) {
            showToast(e?.message || 'Failed to load company details', 'error');
        }
    };

    const sendJoinRequest = async () => {
        if (!selectedCompanyId) return;
        try {
            await apiRequest('/team/recruiter/join-request/', 'POST', { company_id: selectedCompanyId, message: requestMessage });
            setSelectedCompanyId('');
            setRequestMessage('');
            await refreshRecruiterInvitations();
            pushActivity({ type: 'join_request', user: { name: 'You' }, description: 'requested to join a company', details: companiesOptions.find(o => o.value === selectedCompanyId)?.label || 'Company' });
            showToast('Join request sent', 'success');
        } catch (e) {
            const msg = e?.message || 'Failed to send join request';
            showToast(msg, 'error');
        }
    };

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Recruiter Team Management</h1>
                    <p className="text-muted-foreground">View company invitations, track your requests, and manage your current companies</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Your Invitations</h2>
                            <div className="space-y-3">
                                {recruiterInvitations.filter(inv => !inv.initiated_by || inv.initiated_by === 'company').length === 0 && (
                                    <p className="text-muted-foreground">No invitations yet.</p>
                                )}
                                {recruiterInvitations.filter(inv => !inv.initiated_by || inv.initiated_by === 'company').map((inv) => (
                                    <div key={inv.id} className="flex items-start justify-between p-4 border rounded-md hover:bg-muted/30">
                                        <div className="space-y-1">
                                            <div className="font-medium">{inv.company_name || 'Company'}</div>
                                            <div className="text-sm text-muted-foreground">Role: {backendToUiRole(inv.role)}</div>
                                            <div className="text-xs text-muted-foreground">Status: {inv.status}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => inv.company_id && openViewCompany(inv.company_id)}>
                                                View
                                            </Button>
                                            {inv.status === 'pending' && (
                                                <>
                                                    <Button size="sm" variant="outline" onClick={() => respondToInvitation(inv.id, 'decline')}>Decline</Button>
                                                    <Button size="sm" onClick={() => respondToInvitation(inv.id, 'accept')}>Accept</Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Request to Join a Company</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Select label="Select Company" options={companiesOptions} value={selectedCompanyId} onChange={setSelectedCompanyId} searchable placeholder="Search and choose company" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Message (optional)</label>
                                    <textarea value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} placeholder="Add a note for the company" className="w-full h-24 px-3 py-2 bg-background border border-border rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                                </div>
                            </div>
                            <div>
                                <Button disabled={!selectedCompanyId} onClick={sendJoinRequest} iconName="Send" iconPosition="left">Send Request</Button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="mb-6 p-4 border rounded-md">
                            <h3 className="font-semibold mb-2">Your Companies</h3>
                            {currentCompany && (
                                <div className="mb-3 text-sm">
                                    <div className="text-muted-foreground">Current</div>
                                    <div className="font-medium">{currentCompany.name}</div>
                                </div>
                            )}
                            <div className="space-y-2">
                                {(recruiterCompanies || []).filter(c => c.status === 'accepted').length === 0 && (
                                    <div className="text-sm text-muted-foreground">No active companies</div>
                                )}
                                {(recruiterCompanies || []).filter(c => c.status === 'accepted').map(c => (
                                    <div key={c.id} className="text-sm flex items-center justify-between gap-2">
                                        <span>{c.name}</span>
                                        <div className="flex items-center gap-2">
                                            {c.is_current && <span className="text-xs text-primary">current</span>}
                                            <Button size="xs" variant="outline" onClick={async () => {
                                                try {
                                                    await apiRequest('/team/recruiter/leave-company/', 'POST', { company_id: c.id });
                                                    showToast('Left company', 'success');
                                                    const companies = await apiRequest('/team/recruiter/companies/');
                                                    setRecruiterCompanies(Array.isArray(companies) ? companies : []);
                                                    try { const me = await apiRequest('/auth/profile/'); setCurrentCompany(me?.current_company || null); } catch (_) { }
                                                } catch (e) {
                                                    showToast(e?.message || 'Failed to leave company', 'error');
                                                }
                                            }}>Leave</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <div className="text-sm font-medium">Previous Companies</div>
                                {(recruiterCompanies || []).filter(c => c.status === 'removed').length === 0 ? (
                                    <div className="text-sm text-muted-foreground">None</div>
                                ) : (
                                    <div className="mt-2 space-y-1">
                                        {(recruiterCompanies || []).filter(c => c.status === 'removed').map(c => (
                                            <div key={c.id} className="text-xs text-muted-foreground flex items-center justify-between">
                                                <span>{c.name}</span>
                                                <span className="rounded px-1.5 py-0.5 bg-muted">past</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:sticky lg:top-4">
                            <ActivityFeed activities={recentActivities} />
                        </div>
                    </div>
                </div>

                {isCompanyModalOpen && viewCompany && (
                    <div className="fixed inset-0 z-modal bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50" onClick={() => setIsCompanyModalOpen(false)}>
                        <div className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border/30 dark:ring-white/10 bg-background animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between gap-3 p-4 border-b border-border/40 dark:border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
                                <div className="flex items-center gap-3 min-w-0">
                                    {viewCompany.logo_url && <img src={viewCompany.logo_url} alt={viewCompany.name} className="h-10 w-10 rounded-lg object-cover ring-1 ring-border/40 dark:ring-white/10" />}
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-semibold truncate text-foreground">{viewCompany.name}</h3>
                                        {viewCompany.website && <a href={viewCompany.website} target="_blank" rel="noreferrer" className="text-xs text-primary truncate inline-block">{viewCompany.website}</a>}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" iconName="X" onClick={() => setIsCompanyModalOpen(false)}>Close</Button>
                            </div>
                            <CompanyDetailsTabs company={viewCompany} />
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

function CompanyDetailsTabs({ company }) {
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
                <TabBtn id="locations">Locations</TabBtn>
                <TabBtn id="tech">Tech Stack</TabBtn>
                <TabBtn id="social">Social</TabBtn>
                <TabBtn id="all">All Fields</TabBtn>
            </div>
            <div className="mt-4 max-h-[60vh] overflow-auto pr-3 pb-6">
                {tab === 'overview' && (
                    <div className="space-y-3">
                        <KeyVal k="Industry" v={company.industry} />
                        <KeyVal k="Headquarters" v={company.headquarters} />
                        <KeyVal k="Website" v={company.website} />
                        <KeyVal k="Description" v={company.description} />
                    </div>
                )}
                {tab === 'contact' && (
                    <div className="space-y-1">
                        <KeyVal k="Contact Email" v={company.contact_email} />
                        <KeyVal k="Contact Phone" v={company.contact_phone} />
                        <KeyVal k="HR Contact Name" v={company.hr_contact_name} />
                        <KeyVal k="HR Contact Email" v={company.hr_contact_email} />
                    </div>
                )}
                {tab === 'locations' && (
                    <div>
                        {Array.isArray(company.locations) && company.locations.length ? (
                            <ul className="list-disc list-inside text-sm">
                                {company.locations.map((loc, i) => <li key={i}>{loc}</li>)}
                            </ul>
                        ) : <div className="text-sm text-muted-foreground">—</div>}
                    </div>
                )}
                {tab === 'tech' && (
                    <div>
                        {Array.isArray(company.tech_stack) && company.tech_stack.length ? (
                            <div className="flex flex-wrap gap-1">
                                {company.tech_stack.map((t, i) => <span key={i} className="px-2 py-0.5 rounded bg-muted text-xs">{t}</span>)}
                            </div>
                        ) : <div className="text-sm text-muted-foreground">—</div>}
                    </div>
                )}
                {tab === 'social' && (
                    <div className="space-y-1">
                        <KeyVal k="LinkedIn" v={company.linkedin_url} />
                        <KeyVal k="Twitter" v={company.twitter_url} />
                        <KeyVal k="Facebook" v={company.facebook_url} />
                        <KeyVal k="Glassdoor" v={company.glassdoor_url} />
                    </div>
                )}
                {tab === 'all' && (
                    <div className="space-y-2">
                        {Object.entries(company).map(([k, v]) => (
                            <KeyVal key={k} k={k} v={v} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
