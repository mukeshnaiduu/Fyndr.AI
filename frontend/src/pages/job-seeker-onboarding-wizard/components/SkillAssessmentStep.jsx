import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import { fetchSkills } from 'services/skillsService';

const SkillAssessmentStep = ({ data, onUpdate, onNext, onPrev }) => {
  const [selectedSkills, setSelectedSkills] = useState(data.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Popular skills from DB (top by popularity); used as quick-pick chips
  // Shape: [{ name, category }]
  const [popularSkills, setPopularSkills] = useState([]);

  useEffect(() => {
    // Preload popular skills (no query) from DB; fallback is empty
    (async () => {
      try {
        const results = await fetchSkills('');
        // Take top N popular; keep name+category
        setPopularSkills((results || []).slice(0, 18).map(s => ({ name: s.name, category: s.category })));
      } catch { }
    })();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);

    if (value.length > 0) {
      // Try DB-backed suggestions first; fallback to static list on error
      (async () => {
        try {
          const results = await fetchSkills(value);
          // Keep name+category; filter out already selected
          const filtered = results
            .filter(r => !selectedSkills.find(s => s.name === r.name))
            .map(r => ({ name: r.name, category: r.category }));
          setSuggestions(filtered.slice(0, 8));
          setShowSuggestions(true);
        } catch (e) {
          // Fallback: show a filtered slice of popularSkills
          const filtered = popularSkills.filter(item =>
            item.name.toLowerCase().includes(value.toLowerCase()) &&
            !selectedSkills.find(s => s.name === item.name)
          );
          setSuggestions(filtered.slice(0, 8));
          setShowSuggestions(true);
        }
      })();
    } else {
      setShowSuggestions(false);
    }
  };

  const addSkill = (skillName, proficiency = 'intermediate', category = 'Other') => {
    if (!selectedSkills.find(s => s.name === skillName)) {
      const newSkill = {
        id: Date.now(),
        name: skillName,
        proficiency,
        category
      };
      setSelectedSkills(prev => [...prev, newSkill]);
    }
    setSkillInput('');
    setShowSuggestions(false);
  };

  const getSkillCategory = () => 'Other';

  const removeSkill = (skillId) => {
    setSelectedSkills(prev => prev.filter(s => s.id !== skillId));
  };

  const updateSkillProficiency = (skillId, proficiency) => {
    setSelectedSkills(prev =>
      prev.map(skill =>
        skill.id === skillId ? { ...skill, proficiency } : skill
      )
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput.trim());
    }
  };

  const getProficiencyColor = (proficiency) => {
    switch (proficiency) {
      case 'beginner': return 'text-warning';
      case 'intermediate': return 'text-accent';
      case 'advanced': return 'text-success';
      case 'expert': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getProficiencyBg = (proficiency) => {
    switch (proficiency) {
      case 'beginner': return 'bg-warning/10 border-warning/20';
      case 'intermediate': return 'bg-accent/10 border-accent/20';
      case 'advanced': return 'bg-success/10 border-success/20';
      case 'expert': return 'bg-primary/10 border-primary/20';
      default: return 'bg-muted border-border';
    }
  };

  const handleNext = () => {
    onUpdate({ skills: selectedSkills });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          What are your key skills?
        </h2>
        <p className="text-muted-foreground">
          Add your technical and professional skills to help us match you with the right opportunities
        </p>
      </div>

      {/* Skill Input */}
      <div className="relative max-w-2xl mx-auto" ref={inputRef}>
        <div className="relative">
          <Input
            label="Add Skills"
            type="text"
            placeholder="Type a skill and press Enter (e.g., JavaScript, React, Python)"
            value={skillInput}
            onChange={handleSkillInputChange}
            onKeyPress={handleKeyPress}
            description={`${selectedSkills.length} skills added`}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skillInput.trim() && addSkill(skillInput.trim())}
            className="absolute right-2 top-8"
            iconName="Plus"
          >
            Add
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 glass-card border border-glass-border rounded-card shadow-glass max-h-64 overflow-y-auto z-50"
            >
              {suggestions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => addSkill(item.name, 'intermediate', item.category || 'Other')}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted transition-colors first:rounded-t-card last:rounded-b-card"
                >
                  <div className="flex items-center space-x-3">
                    <Icon name="Zap" size={16} className="text-accent" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.category || 'Other'}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Skills */}
      <div className="max-w-4xl mx-auto">
        {selectedSkills.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Your Skills ({selectedSkills.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {selectedSkills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-4 rounded-card border ${getProficiencyBg(skill.proficiency)} transition-all duration-300 hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{skill.name}</h4>
                        <p className="text-xs text-muted-foreground">{skill.category}</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(skill.id)}
                        iconName="X"
                        className="text-muted-foreground hover:text-error"
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Proficiency Level</p>
                      <div className="flex space-x-1">
                        {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                          <button
                            key={level}
                            onClick={() => updateSkillProficiency(skill.id, level)}
                            className={`px-2 py-1 text-xs rounded transition-all duration-200 ${skill.proficiency === level
                                ? `${getProficiencyColor(level)} bg-current/10 border border-current/20`
                                : 'text-muted-foreground hover:text-foreground bg-muted/50'
                              }`}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Popular Skills */}
        {selectedSkills.length < 5 && popularSkills.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Popular Skills
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  {popularSkills.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => addSkill(item.name, 'intermediate', item.category || 'Other')}
                      disabled={selectedSkills.find(s => s.name === item.name)}
                      className={`px-3 py-1.5 text-sm rounded-card border transition-all duration-200 ${selectedSkills.find(s => s.name === item.name)
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-background border-border hover:border-primary hover:text-primary hover:bg-primary/5'
                        }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Minimum Skills Warning */}
      {selectedSkills.length < 3 && (
        <div className="max-w-2xl mx-auto p-4 bg-warning/10 border border-warning/20 rounded-card flex items-center space-x-2">
          <Icon name="AlertTriangle" size={16} className="text-warning" />
          <p className="text-sm text-warning">
            Add at least 3 skills to get better job matches
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrev}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={selectedSkills.length === 0}
          iconName="ArrowRight"
          iconPosition="right"
          size="lg"
          className="font-semibold"
        >
          Next Step
        </Button>
      </div>
    </motion.div>
  );
};

export default SkillAssessmentStep;
