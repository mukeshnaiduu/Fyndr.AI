import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Image from 'components/AppImage';

const CandidateTable = () => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [candidates] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9d3c133?w=150',
      position: 'Senior Frontend Developer',
      stage: 'Interview',
      score: 92,
      experience: '5 years',
      location: 'New York, NY',
      skills: ['React', 'TypeScript', 'Node.js'],
      appliedDate: '2025-01-05',
      status: 'active'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      position: 'Full Stack Developer',
      stage: 'Technical',
      score: 88,
      experience: '4 years',
      location: 'San Francisco, CA',
      skills: ['Vue.js', 'Python', 'PostgreSQL'],
      appliedDate: '2025-01-04',
      status: 'active'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      position: 'Backend Developer',
      stage: 'Final',
      score: 95,
      experience: '6 years',
      location: 'Austin, TX',
      skills: ['Java', 'Spring Boot', 'AWS'],
      appliedDate: '2025-01-03',
      status: 'active'
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@email.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      position: 'DevOps Engineer',
      stage: 'Screening',
      score: 85,
      experience: '3 years',
      location: 'Seattle, WA',
      skills: ['Docker', 'Kubernetes', 'Jenkins'],
      appliedDate: '2025-01-02',
      status: 'active'
    },
    {
      id: 5,
      name: 'Lisa Wang',
      email: 'lisa.wang@email.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      position: 'UI/UX Designer',
      stage: 'Interview',
      score: 90,
      experience: '4 years',
      location: 'Los Angeles, CA',
      skills: ['Figma', 'Adobe XD', 'Prototyping'],
      appliedDate: '2025-01-01',
      status: 'active'
    }
  ]);

  const getStageColor = (stage) => {
    const colors = {
      'Applied': 'bg-blue-500/20 text-blue-400',
      'Screening': 'bg-yellow-500/20 text-yellow-400',
      'Interview': 'bg-orange-500/20 text-orange-400',
      'Technical': 'bg-purple-500/20 text-purple-400',
      'Final': 'bg-green-500/20 text-green-400',
      'Offer': 'bg-emerald-500/20 text-emerald-400'
    };
    return colors[stage] || 'bg-gray-500/20 text-gray-400';
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

  return (
    <div className="glassmorphic-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Candidates</h2>
        
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
            {candidates.map((candidate) => (
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
                    <Image
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-foreground">{candidate.name}</div>
                      <div className="text-sm text-muted-foreground">{candidate.email}</div>
                      <div className="text-xs text-muted-foreground">{candidate.location}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-sm text-foreground">{candidate.position}</div>
                  <div className="text-xs text-muted-foreground">{candidate.experience}</div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}>
                    {candidate.stage}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-lg font-bold ${getScoreColor(candidate.score)}`}>
                    {candidate.score}%
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 2).map((skill) => (
                      <span 
                        key={skill}
                        className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 2 && (
                      <span className="px-2 py-1 bg-muted/20 text-muted-foreground text-xs rounded-full">
                        +{candidate.skills.length - 2}
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
        <div className="text-sm text-muted-foreground">
          Showing {candidates.length} of {candidates.length} candidates
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="ChevronLeft" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" iconName="ChevronRight" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateTable;
