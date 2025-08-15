import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const DiversityTab = ({ profile, onUpdate, isEditing, setIsEditing }) => {
  const [form, setForm] = useState({
    dei_commitment: '',
    diversity_initiatives: [],
    inclusive_practices: '',
    gender_diversity: '',
    cultural_diversity: '',
    leadership_diversity: '',
    diversity_goals: [],
  });

  useEffect(() => {
    setForm({
      dei_commitment: profile?.dei_commitment || '',
      diversity_initiatives: Array.isArray(profile?.diversity_initiatives) ? profile.diversity_initiatives : [],
      inclusive_practices: profile?.inclusive_practices || '',
      gender_diversity: profile?.gender_diversity || '',
      cultural_diversity: profile?.cultural_diversity || '',
      leadership_diversity: profile?.leadership_diversity || '',
      diversity_goals: Array.isArray(profile?.diversity_goals) ? profile.diversity_goals : [],
    });
  }, [profile]);

  const [newInitiative, setNewInitiative] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const handleSave = () => {
    onUpdate({ ...form });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Diversity & Inclusion</h3>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          {isEditing ? 'Save Changes' : 'Edit'}
        </button>
      </div>

      <div className="space-y-6">
        {/* D&I Commitment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            D&I Commitment Statement
          </label>
          <textarea
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
            rows="4"
            value={form.dei_commitment}
            placeholder="Describe your company's commitment to diversity, equity, and inclusion"
            readOnly={!isEditing}
            onChange={(e) => setForm({ ...form, dei_commitment: e.target.value })}
          />
        </div>

        {/* D&I Initiatives */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            D&I Initiatives
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.diversity_initiatives.map((initiative, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm flex items-center"
              >
                {initiative}
                {isEditing && (
                  <button className="ml-2 text-green-600 hover:text-green-800" onClick={() => setForm({ ...form, diversity_initiatives: form.diversity_initiatives.filter((_, i) => i !== index) })}>
                    <Icon name="X" size={14} />
                  </button>
                )}
              </span>
            ))}
            {!form.diversity_initiatives.length && <span className="text-gray-500">No D&I initiatives specified</span>}
          </div>
          {isEditing && (
            <div className="flex gap-2 mt-2">
              <Input value={newInitiative} placeholder="Add initiative" onChange={(e) => setNewInitiative(e.target.value)} />
              <button className="px-3 py-2 text-sm border rounded-md" onClick={() => {
                if (newInitiative.trim()) {
                  setForm({ ...form, diversity_initiatives: [...form.diversity_initiatives, newInitiative.trim()] });
                  setNewInitiative('');
                }
              }}>Add</button>
            </div>
          )}
        </div>

        {/* Inclusive Hiring Practices */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Inclusive Hiring Practices
          </label>
          <textarea
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
            rows="3"
            value={form.inclusive_practices}
            placeholder="Describe your inclusive hiring practices"
            readOnly={!isEditing}
            onChange={(e) => setForm({ ...form, inclusive_practices: e.target.value })}
          />
        </div>

        {/* Diversity Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Icon name="Users" size={20} className="text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm text-green-800 dark:text-green-300">Gender Diversity</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-200 mt-2">
              {form.gender_diversity || '50%'}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Icon name="Globe" size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm text-blue-800 dark:text-blue-300">Cultural Diversity</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-2">
              {form.cultural_diversity || '65%'}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Icon name="Award" size={20} className="text-purple-600 dark:text-purple-400 mr-2" />
              <span className="text-sm text-purple-800 dark:text-purple-300">Leadership Diversity</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-200 mt-2">
              {form.leadership_diversity || '40%'}
            </p>
          </div>
        </div>

        {/* D&I Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Diversity Goals for 2024
          </label>
          <div className="space-y-3">
            {(form.diversity_goals.length ? form.diversity_goals : [
              'Increase leadership diversity to 50%',
              'Implement bias training for all hiring managers',
              'Partner with diverse professional organizations'
            ]).map((goal, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Icon name="Target" size={16} className="text-primary mt-0.5" />
                <span className="text-sm text-gray-900 dark:text-gray-100">{goal}</span>
                {isEditing && (
                  <button className="text-red-500 hover:text-red-700 ml-auto" onClick={() => setForm({ ...form, diversity_goals: form.diversity_goals.filter((_, i) => i !== index) })}>
                    <Icon name="Trash2" size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2 mt-3">
              <Input value={newGoal} placeholder="Add goal" onChange={(e) => setNewGoal(e.target.value)} />
              <button className="px-3 py-2 text-sm border rounded-md" onClick={() => {
                if (newGoal.trim()) {
                  setForm({ ...form, diversity_goals: [...form.diversity_goals, newGoal.trim()] });
                  setNewGoal('');
                }
              }}>
                <Icon name="Plus" size={16} className="mr-2" />
                Add Goal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { DiversityTab };
