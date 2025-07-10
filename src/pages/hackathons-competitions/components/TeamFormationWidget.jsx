import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

const TeamFormationWidget = ({ hackathonId, onTeamAction }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const skillOptions = [
    { value: 'react', label: 'React' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'ui-ux', label: 'UI/UX Design' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'mobile-dev', label: 'Mobile Development' },
    { value: 'devops', label: 'DevOps' }
  ];

  const availableTeams = [
    {
      id: 1,
      name: "AI Innovators",
      description: "Building next-gen AI solutions for healthcare",
      leader: "Sarah Chen",
      leaderAvatar: "https://images.unsplash.com/photo-1494790108755-2616b9c5e8b8?w=150",
      members: 3,
      maxMembers: 5,
      skills: ["Python", "Machine Learning", "React"],
      lookingFor: ["UI/UX Designer", "Backend Developer"],
      isOpen: true
    },
    {
      id: 2,
      name: "Blockchain Builders",
      description: "Decentralized finance platform for micro-investments",
      leader: "Alex Rodriguez",
      leaderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      members: 2,
      maxMembers: 4,
      skills: ["Blockchain", "Solidity", "React"],
      lookingFor: ["Frontend Developer", "Smart Contract Developer"],
      isOpen: true
    },
    {
      id: 3,
      name: "EcoTech Solutions",
      description: "Sustainable technology for environmental monitoring",
      leader: "Maya Patel",
      leaderAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      members: 4,
      maxMembers: 5,
      skills: ["IoT", "Python", "Data Science"],
      lookingFor: ["Mobile Developer"],
      isOpen: true
    }
  ];

  const myTeam = {
    id: 4,
    name: "Code Crusaders",
    description: "Full-stack web application for social impact",
    members: [
      {
        id: 1,
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        role: "Team Leader",
        skills: ["React", "Node.js"],
        status: "online"
      },
      {
        id: 2,
        name: "Emma Wilson",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
        role: "UI/UX Designer",
        skills: ["Figma", "Design Systems"],
        status: "online"
      },
      {
        id: 3,
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        role: "Backend Developer",
        skills: ["Python", "PostgreSQL"],
        status: "away"
      }
    ],
    maxMembers: 5,
    lookingFor: ["Mobile Developer", "DevOps Engineer"]
  };

  const handleCreateTeam = () => {
    if (teamName.trim()) {
      onTeamAction('create', {
        name: teamName,
        description: teamDescription,
        skills: selectedSkills,
        hackathonId
      });
      setTeamName('');
      setTeamDescription('');
      setSelectedSkills([]);
    }
  };

  const handleJoinTeam = (teamId) => {
    onTeamAction('join', { teamId, hackathonId });
  };

  const handleInviteMember = (email) => {
    onTeamAction('invite', { email, teamId: myTeam.id });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-success';
      case 'away': return 'bg-warning';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const filteredTeams = availableTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="glassmorphic rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Team Formation</h2>
        <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-spring ${
              activeTab === 'create' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Team
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-spring ${
              activeTab === 'join' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Join Team
          </button>
          <button
            onClick={() => setActiveTab('my-team')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-spring ${
              activeTab === 'my-team' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Team
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="space-y-4">
          <Input
            label="Team Name"
            type="text"
            placeholder="Enter your team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
          
          <Input
            label="Team Description"
            type="text"
            placeholder="Describe your project idea and goals"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
          />

          <Select
            label="Required Skills"
            options={skillOptions}
            value={selectedSkills}
            onChange={setSelectedSkills}
            multiple
            searchable
            placeholder="Select skills needed for your team"
          />

          <Button
            variant="default"
            onClick={handleCreateTeam}
            disabled={!teamName.trim()}
            className="w-full"
          >
            Create Team
          </Button>
        </div>
      )}

      {activeTab === 'join' && (
        <div className="space-y-4">
          <Input
            type="search"
            placeholder="Search teams by name, description, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTeams.map((team) => (
              <div key={team.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={team.leaderAvatar}
                      alt={team.leader}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium text-foreground">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">Led by {team.leader}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Icon name="Users" size={14} />
                      <span>{team.members}/{team.maxMembers}</span>
                    </div>
                    {team.isOpen && (
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{team.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {team.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Looking for:</p>
                    <p className="text-sm text-foreground">{team.lookingFor.join(', ')}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={!team.isOpen}
                  >
                    {team.isOpen ? 'Request to Join' : 'Team Full'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'my-team' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">{myTeam.name}</h3>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Icon name="Users" size={14} />
                <span>{myTeam.members.length}/{myTeam.maxMembers}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{myTeam.description}</p>

            <div className="space-y-3">
              {myTeam.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(member.status)}`}></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 2).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {myTeam.members.length < myTeam.maxMembers && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-muted-foreground mb-2">Still looking for:</p>
                <p className="text-sm text-foreground mb-3">{myTeam.lookingFor.join(', ')}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInviteMember('')}
                  className="w-full"
                >
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Invite Member
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamFormationWidget;
