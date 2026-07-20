import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach JWT from localStorage on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error messages to a single `.message` string for the UI, while
// preserving the raw response payload on `.data` for callers that need flags
// (e.g. `needsVerification`).
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || 'Something went wrong';
    const error = new Error(message);
    error.data = err.response?.data;
    error.status = err.response?.status;
    return Promise.reject(error);
  }
);

export default api;
