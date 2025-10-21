import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add device information to requests
let deviceId: string | null = null;
let getAccessToken: (() => Promise<string | undefined>) | null = null;

export const setDeviceInfo = (id: string, _info: any) => {
  deviceId = id;
};

export const setAuthTokenGetter = (tokenGetter: () => Promise<string | undefined>) => {
  getAccessToken = tokenGetter;
};

apiClient.interceptors.request.use(async (config) => {
  // Add Auth0 token to requests
  if (getAccessToken) {
    try {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }
  
  // Add device information to requests
  if (deviceId) {
    config.headers['X-Device-ID'] = deviceId;
  }
  
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.code;
      if (errorCode === 'DEVICE_LIMIT_EXCEEDED' || errorCode === 'ACCOUNT_DISABLED') {
        // Handle device limit exceeded or account disabled
        localStorage.clear();
        window.location.href = '/?error=' + errorCode;
      }
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (deviceIdentifier: string, deviceInfo: any, auth0UserData?: any) =>
    apiClient.post('/auth/login', { deviceIdentifier, deviceInfo, auth0UserData }),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  getDevices: () =>
    apiClient.get('/auth/devices'),
  
  removeDevice: (deviceId: string) =>
    apiClient.delete(`/auth/devices/${deviceId}`),
};

export const coursesAPI = {
  getCourses: (params?: any) =>
    apiClient.get('/courses', { params }),
  
  getCourse: (id: string) =>
    apiClient.get(`/courses/${id}`),
  
  createCourse: (data: any) =>
    apiClient.post('/courses', data),
  
  updateCourse: (id: string, data: any) =>
    apiClient.put(`/courses/${id}`, data),
  
  deleteCourse: (id: string) =>
    apiClient.delete(`/courses/${id}`),
};

export const enrollmentsAPI = {
  enroll: (courseId: string) =>
    apiClient.post(`/enrollments/courses/${courseId}`),
  
  getMyEnrollments: () =>
    apiClient.get('/enrollments/my-enrollments'),
  
  updateProgress: (courseId: string, progress: number) =>
    apiClient.put(`/enrollments/courses/${courseId}/progress`, { progress }),
  
  unenroll: (courseId: string) =>
    apiClient.delete(`/enrollments/courses/${courseId}`),
  
  getCourseEnrollments: (courseId: string) =>
    apiClient.get(`/enrollments/courses/${courseId}/students`),
};

export const ratingsAPI = {
  rateCourse: (courseId: string, rating: number, review?: string) =>
    apiClient.post(`/ratings/courses/${courseId}`, { rating, review }),
  
  getCourseRatings: (courseId: string, params?: any) =>
    apiClient.get(`/ratings/courses/${courseId}`, { params }),
  
  getMyRating: (courseId: string) =>
    apiClient.get(`/ratings/courses/${courseId}/my-rating`),
  
  deleteRating: (courseId: string) =>
    apiClient.delete(`/ratings/courses/${courseId}`),
};

export const uploadAPI = {
  uploadThumbnail: (file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    return apiClient.post('/upload/thumbnail', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  uploadVideo: (file: File, courseId?: string, lessonId?: string) => {
    const formData = new FormData();
    formData.append('video', file);
    if (courseId) formData.append('courseId', courseId);
    if (lessonId) formData.append('lessonId', lessonId);
    return apiClient.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getFileUrl: (filePath: string, expiry?: number) =>
    apiClient.get(`/upload/file/${encodeURIComponent(filePath)}`, {
      params: { expiry },
    }),
  
  deleteFile: (filePath: string) =>
    apiClient.delete(`/upload/file/${encodeURIComponent(filePath)}`),
};

export default apiClient;
