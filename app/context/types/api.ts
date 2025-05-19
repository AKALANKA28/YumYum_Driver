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

// Define common types for API responses
export interface Restaurant {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category?: string;
  isOpen?: boolean;
  rating?: number;
}
import NetInfo from '@react-native-community/netinfo';

// Single base URL for all environments
// const BASE_URL = "http://192.168.137.141/api";
const BASE_URL = "http://192.168.1.159/api";



// Create the API client instance with error handling
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 10 seconds timeout
});

// Create a public API client that doesn't require authentication
const publicApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 10 seconds timeout
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
// Enhanced response interceptor with better error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },  async (error) => {
    // Extract request information for better error logging
    const requestUrl = error.config?.url || 'unknown';
    const requestMethod = error.config?.method?.toUpperCase() || 'unknown';
    
    // Handle network errors
    if (!error.response) {
      console.error(`Network error on ${requestMethod} ${requestUrl}:`, error.message);
      
      // Check if we have a connection
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return Promise.reject({
          ...error,
          message: 'No internet connection. Please check your network settings.'
        });
      }
      
      return Promise.reject({
        ...error,
        message: 'Unable to reach server. Please try again later.'
      });
    }
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      console.warn('Authentication error: Token may have expired');
      try {
        // Clear stored credentials
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('driver');
      } catch (clearError) {
        console.error('Error clearing credentials:', clearError);
      }
    }
    
    // Provide a more descriptive error message based on status code
    const errorMessage = getErrorMessageFromStatus(error.response.status);
    
    console.error(`API Error ${error.response.status} on ${requestMethod} ${requestUrl}:`, 
      error.response.data?.message || errorMessage);
    
    return Promise.reject({
      ...error,
      message: error.response.data?.message || errorMessage
    });
  }
);

