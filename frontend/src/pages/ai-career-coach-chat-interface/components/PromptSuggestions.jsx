import React, { useEffect, useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import { apiRequest } from 'utils/api.js';

const PromptSuggestions = ({ onSelectPrompt, onAnalyzeResume, visible = true }) => {
  const [profile, setProfile] = useState(null);
  const [hasResume, setHasResume] = useState(false);
  const [primarySkill, setPrimarySkill] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const res = await apiRequest('/auth/profile/');
        if (!mounted) return;
        setProfile(res?.profile || null);
        const p = res?.profile || {};
        const resumePresent = Boolean(p?.resume_filename || p?.resume_size);
        setHasResume(resumePresent);
        const skills = Array.isArray(p?.skills) ? p.skills : [];
        const firstSkill = skills && skills.length > 0 ? (typeof skills[0] === 'string' ? skills[0] : (skills[0]?.name || '')) : '';
        setPrimarySkill(firstSkill);
      } catch (e) {
        // likely guest/not logged-in; keep defaults
      }
    };
    loadProfile();
    return () => { mounted = false; };
  }, []);

  const suggestions = [
    // Dynamic quick action for resume analysis if resume exists
    ...(hasResume ? [{ id: 'analyze_resume', text: 'Analyze my uploaded resume', icon: 'FileText', category: 'resume', action: 'parse_resume' }] : []),
    { id: 2, text: 'Find relevant jobs', icon: 'Search', category: 'jobs' },
    { id: 3, text: primarySkill ? `Improve my ${primarySkill}` : 'Improve my skills', icon: 'TrendingUp', category: 'skills' },
    { id: 4, text: 'Interview preparation', icon: 'MessageSquare', category: 'interview' },
    { id: 5, text: 'Career path guidance', icon: 'Map', category: 'career' },
    { id: 6, text: 'Salary negotiation tips', icon: 'DollarSign', category: 'salary' },
    { id: 7, text: 'Network building advice', icon: 'Users', category: 'networking' },
    { id: 8, text: 'Work-life balance', icon: 'Scale', category: 'balance' },
  ];

  if (!visible) return null;

  return (
    <div className="px-5 py-3 border-b border-white/10">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            variant="outline"
            size="sm"
            onClick={() => {
              if (suggestion.action === 'parse_resume' && onAnalyzeResume) {
                onAnalyzeResume();
              } else {
                onSelectPrompt(suggestion.text);
              }
            }}
            className="flex items-center space-x-2 text-xs hover:scale-[1.02] transition-all duration-200"
          >
            <Icon name={suggestion.icon} size={14} />
            <span>{suggestion.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;
