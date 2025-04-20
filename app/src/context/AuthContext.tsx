import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './types/api'; // Import the centralized API service
import { 
  LoginCredentials, 
  Driver, 
  DocumentType,
  DocumentUploadMetadata,
  RegistrationRequest
} from './types/auth';


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
  error: null,
};

// Auth actions
type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: Driver }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SIGNUP_START" }
  | { type: "SIGNUP_SUCCESS" }
  | { type: "SIGNUP_FAILURE"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        driver: action.payload,
        isLoading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        driver: null,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        driver: null,
        isLoading: false,
        error: null,
      };
    case "SIGNUP_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "SIGNUP_SUCCESS":
      return {
        ...state,
        isLoading: false,
        error: null,
      };
    case "SIGNUP_FAILURE":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
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
  registerDriver: (registrationData: RegistrationRequest) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const driverStr = await SecureStore.getItemAsync("driver");
        const token = await SecureStore.getItemAsync("token");

        if (driverStr && token) {
          const driver = JSON.parse(driverStr);
          dispatch({ type: "LOGIN_SUCCESS", payload: driver });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.auth.login({
        loginIdentifier: credentials.loginIdentifier,
        password: credentials.password,
      });
      const { accessToken, ...driver } = response.data;

      // Store the driver and token
      await Promise.all([
        SecureStore.setItemAsync("driver", JSON.stringify(driver)),
        SecureStore.setItemAsync("token", accessToken),
        // Add this line to store the driver ID for location updates
        AsyncStorage.setItem("driverId", driver.id?.toString() || ""),
      ]);

      dispatch({ type: "LOGIN_SUCCESS", payload: driver });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to login. Please try again.";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Signup function (initiates the registration process)
  const signup = async (phoneNumber: string): Promise<string> => {
    dispatch({ type: "SIGNUP_START" });
    try {
      console.log("Sending OTP to phone number:", phoneNumber);

      const response = await api.auth.sendVerification(phoneNumber);

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
    try {
      console.log("Received verification params:", params);

      // Create the payload with the correct parameter name
      const payload = {
        phoneNumber: params.phoneNumber,
        code: params.otp || params.code, // Accept either 'otp' or 'code' but send 'code' to API
      };

      console.log("Sending verification request with payload:", payload);

      const response = await api.auth.verify(payload);

      console.log("OTP verification successful, response:", response.data);

      return response.data.verificationId || response.data.token || "";
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }

      const errorMessage =
        error.response?.data?.message || "Invalid OTP. Please try again.";
      throw new Error(errorMessage);
    }
  };

  // Register driver function - UPDATED to accept RegistrationRequest
  const registerDriver = async (
    registrationData: RegistrationRequest
  ): Promise<any> => {
    dispatch({ type: "SIGNUP_START" });
    try {
      console.log("AuthContext: Preparing registration data...");

      // Check base64 lengths to verify they are actual data and not placeholders
      Object.keys(registrationData.documents).forEach((key) => {
        const docType = key as DocumentType;
        if (registrationData.documents[docType]) {
          const base64Length =
            registrationData.documents[docType]!.base64Image.length;
          console.log(`Document ${docType} base64 length:`, base64Length);

          // Validate base64 data is not a placeholder
          if (
            base64Length < 100 ||
            registrationData.documents[docType]!.base64Image.includes(
              "[BASE64_STRING]"
            )
          ) {
            throw new Error(
              `Invalid base64 data for document type: ${docType}`
            );
          }
        }
      });

      // Send the original request with real base64 data
      const response = await api.auth.register(registrationData);

      console.log(
        "AuthContext: Registration response received:",
        response.status
      );

      const driver = response.data;
      const token = driver.accessToken;

      if (token) {
        // Store the driver and token in SecureStore
        await Promise.all([
          SecureStore.setItemAsync("driver", JSON.stringify(driver)),
          SecureStore.setItemAsync("token", token),
        ]);

        dispatch({ type: "LOGIN_SUCCESS", payload: driver });
        return driver;
      } else {
        // Registration completed but waiting for verification
        Alert.alert(
          "Registration Complete",
          "Your registration is complete. Your documents will be reviewed shortly.",
          [{ text: "OK" }]
        );
        dispatch({ type: "SIGNUP_SUCCESS" });
        return response.data;
      }
    } catch (error: any) {
      console.error("AuthContext: Registration error:", error);

      // Try to get more error details
      if (error.response) {
        console.error(
          "Error response data:",
          JSON.stringify(error.response.data)
        );
        console.error("Error response status:", error.response.status);
      }

      const errorMessage =
        error.response?.data?.message ||
        "Failed to complete registration. Please try again.";
      dispatch({ type: "SIGNUP_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear stored data
      await Promise.all([
        SecureStore.deleteItemAsync("driver"),
        SecureStore.deleteItemAsync("token"),
        AsyncStorage.removeItem("driverId"),
      ]);

      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.auth.resetPassword({ email });
      dispatch({ type: "SET_LOADING", payload: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
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
        clearError,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};