import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

// Define the Document Type enum
export enum DocumentType {
  PROFILE_PHOTO = "PROFILE_PHOTO",
  DRIVING_LICENSE = "DRIVING_LICENSE",
  VEHICLE_INSURANCE = "VEHICLE_INSURANCE",
  REVENUE_LICENSE = "REVENUE_LICENSE",
  VEHICLE_REGISTRATION = "VEHICLE_REGISTRATION"
}

// Define the DocumentUploadMetadata interface
export interface DocumentUploadMetadata {
  base64Image: string;
  fileName: string;
  contentType: string;
  expiryDate?: string; // LocalDateTime in backend
}

// Define the RegistrationRequest interface
export interface RegistrationRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  licenseNumber: string;
  
  // Vehicle details
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  licensePlate: string;
  vehicleColor: string;
  
  // Documents map matching backend structure
  documents: {
    [key in DocumentType]?: DocumentUploadMetadata;
  };
}

interface LoginCredentials {
  loginIdentifier: string; // Can be email, phone, or username
  password: string;
}

// Basic driver information - we'll remove this or align it with RegistrationRequest
export interface Driver {
  id?: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  // Other fields as needed
}

// Base URL for your API
// const API_BASE_URL = 'http://10.0.2.2:8085/api';
const API_BASE_URL = "http://192.168.64.141:8085/api";

// Initialize API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Auth state interface
interface AuthState {
  isAuthenticated: boolean;
  driver: Driver | null;
  isLoading: boolean;
  error: string | null;
}

// Define initial auth state
const initialState: AuthState = {
  isAuthenticated: false,
  driver: null,
  isLoading: true,
  error: null
};

// Auth actions
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: Driver }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SIGNUP_START' }
  | { type: 'SIGNUP_SUCCESS' }
  | { type: 'SIGNUP_FAILURE'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        driver: action.payload,
        isLoading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        driver: null,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        driver: null,
        isLoading: false,
        error: null
      };
    case 'SIGNUP_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: null
      };
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
};

// Create Auth Context
type AuthContextType = {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (phoneNumber: string) => Promise<string>;
  verifyOTP: (params: { phoneNumber: string; code: string }) => Promise<string>;
  registerDriver: (registrationData: RegistrationRequest) => Promise<void>; // Updated type
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const driverStr = await SecureStore.getItemAsync('driver');
        const token = await SecureStore.getItemAsync('token');

        if (driverStr && token) {
          const driver = JSON.parse(driverStr);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          dispatch({ type: 'LOGIN_SUCCESS', payload: driver });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiClient.post('/auth/login', {
        loginIdentifier: credentials.loginIdentifier,
        password: credentials.password,
      });
      const { accessToken, ...driver } = response.data;

      // Store the driver and token
      await Promise.all([
        SecureStore.setItemAsync('driver', JSON.stringify(driver)),
        SecureStore.setItemAsync('token', accessToken)
      ]);

      // Set authorization header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      dispatch({ type: 'LOGIN_SUCCESS', payload: driver });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to login. Please try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Signup function (initiates the registration process)
  const signup = async (phoneNumber: string): Promise<string> => {
    dispatch({ type: "SIGNUP_START" });
    try {
      console.log("Sending OTP to phone number:", phoneNumber);

      const response = await apiClient.post("/auth/send-verification", {
        phoneNumber,
      });

      console.log("OTP sent successfully. Response:", response.data);

      // Important: Reset loading state after successful OTP send
      dispatch({ type: "SIGNUP_SUCCESS" });

      // Return the verification ID from the response
      return response.data.verificationId || "";
    } catch (error: any) {
      console.error("Error sending OTP:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      dispatch({ type: "SIGNUP_FAILURE", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Verify OTP function
  const verifyOTP = async (params: any): Promise<string> => {
    // dispatch({ type: "VERIFY_OTP_START" });
    try {
      console.log("Received verification params:", params);

      // Create the payload with the correct parameter name
      const payload = {
        phoneNumber: params.phoneNumber,
        code: params.otp || params.code, // Accept either 'otp' or 'code' but send 'code' to API
      };

      console.log("Sending verification request with payload:", payload);

      const response = await apiClient.post("/auth/verify", payload);

      console.log("OTP verification successful, response:", response.data);

      // dispatch({ type: "VERIFY_OTP_SUCCESS" });

      return response.data.verificationId || response.data.token || "";
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }

      const errorMessage =
        error.response?.data?.message || "Invalid OTP. Please try again.";
      // dispatch({ type: "VERIFY_OTP_FAILURE", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Register driver function - UPDATED to accept RegistrationRequest
  const registerDriver = async (registrationData: RegistrationRequest): Promise<any> => {
    dispatch({ type: 'SIGNUP_START' });
    try {
      console.log('AuthContext: Preparing registration data...');
      
      // DO NOT clone or modify the request data
      console.log('AuthContext: Sending registration request...');
      
      // Check base64 lengths to verify they are actual data and not placeholders
      Object.keys(registrationData.documents).forEach(key => {
        const docType = key as DocumentType;
        if (registrationData.documents[docType]) {
          const base64Length = registrationData.documents[docType]!.base64Image.length;
          console.log(`Document ${docType} base64 length:`, base64Length);
          
          // Validate base64 data is not a placeholder
          if (base64Length < 100 || registrationData.documents[docType]!.base64Image.includes('[BASE64_STRING]')) {
            throw new Error(`Invalid base64 data for document type: ${docType}`);
          }
        }
      });
      
      // Send the original request with real base64 data
      const response = await apiClient.post('/auth/register', registrationData);
      
      console.log('AuthContext: Registration response received:', response.status);
      
      const driver = response.data;
      const token = driver.accessToken;
      
      if (token) {
        // Store the driver and token in SecureStore
        await Promise.all([
          SecureStore.setItemAsync('driver', JSON.stringify(driver)),
          SecureStore.setItemAsync('token', token)
        ]);
        
        // Set the token in axios default headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: driver });
        return driver;
      } else {
        // Registration completed but waiting for verification
        Alert.alert(
          'Registration Complete',
          'Your registration is complete. Your documents will be reviewed shortly.',
          [{ text: 'OK' }]
        );
        dispatch({ type: 'SIGNUP_SUCCESS' });
        return response.data;
      }
    } catch (error: any) {
      console.error('AuthContext: Registration error:', error);
      
      // Try to get more error details
      if (error.response) {
        console.error('Error response data:', JSON.stringify(error.response.data));
        console.error('Error response status:', error.response.status);
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to complete registration. Please try again.';
      dispatch({ type: 'SIGNUP_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear stored data
      await Promise.all([
        SecureStore.deleteItemAsync('driver'),
        SecureStore.deleteItemAsync('token')
      ]);

      // Clear authorization header
      delete apiClient.defaults.headers.common['Authorization'];

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiClient.post('/auth/reset-password', { email });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        signup,
        verifyOTP,
        registerDriver,
        logout,
        resetPassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};