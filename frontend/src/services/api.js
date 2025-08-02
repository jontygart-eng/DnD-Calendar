import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Calendar Date API
export const calendarApi = {
  getCurrentDate: async () => {
    const response = await apiClient.get('/calendar/current-date');
    return response.data;
  },

  setCurrentDate: async (dateData) => {
    const response = await apiClient.put('/calendar/current-date', dateData);
    return response.data;
  },

  getDatesForMonth: async (year, month) => {
    const response = await apiClient.get(`/calendar/dates/${year}/${month}`);
    return response.data;
  },
};

// Events API
export const eventsApi = {
  getEventsForMonth: async (year, month) => {
    const response = await apiClient.get(`/events/${year}/${month}`);
    return response.data;
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

  getEvent: async (eventId) => {
    const response = await apiClient.get(`/events/single/${eventId}`);
    return response.data;
  },
};

// Error handling wrapper
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    console.error('API Error:', error.response.data);
    return error.response.data.detail || 'An error occurred';
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.request);
    return 'Network error - please check your connection';
  } else {
    // Other error
    console.error('Error:', error.message);
    return error.message || 'An unexpected error occurred';
  }
};

export default apiClient;