// Add the same response interceptor to the public API client
publicApiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`Public API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    // Extract request information for better error logging
    const requestUrl = error.config?.url || 'unknown';
    const requestMethod = error.config?.method?.toUpperCase() || 'unknown';
    
    // Handle network errors
    if (!error.response) {
      console.error(`Network error on public API ${requestMethod} ${requestUrl}:`, error.message);
      
      // Check if we have a connection
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return Promise.reject({
          ...error,
          message: 'No internet connection. Please check your network settings.'
        });
      }
      
      return Promise.reject({
        ...error,
        message: 'Unable to reach server. Please try again later.'
      });
    }
    
    // Provide a more descriptive error message based on status code
    const errorMessage = getErrorMessageFromStatus(error.response.status);
    
    console.error(`Public API Error ${error.response.status} on ${requestMethod} ${requestUrl}:`, 
      error.response.data?.message || errorMessage);
    
    return Promise.reject({
      ...error,
      message: error.response.data?.message || errorMessage
    });
  }
);



// Helper function to get a user-friendly error message
function getErrorMessageFromStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return `Error ${status}. Please try again later.`;
  }
}


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

    // Driver related endpoints
    drivers: {
          updateDriverStatus: async (driverId: string | number, status: string, latitude?: number, longitude?: number) => {
        const updateData = {
          driverId,
          status,
          lastActiveAt: new Date().toISOString()
        };
        
        try {
          return await apiClient.patch(`/drivers/${driverId}/status`, updateData);
        } catch (error: any) {
          console.error(`Failed to update driver status to ${status}:`, error.message);
          
          // Still update the UI state even if the API call fails
          // This lets the user continue using the app, and we can retry in the background
          
          // Try again after a short delay if it's a network error
          if (!error.response) {
            try {
              console.log('Attempting to retry status update...');
              await new Promise(resolve => setTimeout(resolve, 3000));
              return await apiClient.patch(`/drivers/${driverId}/status`, updateData);
            } catch (retryError) {
              // If retry fails, let the app continue but log the error
              console.error('Status update retry failed:', retryError);
            }
          }
          
          throw error;
        }
      }
    },
    
    // Driver tracking related endpoints
    tracking: {
      updateLocation: async (driverId: string | number, locationData: LocationData) => {
        try {
          
          return await apiClient.put(`/tracking/drivers/${driverId}/location`, locationData);
        } catch (error) {
          console.error('Location update failed. Will retry in background.');
          // Here you could implement offline storage and retry logic
          throw error;
        }
      },
      getDriverLocation: (driverId: string | number) => 
        apiClient.get(`/tracking/drivers/${driverId}/location`),
      
      // Update your createTrip function in the tracking section:

      createTrip: async (tripData: any) => {
        try {
          // Validate required fields before making the API call
          if (!tripData.driverId) {
            throw new Error("Missing driverId");
          }
          
          if (!tripData.customerId) {
            throw new Error("Missing customerId");
          }
          
          if (!tripData.orderId) {
            throw new Error("Missing orderId");
          }
          
          // Validate waypoints
          if (!tripData.waypoints || !Array.isArray(tripData.waypoints) || tripData.waypoints.length < 2) {
            throw new Error("Trip requires at least two waypoints");
          }
          
          // Check each waypoint for valid coordinates
          // Define interfaces for waypoint location
          interface Point {
            type: "Point";
            coordinates: [number, number]; // [longitude, latitude]
          }

          interface WaypointWithCoordinates {
            latitude?: number;
            longitude?: number;
            location?: Point;
            address?: string;
            type?: "PICKUP" | "DROPOFF";
            status?: string;
            [key: string]: any; // Allow other properties
          }

          // Validation function with types
          const validWaypoints = tripData.waypoints.map((wp: WaypointWithCoordinates) => {
            // Ensure location has valid coordinates
            if (!wp.location) {
              wp.location = {
                type: "Point",
                coordinates: [0, 0] // Default coordinates if missing
              };
            }
            
            // If using direct lat/lng properties instead of location
            if (wp.latitude !== undefined && wp.longitude !== undefined) {
              wp.location = {
                type: "Point",
                coordinates: [wp.longitude, wp.latitude] // MongoDB expects [lng, lat]
              };
              
              // Remove original properties to avoid confusion
              delete wp.latitude;
              delete wp.longitude;
            }
            
            // Check if coordinates are null or invalid
            if (!wp.location.coordinates || 
                wp.location.coordinates[0] === null || 
                wp.location.coordinates[1] === null) {
              console.warn("Invalid coordinates in waypoint, using default values");
              wp.location.coordinates = [0, 0]; // Default coordinates
            }
            
            // Ensure address exists
            if (!wp.address) {
              wp.address = wp.type === "PICKUP" ? "Pickup Location" : "Dropoff Location";
            }
            
            // Ensure status is set
            if (!wp.status) {
              wp.status = "PENDING";
            }
            
            return wp;
          });
          
          // Create a valid trip object with all required fields
          const validTripData = {
            ...tripData,
            waypoints: validWaypoints,
            status: tripData.status || "SCHEDULED",
            estimatedDistance: tripData.estimatedDistance || 0,
            estimatedDuration: tripData.estimatedDuration || 0,
            createdAt: tripData.createdAt || new Date().toISOString()
          };
          
          console.log(`Creating trip with validated data:`, JSON.stringify(validTripData));
          
          // Use a single, reliable endpoint
          const endpoint = '/tracking/trips';
          const response = await apiClient.post(endpoint, validTripData);
          
          console.log('Trip created successfully');
          return response;
        } catch (error) {
          console.error('Trip creation failed:', error);
          throw error;
        }
      },
      
      // Get trip status
      getTripStatus: async (orderId: string) => {
        try {
          const response = await apiClient.get(`/tracking/trips/${orderId}`);
          return response.data;
        } catch (error) {
          console.error(`Failed to get trip status for order ${orderId}:`, error);
          throw error;
        }
      }
    

      },
      
    orders: {
      // Existing methods
      acceptOrder: async (orderId: string | number, driverId: string | number) => {
        try {
          const response = await apiClient.put(`/assignments/${orderId}/confirm/${driverId}`);
          return response.data;
        } catch (error) {
          console.error(`Failed to accept order ${orderId}:`, error);
          throw error;
        }
      },
      
      declineOrder: async (orderId: string | number, driverId: string | number) => {
        try {
          const response = await apiClient.put(`/assignments/${orderId}/reject/${driverId}`);
          return response.data;
        } catch (error) {
          console.error(`Failed to reject order ${orderId}:`, error);
          throw error;
        }
      },
      
      pickup: async (orderId: string | number) => {
        try {
          const response = await apiClient.put(`/orders/${orderId}/pickup`);
          return response.data;
        } catch (error) {
          console.error(`Failed to mark order ${orderId} as picked up:`, error);
          throw error;
        }
      },
      
      complete: async (orderId: string | number) => {
        try {
          const response = await apiClient.put(`/orders/${orderId}/complete`);
          return response.data;
        } catch (error) {
          console.error(`Failed to mark order ${orderId} as completed:`, error);
          throw error;
        }
      }
    },    // Restaurant related endpoints
    restaurants: {
      getNearby: async () => {
        try {
          // Use the public API client without authentication headers
          const response = await publicApiClient.get('/restaurant/public/verified');
          // Check if the restaurants property exists and is an array
          if (response.data && Array.isArray(response.data.restaurants)) {
            return response.data.restaurants;
          } else {
            console.warn('Restaurant data is not in expected format:', response.data);
            return [];
          }
        } catch (error) {
          console.error('Failed to fetch restaurants:', error);
          // Return an empty array instead of throwing to prevent crashes
          return [];
        }
      },
      
      getDetails: async (restaurantId: string) => {
        try {
          const response = await apiClient.get(`/restaurants/${restaurantId}`);
          return response.data;
        } catch (error) {
          console.error(`Failed to get restaurant details for ${restaurantId}:`, error);
          throw error;
        }
      }
    }
};

// Export base URL for debugging purposes
export const API_BASE_URL = BASE_URL;

// Export the API service
export default api;