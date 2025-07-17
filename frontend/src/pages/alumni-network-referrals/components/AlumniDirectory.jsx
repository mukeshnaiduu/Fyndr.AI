import React, { useState, useMemo } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

const AlumniDirectory = ({ onProfileClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const alumniData = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Senior Product Manager',
      company: 'Google',
      location: 'Mountain View, CA',
      graduationYear: '2018',
      industry: 'Technology',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      isVerified: true,
      connections: 245,
      mutualConnections: 12,
      skills: ['Product Management', 'Strategy', 'Analytics'],
      bio: 'Passionate about building products that make a difference. Always happy to help fellow alumni!'
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Software Engineering Manager',
      company: 'Microsoft',
      location: 'Seattle, WA',
      graduationYear: '2016',
      industry: 'Technology',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isOnline: false,
      isVerified: true,
      connections: 189,
      mutualConnections: 8,
      skills: ['Engineering Management', 'React', 'Node.js'],
      bio: 'Leading engineering teams to build scalable solutions. Open to mentoring and referrals.'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      title: 'UX Design Lead',
      company: 'Airbnb',
      location: 'San Francisco, CA',
      graduationYear: '2019',
      industry: 'Technology',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      isVerified: false,
      connections: 156,
      mutualConnections: 15,
      skills: ['UX Design', 'Prototyping', 'User Research'],
      bio: 'Creating delightful user experiences. Love connecting with fellow designers and alumni.'
    },
    {
      id: 4,
      name: 'David Kim',
      title: 'Investment Banking Analyst',
      company: 'Goldman Sachs',
      location: 'New York, NY',
      graduationYear: '2020',
      industry: 'Finance',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isOnline: false,
      isVerified: true,
      connections: 98,
      mutualConnections: 6,
      skills: ['Financial Analysis', 'Modeling', 'M&A'],
      bio: 'Passionate about finance and helping students break into investment banking.'
    },
    {
      id: 5,
      name: 'Lisa Wang',
      title: 'Marketing Director',
      company: 'Netflix',
      location: 'Los Angeles, CA',
      graduationYear: '2017',
      industry: 'Entertainment',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      isVerified: true,
      connections: 234,
      mutualConnections: 18,
      skills: ['Digital Marketing', 'Brand Strategy', 'Content'],
      bio: 'Building brands that resonate with audiences. Always excited to share marketing insights.'
    },
    {
      id: 6,
      name: 'James Thompson',
      title: 'Data Scientist',
      company: 'Tesla',
      location: 'Austin, TX',
      graduationYear: '2019',
      industry: 'Automotive',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isOnline: false,
      isVerified: false,
      connections: 167,
      mutualConnections: 9,
      skills: ['Machine Learning', 'Python', 'Statistics'],
      bio: 'Using data to drive innovation in sustainable transportation. Happy to discuss ML opportunities.'
    }
  ];

  const companyOptions = [
    { value: '', label: 'All Companies' },
    { value: 'Google', label: 'Google' },
    { value: 'Microsoft', label: 'Microsoft' },
    { value: 'Airbnb', label: 'Airbnb' },
    { value: 'Goldman Sachs', label: 'Goldman Sachs' },
    { value: 'Netflix', label: 'Netflix' },
    { value: 'Tesla', label: 'Tesla' }
  ];

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'Mountain View, CA', label: 'Mountain View, CA' },
    { value: 'Seattle, WA', label: 'Seattle, WA' },
    { value: 'San Francisco, CA', label: 'San Francisco, CA' },
    { value: 'New York, NY', label: 'New York, NY' },
    { value: 'Los Angeles, CA', label: 'Los Angeles, CA' },
    { value: 'Austin, TX', label: 'Austin, TX' }
  ];

  const yearOptions = [
    { value: '', label: 'All Years' },
    { value: '2016', label: '2016' },
    { value: '2017', label: '2017' },
    { value: '2018', label: '2018' },
    { value: '2019', label: '2019' },
    { value: '2020', label: '2020' }
  ];

  const industryOptions = [
    { value: '', label: 'All Industries' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Automotive', label: 'Automotive' }
  ];

  const filteredAlumni = useMemo(() => {
    return alumniData.filter(alumni => {
      const matchesSearch = alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alumni.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alumni.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCompany = !selectedCompany || alumni.company === selectedCompany;
      const matchesLocation = !selectedLocation || alumni.location === selectedLocation;
      const matchesYear = !selectedYear || alumni.graduationYear === selectedYear;
      const matchesIndustry = !selectedIndustry || alumni.industry === selectedIndustry;

      return matchesSearch && matchesCompany && matchesLocation && matchesYear && matchesIndustry;
    });
  }, [searchQuery, selectedCompany, selectedLocation, selectedYear, selectedIndustry]);

  const AlumniCard = ({ alumni }) => (
    <div className="glassmorphic rounded-xl p-6 hover:shadow-elevation-3 transition-spring">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <Image
            src={alumni.avatar}
            alt={alumni.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          {alumni.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-foreground">{alumni.name}</h3>
            {alumni.isVerified && (
              <Icon name="CheckCircle" size={16} className="text-blue-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">{alumni.title}</p>
          <p className="text-sm text-muted-foreground mb-2">{alumni.company}</p>
          
          <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center space-x-1">
              <Icon name="MapPin" size={12} />
              <span>{alumni.location}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Icon name="GraduationCap" size={12} />
              <span>Class of {alumni.graduationYear}</span>
            </span>
          </div>
          
          <p className="text-sm text-foreground mb-3 line-clamp-2">{alumni.bio}</p>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {alumni.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>{alumni.connections} connections</span>
              <span>{alumni.mutualConnections} mutual</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onProfileClick(alumni)}
              >
                View Profile
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="MessageCircle" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AlumniListItem = ({ alumni }) => (
    <div className="glassmorphic rounded-lg p-4 hover:shadow-elevation-2 transition-spring">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Image
            src={alumni.avatar}
            alt={alumni.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {alumni.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-foreground">{alumni.name}</h3>
            {alumni.isVerified && (
              <Icon name="CheckCircle" size={14} className="text-blue-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{alumni.title} at {alumni.company}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">{alumni.mutualConnections} mutual</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onProfileClick(alumni)}
          >
            Connect
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="glassmorphic rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Alumni Directory</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Icon name="Grid3X3" size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <Icon name="List" size={16} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <Input
            type="search"
            placeholder="Search alumni by name, title, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              placeholder="Company"
              options={companyOptions}
              value={selectedCompany}
              onChange={setSelectedCompany}
            />
            <Select
              placeholder="Location"
              options={locationOptions}
              value={selectedLocation}
              onChange={setSelectedLocation}
            />
            <Select
              placeholder="Graduation Year"
              options={yearOptions}
              value={selectedYear}
              onChange={setSelectedYear}
            />
            <Select
              placeholder="Industry"
              options={industryOptions}
              value={selectedIndustry}
              onChange={setSelectedIndustry}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="glassmorphic rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {filteredAlumni.length} alumni found
          </p>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-2" />
            Export
          </Button>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAlumni.map(alumni => (
              <AlumniCard key={alumni.id} alumni={alumni} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlumni.map(alumni => (
              <AlumniListItem key={alumni.id} alumni={alumni} />
            ))}
          </div>
        )}
        
        {filteredAlumni.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No alumni found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDirectory;
