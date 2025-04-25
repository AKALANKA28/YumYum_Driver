import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  LoginCredentials,
  VerificationParams,
  LocationData,
  ProfileData,
  VehicleData,
  DocumentUploadMetadata
} from './auth';

// Single base URL for all environments
// Update this URL when switching between development, testing, and production
// const BASE_URL = "http://192.168.221.141:8085/api";
const BASE_URL = "http://192.168.39.141:8084/api";



// Create the API client instance with error handling
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get token from secure storage
      const token = await SecureStore.getItemAsync('token');
      
      // If token exists, add it to the headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error accessing secure storage:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection.'
      });
    }
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      try {
        // Clear stored credentials
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('driver');
      } catch (clearError) {
        console.error('Error clearing credentials:', clearError);
      }
      
      // Let the auth context handle the logout
      // We'll rely on the API call failure for the auth context to detect this
    }
    
    return Promise.reject(error);
  }
);

// Define the API service with organized endpoints by domain
const api = {
    // Authentication related endpoints
    auth: {
      login: (credentials: LoginCredentials) => 
        apiClient.post('/auth/login', credentials),
      register: (data: any) => 
        apiClient.post('/auth/register', data),
      sendVerification: (phoneNumber: string) => 
        apiClient.post('/auth/send-verification', { phoneNumber }),
      verify: (params: VerificationParams) => 
        apiClient.post('/auth/verify', params),
      resetPassword: (data: { email: string }) => 
        apiClient.post('/auth/reset-password', data),
      profile: {
        get: () => apiClient.get('/auth/profile'),
        update: (data: ProfileData) => apiClient.put('/auth/profile', data),
        uploadDocument: (type: string, data: DocumentUploadMetadata) => 
          apiClient.post(`/auth/documents/${type}`, data),
      }
    },
    
    // Driver tracking related endpoints
    tracking: {
      updateLocation: (driverId: string | number, locationData: LocationData) => 
        apiClient.post(`/drivers/${driverId}/location`, locationData),
      getDriverLocation: (driverId: string | number) => 
        apiClient.get(`/drivers/${driverId}/location`),
      goOnline: (driverId: string | number) => 
        apiClient.post(`/tracking/driver/${driverId}/status`, { status: 'online' }),
      goOffline: (driverId: string | number) => 
        apiClient.post(`/tracking/driver/${driverId}/status`, { status: 'offline' }),
    },
  
    // Order related endpoints - uncomment when needed
    orders: {
      getActive: () => 
        apiClient.get('/orders/active'),
      getHistory: (page = 0, size = 10) => 
        apiClient.get(`/orders/history?page=${page}&size=${size}`),
      accept: (orderId: string | number) => 
        apiClient.post(`/orders/${orderId}/accept`),
      decline: (orderId: string | number) => 
        apiClient.post(`/orders/${orderId}/decline`),
      pickup: (orderId: string | number) => 
        apiClient.post(`/orders/${orderId}/pickup`),
      complete: (orderId: string | number) => 
        apiClient.post(`/orders/${orderId}/complete`),
      cancel: (orderId: string | number, reason: string) => 
        apiClient.post(`/orders/${orderId}/cancel`, { reason }),
      getDetails: (orderId: string | number) => 
        apiClient.get(`/orders/${orderId}`),
    },
};

// Export base URL for debugging purposes
export const API_BASE_URL = BASE_URL;

// Export the API service
export default api;