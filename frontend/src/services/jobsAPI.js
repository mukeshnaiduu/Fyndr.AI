// API configuration
import tokenManager from '../utils/tokenManager.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

class JobsAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.retryAttempts = new Map(); // Track retry attempts per URL to prevent infinite loops
    this.maxRetries = 1; // Maximum retry attempts per request
    this.cooldowns = new Map(); // Track cooldown periods for URLs to prevent rapid requests
    this.cooldownTime = 1000; // 1 second cooldown between identical requests (reduced from 2s)
  }

  // Helper method to build API URLs correctly
  buildApiUrl(endpoint) {
    // Ensure endpoint starts with /
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }

    // Simple URL construction - always use baseURL + endpoint
    const cleanBaseUrl = this.baseURL.replace(/\/+$/, ''); // Remove trailing slashes
    const cleanEndpoint = endpoint.replace(/^\/+/, '/'); // Ensure single leading slash

    // If baseURL already contains /api, don't add it again
    if (cleanBaseUrl.endsWith('/api')) {
      return `${cleanBaseUrl}${cleanEndpoint}`;
    } else {
      return `${cleanBaseUrl}/api${cleanEndpoint}`;
    }
  }

  // Helper method to get auth headers with proper token management
  async getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    // Get valid token using token manager
    if (tokenManager.isAuthenticated()) {
      try {
        const token = await tokenManager.getValidAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get valid access token:', error.message);
        // Continue without auth header - let the request proceed for public endpoints
      }
    }

    return headers;
  }

  // Helper method to check if we should retry a request
  shouldRetry(url, statusCode) {
    const retryKey = `${url}_${statusCode}`;
    const currentAttempts = this.retryAttempts.get(retryKey) || 0;

    if (currentAttempts >= this.maxRetries) {
      console.warn(`🚫 Maximum retry attempts (${this.maxRetries}) reached for ${url}`);
      return false;
    }

    this.retryAttempts.set(retryKey, currentAttempts + 1);
    return true;
  }

  // Helper method to check cooldown and prevent rapid requests
  shouldMakeRequest(url) {
    const lastRequestTime = this.cooldowns.get(url);
    const now = Date.now();

    if (lastRequestTime && (now - lastRequestTime) < this.cooldownTime) {
      console.warn(`🕒 Request to ${url} is in cooldown period. Try again in ${Math.ceil((this.cooldownTime - (now - lastRequestTime)) / 1000)} seconds.`);
      return false;
    }

    this.cooldowns.set(url, now);
    return true;
  }

  // Helper method to clear retry attempts
  clearRetryAttempts(url) {
    // Clear all retry attempts for this URL
    for (const key of this.retryAttempts.keys()) {
      if (key.startsWith(url)) {
        this.retryAttempts.delete(key);
      }
    }
  }

  async fetchJobs(params = {}) {
    const queryParams = new URLSearchParams();

    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.pageSize) queryParams.append('page_size', params.pageSize);

    // Add search
    if (params.search) queryParams.append('search', params.search);

    // Add filters
    if (params.location) queryParams.append('location__icontains', params.location);
    if (params.company) queryParams.append('company__icontains', params.company);
    if (params.source) queryParams.append('source', params.source);
    if (params.country) queryParams.append('country', params.country);
    if (params.employment_type) queryParams.append('employment_type', params.employment_type);

    // Add date filters
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    // Add ordering
    if (params.ordering) queryParams.append('ordering', params.ordering);

    const url = `${this.buildApiUrl('/jobs/')}?${queryParams.toString()}`;

    // Check cooldown to prevent rapid requests
    if (!this.shouldMakeRequest(url)) {
      // Return empty response instead of rejecting to prevent errors
      console.log('⏳ Jobs request in cooldown, returning cached/empty response');
      return { results: [], count: 0, next: null, previous: null };
    }

    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      // Handle 401 specifically - try without auth if we should retry
      if (response.status === 401 && this.shouldRetry(url, 401)) {
        console.warn('🔓 Jobs API authentication failed, trying without auth headers...');
        const responseWithoutAuth = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!responseWithoutAuth.ok) {
          this.clearRetryAttempts(url);
          throw new Error(`HTTP error! status: ${responseWithoutAuth.status}`);
        }

        this.clearRetryAttempts(url);
        return await responseWithoutAuth.json();
      }

      if (!response.ok) {
        this.clearRetryAttempts(url);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.clearRetryAttempts(url);
      return await response.json();

    } catch (error) {
      this.clearRetryAttempts(url);
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  async fetchJobById(id) {
    const url = this.buildApiUrl(`/jobs/${id}/`);

    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      // Handle 401 specifically - try without auth if we should retry
      if (response.status === 401 && this.shouldRetry(url, 401)) {
        console.warn('🔓 Job detail API authentication failed, trying without auth headers...');
        const responseWithoutAuth = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!responseWithoutAuth.ok) {
          this.clearRetryAttempts(url);
          throw new Error(`HTTP error! status: ${responseWithoutAuth.status}`);
        }

        this.clearRetryAttempts(url);
        return await responseWithoutAuth.json();
      }

      if (!response.ok) {
        this.clearRetryAttempts(url);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.clearRetryAttempts(url);
      return await response.json();

    } catch (error) {
      this.clearRetryAttempts(url);
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  async fetchJobStats(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.country) queryParams.append('country', params.country);

    const url = `${this.buildApiUrl('/jobs/stats/')}?${queryParams.toString()}`;

    // Check cooldown to prevent rapid requests
    if (!this.shouldMakeRequest(url)) {
      // Return empty stats instead of rejecting to prevent errors
      console.log('⏳ Job stats request in cooldown, returning empty stats');
      return { total_jobs: 0, applications: 0, avg_salary: 0 };
    }

    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      // Handle 401 specifically - try without auth if we should retry
      if (response.status === 401 && this.shouldRetry(url, 401)) {
        console.warn('🔓 Job stats API authentication failed, trying without auth headers...');
        const responseWithoutAuth = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!responseWithoutAuth.ok) {
          this.clearRetryAttempts(url);
          throw new Error(`HTTP error! status: ${responseWithoutAuth.status}`);
        }

        this.clearRetryAttempts(url);
        return await responseWithoutAuth.json();
      }

      if (!response.ok) {
        this.clearRetryAttempts(url);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.clearRetryAttempts(url);
      return await response.json();

    } catch (error) {
      this.clearRetryAttempts(url);
      console.error('Error fetching job stats:', error);
      throw error;
    }
  }

  async fetchFilterOptions(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.country) queryParams.append('country', params.country);

    const url = `${this.buildApiUrl('/jobs/filters/')}?${queryParams.toString()}`;

    // Check cooldown to prevent rapid requests
    if (!this.shouldMakeRequest(url)) {
      // Return empty filter options instead of rejecting to prevent errors
      console.log('⏳ Filter options request in cooldown, returning empty options');
      return { companies: [], locations: [], sources: [] };
    }

    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        this.clearRetryAttempts(url);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.clearRetryAttempts(url);
      return await response.json();

    } catch (error) {
      this.clearRetryAttempts(url);
      console.error('Error fetching filter options:', error);
      throw error;
    }
  }

  async fetchIndiaJobs(params = {}) {
    return this.fetchJobs({ ...params, country: 'india' });
  }

  // Transform API job data to match frontend format
  transformJobData(apiJob) {
    return {
      id: apiJob.job_id || apiJob.id,
      external_id: apiJob.external_id || 'N/A',
      title: apiJob.title || 'To be updated',
      company: {
        name: apiJob.company || 'To be updated',
        logo: this.generateCompanyLogo(apiJob.company || 'Company'),
        size: "To be updated",
        headquarters: "To be updated",
        founded: "To be updated",
        industry: "To be updated",
        description: apiJob.company ? `${apiJob.company} is a leading company.` : "To be updated"
      },
      location: apiJob.location || 'To be updated',
      type: apiJob.employment_type || 'To be updated',
      remote: apiJob.location ? this.isRemoteLocation(apiJob.location) : false,
      salary: this.parseSalaryRange(apiJob.salary_range) || { min: null, max: null, text: 'To be updated' },
      matchPercentage: Math.floor(Math.random() * 20) + 80, // Random match percentage for now
      description: apiJob.description || 'To be updated',
      skills: this.extractSkills(apiJob.description, apiJob.requirements),
      requirements: Array.isArray(apiJob.requirements) ? apiJob.requirements : (apiJob.requirements ? [apiJob.requirements] : ['To be updated']),
      applicationStatus: "not-applied",
      postedDate: apiJob.date_posted || 'To be updated',
      dateScraped: apiJob.date_scraped || 'To be updated',
      isSaved: false,
      // Prefer application-specific link, then canonical posting URL
      apply_url: apiJob.apply_url || apiJob.application_url || null,
      url: apiJob.url || apiJob.job_url || null,
      source: apiJob.source || 'To be updated',
      // New flags from unified model
      application_mode: apiJob.application_mode || null,
      source_type: apiJob.source_type || null,
      teamSize: "To be updated",
      benefits: this.extractBenefits(apiJob.description)
    };
  }

  // Helper methods
  generateCompanyLogo(companyName) {
    // Generate a placeholder logo URL based on company name
    const seed = companyName.toLowerCase().replace(/\s+/g, '');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=100&background=random&color=fff`;
  }

  isRemoteLocation(location) {
    if (!location || typeof location !== 'string') {
      return false;
    }
    const remoteKeywords = ['remote', 'work from home', 'wfh', 'anywhere'];
    return remoteKeywords.some(keyword =>
      location.toLowerCase().includes(keyword)
    );
  }

  parseSalaryRange(salaryRange) {
    if (!salaryRange || typeof salaryRange !== 'string') {
      return { min: null, max: null, text: 'To be updated' };
    }

    // Try to extract salary numbers from the range
    const numbers = salaryRange.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      return {
        min: parseInt(numbers[0]),
        max: parseInt(numbers[1]),
        text: salaryRange
      };
    }
    return { min: null, max: null, text: salaryRange || 'To be updated' };
  }

  extractSkills(description, requirements) {
    const skillKeywords = [
      'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'Go',
      'Django', 'Flask', 'Express', 'Vue', 'Angular', 'HTML', 'CSS', 'SASS',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'GCP', 'Git', 'Jenkins', 'GraphQL', 'REST API',
      'Machine Learning', 'AI', 'Data Science', 'DevOps', 'CI/CD'
    ];

    // Handle undefined or null description and requirements
    const safeDescription = description || '';
    const safeRequirements = Array.isArray(requirements) ? requirements.join(' ') : (requirements || '');
    const text = `${safeDescription} ${safeRequirements}`.toLowerCase();

    const foundSkills = skillKeywords.filter(skill =>
      text.includes(skill.toLowerCase())
    ).slice(0, 8); // Limit to 8 skills

    // If no skills found, return "To be updated"
    if (foundSkills.length === 0) {
      return ['To be updated'];
    }

    return foundSkills;
  }

  extractBenefits(description) {
    const benefitKeywords = [
      'health insurance', 'dental', 'vision', 'retirement', '401k',
      'remote work', 'flexible hours', 'vacation', 'pto', 'stock options',
      'equity', 'bonus', 'learning budget', 'conference', 'gym'
    ];

    // Handle undefined or null description
    if (!description || typeof description !== 'string') {
      return ['To be updated', 'Competitive Salary', 'Health Insurance'];
    }

    const text = description.toLowerCase();
    const foundBenefits = [];

    benefitKeywords.forEach(benefit => {
      if (text.includes(benefit)) {
        foundBenefits.push(this.capitalizeWords(benefit));
      }
    });

    // Add some default benefits if none found
    if (foundBenefits.length === 0) {
      foundBenefits.push('To be updated', 'Competitive Salary', 'Health Insurance');
    }

    return foundBenefits.slice(0, 6); // Limit to 6 benefits
  }

  capitalizeWords(str) {
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
}

export const jobsAPI = new JobsAPI();
export default jobsAPI;
