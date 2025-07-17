import React from 'react';
import Icon from 'components/AppIcon';

const SkillsMatch = ({ requiredSkills, userSkills }) => {
  const getSkillMatchStatus = (skill) => {
    const userSkill = userSkills.find(us => us.name.toLowerCase() === skill.name.toLowerCase());
    if (!userSkill) return 'missing';
    if (userSkill.level >= skill.level) return 'strong';
    return 'partial';
  };

  const getSkillIcon = (status) => {
    switch (status) {
      case 'strong':
        return <Icon name="CheckCircle" size={16} className="text-success" />;
      case 'partial':
        return <Icon name="AlertCircle" size={16} className="text-warning" />;
      case 'missing':
        return <Icon name="XCircle" size={16} className="text-error" />;
      default:
        return null;
    }
  };

  const getSkillBadgeClass = (status) => {
    switch (status) {
      case 'strong':
        return 'bg-success/10 text-success border-success/20';
      case 'partial':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'missing':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const skillStats = {
    strong: requiredSkills.filter(skill => getSkillMatchStatus(skill) === 'strong').length,
    partial: requiredSkills.filter(skill => getSkillMatchStatus(skill) === 'partial').length,
    missing: requiredSkills.filter(skill => getSkillMatchStatus(skill) === 'missing').length
  };

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          Skills Analysis
        </h3>
        <div className="flex items-center space-x-1">
          <Icon name="Target" size={16} className="text-accent" />
          <span className="text-sm text-accent font-medium">
            {skillStats.strong + skillStats.partial}/{requiredSkills.length} Match
          </span>
        </div>
      </div>

      {/* Skills Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-success/10 rounded-card flex items-center justify-center mx-auto mb-2">
            <Icon name="CheckCircle" size={20} className="text-success" />
          </div>
          <div className="text-lg font-semibold text-success">{skillStats.strong}</div>
          <div className="text-xs text-muted-foreground">Strong Match</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-warning/10 rounded-card flex items-center justify-center mx-auto mb-2">
            <Icon name="AlertCircle" size={20} className="text-warning" />
          </div>
          <div className="text-lg font-semibold text-warning">{skillStats.partial}</div>
          <div className="text-xs text-muted-foreground">Partial Match</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-error/10 rounded-card flex items-center justify-center mx-auto mb-2">
            <Icon name="XCircle" size={20} className="text-error" />
          </div>
          <div className="text-lg font-semibold text-error">{skillStats.missing}</div>
          <div className="text-xs text-muted-foreground">Skill Gap</div>
        </div>
      </div>

      {/* Skills List */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground mb-3">Required Skills</h4>
        <div className="flex flex-wrap gap-2">
          {requiredSkills.map((skill, index) => {
            const status = getSkillMatchStatus(skill);
            return (
              <div
                key={index}
                className={`flex items-center space-x-2 px-3 py-2 rounded-card border text-sm ${getSkillBadgeClass(status)}`}
              >
                {getSkillIcon(status)}
                <span className="font-medium">{skill.name}</span>
                <span className="text-xs opacity-75">
                  {skill.level}/5
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Gap Analysis */}
      {skillStats.missing > 0 && (
        <div className="mt-6 p-4 bg-error/5 border border-error/20 rounded-card">
          <div className="flex items-start space-x-3">
            <Icon name="TrendingUp" size={16} className="text-error mt-0.5" />
            <div>
              <h5 className="font-medium text-error mb-1">Skill Development Opportunity</h5>
              <p className="text-sm text-muted-foreground">
                Consider developing the missing skills to increase your match percentage. 
                We recommend focusing on the most critical skills first.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsMatch;
