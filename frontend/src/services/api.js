import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create optimized axios instance
const apiClient = axios.create({
  baseURL: API,
  timeout: 5000, // Reduced timeout for faster failure
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for performance optimization
apiClient.interceptors.request.use(
  (config) => {
    // Add request timestamp for monitoring
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with caching hints
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - response.config.metadata.startTime;
    if (duration > 1000) {
      console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// Calendar Date API - optimized
export const calendarApi = {
  getCurrentDate: async () => {
    try {
      const response = await apiClient.get('/calendar/current-date');
      return response.data;
    } catch (error) {
      console.error('Failed to get current date:', error);
      // Return fallback data for offline resilience
      return { month: 2, day: 15, year: 2025, id: 'fallback' };
    }
  },

  setCurrentDate: async (dateData) => {
    const response = await apiClient.put('/calendar/current-date', dateData);
    return response.data;
  },
};

// Events API - optimized with better error handling
export const eventsApi = {
  getEventsForMonth: async (year, month) => {
    try {
      const response = await apiClient.get(`/events/${year}/${month}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get events for ${year}/${month}:`, error);
      return []; // Return empty array as fallback
    }
  },

  createEvent: async (eventData) => {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (eventId, eventData) => {
    const response = await apiClient.put(`/events/${eventId}`, eventData);
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await apiClient.delete(`/events/${eventId}`);
    return response.data;
  },
};

// Simplified error handling
export const handleApiError = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout - please try again';
  }
  return error.message || 'An unexpected error occurred';
};

export default apiClient;