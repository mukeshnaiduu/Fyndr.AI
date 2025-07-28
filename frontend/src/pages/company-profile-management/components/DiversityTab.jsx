import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const DiversityTab = ({ profile, onUpdate, isEditing, setIsEditing }) => {
  const handleSave = () => {
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
            value={profile?.dei_commitment || ''}
            placeholder="Describe your company's commitment to diversity, equity, and inclusion"
            readOnly={!isEditing}
          />
        </div>

        {/* D&I Initiatives */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            D&I Initiatives
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile?.diversity_initiatives?.map((initiative, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm flex items-center"
              >
                {initiative}
                {isEditing && (
                  <button className="ml-2 text-green-600 hover:text-green-800">
                    <Icon name="X" size={14} />
                  </button>
                )}
              </span>
            )) || <span className="text-gray-500">No D&I initiatives specified</span>}
          </div>
        </div>

        {/* Inclusive Hiring Practices */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Inclusive Hiring Practices
          </label>
          <textarea
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${!isEditing ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
            rows="3"
            value={profile?.inclusive_practices || ''}
            placeholder="Describe your inclusive hiring practices"
            readOnly={!isEditing}
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
              {profile?.gender_diversity || '50%'}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Icon name="Globe" size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm text-blue-800 dark:text-blue-300">Cultural Diversity</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-2">
              {profile?.cultural_diversity || '65%'}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Icon name="Award" size={20} className="text-purple-600 dark:text-purple-400 mr-2" />
              <span className="text-sm text-purple-800 dark:text-purple-300">Leadership Diversity</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-200 mt-2">
              {profile?.leadership_diversity || '40%'}
            </p>
          </div>
        </div>

        {/* D&I Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Diversity Goals for 2024
          </label>
          <div className="space-y-3">
            {(profile?.diversity_goals || [
              'Increase leadership diversity to 50%',
              'Implement bias training for all hiring managers',
              'Partner with diverse professional organizations'
            ]).map((goal, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Icon name="Target" size={16} className="text-primary mt-0.5" />
                <span className="text-sm text-gray-900 dark:text-gray-100">{goal}</span>
                {isEditing && (
                  <button className="text-red-500 hover:text-red-700 ml-auto">
                    <Icon name="Trash2" size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <button className="mt-3 px-4 py-2 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Icon name="Plus" size={16} className="mr-2" />
              Add Goal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { DiversityTab };
