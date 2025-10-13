import axios from 'axios';
import keycloak from '../keycloak';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:80/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    await keycloak.updateToken(30); // Refresh token if expired within 30 seconds
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});

export default apiClient;
