import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For refresh token cookies
});

// Request Interceptor - Attach access token to every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Extract data & handle 401 refresh
axiosClient.interceptors.response.use(
  (response) => {
    // Axios wraps response in { data, status, ... }
    // We unwrap to return response.data directly
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Use refresh token to get new access token
        const refreshToken = localStorage.getItem('refreshToken');
        const rs = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );

        // API response shape: { success, data: { tokens: { access: { token } } } }
        const newAccessToken = rs.data?.data?.tokens?.access?.token;
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          return axiosClient(originalRequest);
        }
      } catch (_error) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(_error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
