import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  // Send the HttpOnly refresh cookie with requests (needed for silent refresh & logout).
  withCredentials: true,
});

// Attach the access token from localStorage on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Endpoints that must never trigger a refresh-retry loop.
const NO_REFRESH = ['/auth/refresh', '/auth/login', '/auth/logout'];

// Single-flight guard: concurrent 401s share one refresh request.
let refreshPromise = null;

const runRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then((res) => {
        const token = res.data.token;
        localStorage.setItem('token', token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// On a 401, attempt a silent refresh once, then replay the original request.
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err.response?.status;
    const url = original?.url || '';

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !NO_REFRESH.some((p) => url.includes(p))
    ) {
      original._retry = true;
      try {
        const token = await runRefresh();
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        // Refresh failed: session is truly gone.
        localStorage.removeItem('token');
      }
    }

    const message =
      err.response?.data?.message || err.message || 'Something went wrong';
    const error = new Error(message);
    error.data = err.response?.data;
    error.status = err.response?.status;
    return Promise.reject(error);
  }
);

export default api;
