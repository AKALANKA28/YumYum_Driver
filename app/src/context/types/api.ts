import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
    LoginCredentials,
    VerificationParams,
    LocationData,
    ProfileData,
    VehicleData,
    DocumentUploadMetadata
  } from './auth';

// Define type for environment keys
type Environment = 'development' | 'k8s_local' | 'staging' | 'production';

// Get environment from Expo config or default to development
const currentEnv = (Constants.expoConfig?.extra?.environment || 'development') as Environment;

// API base URLs for different environments
const API_URL = {
  // For development with port-forwarding
  development: Platform.OS === 'web' 
    ? 'http://localhost:8080/api'                 // Browser testing
    : Platform.OS === 'android'
      ? 'http://10.0.2.2:8080/api'               // Android emulator (10.0.2.2 points to host's localhost)
      : 'http://localhost:8080/api',             // iOS simulator
  
  // For local Kubernetes with nip.io (if port-forwarding doesn't work)
  k8s_local: 'http://api.192.168.1.250.nip.io/api',
  
  // Uncomment and use these when ready for staging/production
  staging: 'https://api-staging.yumyum.com/api',
  production: 'https://api.yumyum.com/api',
};

// Use the appropriate URL based on environment
const BASE_URL = API_URL[currentEnv] || API_URL.development;

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
    login: (credentials) => 
      apiClient.post('/auth/login', credentials),
    register: (data) => 
      apiClient.post('/auth/register', data),
    sendVerification: (phoneNumber) => 
      apiClient.post('/auth/send-verification', { phoneNumber }),
    verify: (params) => 
      apiClient.post('/auth/verify', params),
    resetPassword: (data) => 
      apiClient.post('/auth/reset-password', data),
    profile: {
      get: () => apiClient.get('/auth/profile'),
      update: (data) => apiClient.put('/auth/profile', data),
      uploadDocument: (type, data) => 
        apiClient.post(`/auth/documents/${type}`, data),
    }
  },
  
  // Driver tracking related endpoints
  tracking: {
    updateLocation: (driverId, locationData) => 
      apiClient.post(`/tracking/driver/${driverId}/location`, locationData),
    getDriverLocation: (driverId) => 
      apiClient.get(`/tracking/driver/${driverId}/location`),
    goOnline: (driverId) => 
      apiClient.post(`/tracking/driver/${driverId}/status`, { status: 'online' }),
    goOffline: (driverId) => 
      apiClient.post(`/tracking/driver/${driverId}/status`, { status: 'offline' }),
  },
  
//   // Order related endpoints
//   orders: {
//     getActive: () => 
//       apiClient.get('/orders/active'),
//     getHistory: (page = 0, size = 10) => 
//       apiClient.get(`/orders/history?page=${page}&size=${size}`),
//     accept: (orderId) => 
//       apiClient.post(`/orders/${orderId}/accept`),
//     decline: (orderId) => 
//       apiClient.post(`/orders/${orderId}/decline`),
//     pickup: (orderId) => 
//       apiClient.post(`/orders/${orderId}/pickup`),
//     complete: (orderId) => 
//       apiClient.post(`/orders/${orderId}/complete`),
//     cancel: (orderId, reason) => 
//       apiClient.post(`/orders/${orderId}/cancel`, { reason }),
//     getDetails: (orderId) => 
//       apiClient.get(`/orders/${orderId}`),
//   },
  
//   // Driver service specific endpoints
//   driver: {
//     getProfile: () => 
//       apiClient.get('/drivers/profile'),
//     updateProfile: (data) => 
//       apiClient.put('/drivers/profile', data),
//     getVehicle: () => 
//       apiClient.get('/drivers/vehicle'),
//     updateVehicle: (data) => 
//       apiClient.put('/drivers/vehicle', data),
//     getEarnings: (period) => 
//       apiClient.get(`/drivers/earnings?period=${period}`),
//     getStatistics: () => 
//       apiClient.get('/drivers/statistics'),
//     updateStatus: (status) => 
//       apiClient.post('/drivers/status', { status }),
//   },
  
//   // General settings and utilities
//   settings: {
//     getAppSettings: () => 
//       apiClient.get('/settings/app'),
//     updateFcmToken: (token) => 
//       apiClient.post('/settings/notifications/token', { token }),
//     getNotificationSettings: () => 
//       apiClient.get('/settings/notifications'),
//     updateNotificationSettings: (settings) => 
//       apiClient.put('/settings/notifications', settings),
//   },
};

export default api;