import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Ideas API
export const ideasAPI = {
  // Get paginated ideas with filters
  getIdeas: (filters = {}) => {
    const params = {
      page: filters.page || 1,
      itemsPerPage: filters.itemsPerPage || 25,
      search: filters.search || '',
      tag: filters.tag || '',
      category: filters.category || ''
    };
    return apiClient.get('/ideas', { params });
  },

  // Get single idea by ID
  getIdeaById: (id) => {
    return apiClient.get(`/ideas/${id}`);
  },

  // Search ideas
  searchIdeas: (query, filters = {}) => {
    return apiClient.post('/ideas/search', { query, filters });
  },

  // Get tags
  getTags: (search = '') => {
    return apiClient.get('/ideas/tags/list', { params: { search } });
  },

  // Get statistics
  getStats: () => {
    return apiClient.get('/ideas/stats/summary');
  },

  // Export all ideas as Excel
  exportExcel: () => {
    return axios.get(`${API_BASE_URL}/ideas/export/excel`, {
      responseType: 'blob'
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'avoid_data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return response;
    });
  }
};

// Validation API
export const validationAPI = {
  // Validate single idea by ID (with optional force refresh)
  validateIdea: (id, forceRefresh = true) => {
    const url = forceRefresh 
      ? `/validation/idea/${id}?refresh=true`
      : `/validation/idea/${id}`;
    return apiClient.get(url);
  },

  // Validate idea by name/description
  validate: (idea) => {
    return apiClient.post('/validation/validate', idea);
  },

  // Get validation status
  getStatus: (id) => {
    return apiClient.get(`/validation/status/${id}`);
  }
};

// User Contributions API
export const contributionsAPI = {
  // Submit verification
  submitVerification: (data) => {
    return apiClient.post('/contributions/verify', data);
  },

  // Submit competitor
  submitCompetitor: (data) => {
    return apiClient.post('/contributions/competitor', data);
  },

  // Submit saturation level
  submitSaturation: (data) => {
    return apiClient.post('/contributions/saturation', data);
  },

  // Get contributions for idea
  getContributions: (id) => {
    return apiClient.get(`/contributions/idea/${id}`);
  }
};

// Visitors API
export const visitorsAPI = {
  // Get visitor count
  getCount: () => {
    return apiClient.get('/visitors/count');
  },

  // Increment visitor count
  increment: () => {
    return apiClient.post('/visitors/increment');
  }
};

export default apiClient;

