/**
 * Integration utilities for helping with the seamless merging of components
 * from different repositories.
 */

/**
 * Helps create consistent class names from props
 * @param {string} baseClass - The base class name 
 * @param {Object} props - Props that may contain className
 * @returns {string} Combined class names
 */
export const classNameHelper = (baseClass, props) => {
  return props.className ? `${baseClass} ${props.className}` : baseClass;
};

/**
 * Normalizes data structures from different repositories
 * @param {Object} data - The data to normalize
 * @param {Object} mapping - Mapping of field names
 * @returns {Object} Normalized data
 */
export const normalizeData = (data, mapping) => {
  if (!data || !mapping) return data;
  
  const result = {};
  Object.keys(mapping).forEach(key => {
    if (data[key] !== undefined) {
      result[mapping[key]] = data[key];
    } else if (data[mapping[key]] !== undefined) {
      result[mapping[key]] = data[mapping[key]];
    }
  });
  
  return { ...data, ...result };
};

/**
 * Helper function to manage consistent styling between repositories
 * @param {string} componentType - Type of component
 * @returns {Object} Styling properties
 */
export const getIntegratedStyles = (componentType) => {
  // Provides consistent styling for components across repos
  const styles = {
    'button': {
      base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
      primary: 'bg-primary text-white hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    },
    'card': {
      base: 'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
      interactive: 'transition-all hover:shadow-md cursor-pointer',
      glassmorphic: 'backdrop-blur-md bg-white/10 border border-white/20',
    },
    'input': {
      base: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
    },
    'form': {
      group: 'space-y-2 mb-4',
      label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    }
  };

  return styles[componentType] || {};
};

/**
 * Helper to check if a component is from a specific repository
 * @param {string} componentName - Name of the component 
 * @returns {string|null} Repository identifier or null if unknown
 */
export const getComponentRepository = (componentName) => {
  // Map of component prefixes to repositories
  const repoMap = {
    'A': ['App', 'Auth', 'Video', 'Profile'],
    'B': ['Job', 'Resume', 'Feed', 'Team'],
    'C': ['Career', 'Learn', 'Pipeline', 'Candidate'],
    'D': ['Interview', 'Resource', 'Alumni', 'Mentorship']
  };
  
  for (const [repo, prefixes] of Object.entries(repoMap)) {
    if (prefixes.some(prefix => componentName.startsWith(prefix))) {
      return repo;
    }
  }
  
  return null;
};
