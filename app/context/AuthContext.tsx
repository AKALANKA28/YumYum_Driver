import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { API_BASE_URL } from "./types/api";
import FormStorage from "../utils/FormStorage";
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import {
  LoginCredentials,
  Driver,
  DocumentType,
  DocumentUploadMetadata,
  RegistrationRequest,
} from "./types/auth";

// Auth state interface
interface AuthState {
  isAuthenticated: boolean;
  driver: Driver | null;
  isLoading: boolean;
  error: string | null;
  isPhoneVerified: boolean; // New field to track phone verification
  verifiedPhoneNumber: string | null; // Store the verified phone number
}

// Define initial auth state
const initialState: AuthState = {
  isAuthenticated: false,
  driver: null,
  isLoading: true,
  error: null,
  isPhoneVerified: false,
  verifiedPhoneNumber: null,
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
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "PHONE_VERIFIED";
      payload: { phoneNumber: string; verificationId: string };
    };

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
    case "PHONE_VERIFIED":
      return {
        ...state,
        isPhoneVerified: true,
        verifiedPhoneNumber: action.payload.phoneNumber,
        isLoading: false,
        error: null,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        driver: null,
        isLoading: false,
        error: null,
        isPhoneVerified: false, // Clear verification status on logout
        verifiedPhoneNumber: null,
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

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        console.log("Checking login status from storage...");

        // Get auth data from SecureStore
        const [token, driverStr] = await Promise.all([
          SecureStore.getItemAsync("token"),
          SecureStore.getItemAsync("driver"),
        ]);

        // Handle full authentication first
        if (token && driverStr) {
          try {
            const driver = JSON.parse(driverStr);
            if (driver && driver.id) {
              dispatch({ type: "LOGIN_SUCCESS", payload: driver });
              return;
            }
          } catch (parseError) {
            console.error("Error parsing driver data:", parseError);
          }
        }

        // If not authenticated, check for verification status
        const verificationData = await FormStorage.getVerificationData();

        if (verificationData) {
          const { phoneNumber, verificationId, timestamp } = verificationData;

          // Check if verification is still valid (within 24 hours)
          const isStillValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;

          if (isStillValid) {
            console.log(
              "Found valid verification data, restoring verification state"
            );
            dispatch({
              type: "PHONE_VERIFIED",
              payload: { phoneNumber, verificationId },
            });
            return;
          } else {
            console.log("Verification data expired, clearing it");
            await FormStorage.clearVerificationData();
          }
        }

        // No valid auth or verification found
        dispatch({ type: "SET_LOADING", payload: false });
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
      console.log("Attempting login with credentials:", {
        loginIdentifier: credentials.loginIdentifier,
        password: "********", // Don't log actual password
      });
      console.log("Using API URL:", API_BASE_URL);

      const response = await api.auth.login({
        loginIdentifier: credentials.loginIdentifier,
        password: credentials.password,
      });

      console.log("Login response status:", response.status);
      console.log("Login response data keys:", Object.keys(response.data));

      // Extract token
      const authToken = response.data.accessToken || response.data.token;

      // Create a driver object with proper ID mapping
      const driverData = {
        // Map driverId to id for consistency
        id: response.data.driverId || response.data.id,
        username: response.data.username,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber,
        // Add other fields as needed
      };

      // Validate we have what we need
      if (!authToken) {
        console.error("No token found in response");
        throw new Error("Authentication failed: No token received");
      }

      if (!driverData.id) {
        console.error("No driver ID found in response data");
        driverData.id = `temp-${Date.now()}`; // Create a temporary ID if none exists
      }

      // Save token to secure storage
      await SecureStore.setItemAsync("token", authToken);

      // Save driver data to secure storage (not AsyncStorage)
      await SecureStore.setItemAsync("driver", JSON.stringify(driverData));

      // Save driver ID to AsyncStorage for easier access in other parts of the app
      await AsyncStorage.setItem("driverId", driverData.id.toString());

      console.log("Login data saved successfully:", {
        token: authToken.substring(0, 10) + "...",
        driverId: driverData.id,
      });

      // Update auth state with the driver data
      dispatch({ type: "LOGIN_SUCCESS", payload: driverData });
    } catch (error: any) {
      console.error("Login error:", error);

      // Enhanced error logging
      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error message:", error.message);
      }

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to login. Please try again.";

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

      const payload = {
        phoneNumber: params.phoneNumber,
        code: params.otp || params.code,
      };

      console.log("Sending verification request with payload:", payload);

      const response = await api.auth.verify(payload);
      console.log("OTP verification successful, response:", response.data);

      // Store verification data in secure storage with timestamp
      const verificationData = {
        phoneNumber: params.phoneNumber,
        verificationId:
          response.data.verificationId || response.data.token || "",
        timestamp: Date.now(), // Add timestamp for expiry checks
      };

      await SecureStore.setItemAsync(
        "verificationData",
        JSON.stringify(verificationData)
      );

      await FormStorage.saveVerificationData({
        phoneNumber: params.phoneNumber,
        verificationId:
          response.data.verificationId || response.data.token || "",
        timestamp: Date.now(),
      });

      // Update state to reflect verified phone
      dispatch({
        type: "PHONE_VERIFIED",
        payload: {
          phoneNumber: params.phoneNumber,
          verificationId: verificationData.verificationId,
        },
      });

      return verificationData.verificationId;
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

      // Create a deep copy of the registration data
      const optimizedRegistrationData = {
        ...registrationData,
        documents: { ...registrationData.documents },
      };

      // Optimize all images before sending
      for (const key of Object.keys(registrationData.documents)) {
        const docType = key as DocumentType;
        if (registrationData.documents[docType]) {
          try {
            console.log(`Optimizing document: ${docType}`);

            // Get the original base64 image
            const originalBase64 =
              registrationData.documents[docType]!.base64Image;

            // Validate base64 data is not a placeholder
            if (
              originalBase64.length < 100 ||
              originalBase64.includes("[BASE64_STRING]")
            ) {
              throw new Error(
                `Invalid base64 data for document type: ${docType}`
              );
            }

            // Create a data URL from the base64 string
            const dataUrl = `data:image/jpeg;base64,${originalBase64}`;

            // Create a temporary file path
            const tempUri = FileSystem.documentDirectory + `temp-image-${Date.now()}.jpg`;
            // Write the base64 data to the temporary file
            await FileSystem.writeAsStringAsync(tempUri, originalBase64, { encoding: FileSystem.EncodingType.Base64 });
            // Use the temp file URI for ImageManipulator
            const uri = tempUri;

            // Optimize the image
            const optimizedImage = await ImageManipulator.manipulateAsync(
              uri,
              [{ resize: { width: 1200 } }], // Resize to 1200px width
              { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
            );

            // Convert back to base64
            const optimizedBase64 = await FileSystem.readAsStringAsync(
              optimizedImage.uri,
              { encoding: FileSystem.EncodingType.Base64 }
            );

            // Update the registration data with optimized image
            optimizedRegistrationData.documents[docType]!.base64Image =
              optimizedBase64;

            console.log(
              `${docType} optimized: ${originalBase64.length} → ${optimizedBase64.length} bytes` +
                ` (${Math.round(
                  (optimizedBase64.length / originalBase64.length) * 100
                )}%)`
            );

            // Clean up the temporary file
            await FileSystem.deleteAsync(uri, { idempotent: true });
          } catch (optError) {
            console.error(`Error optimizing ${docType}:`, optError);
            // Continue with original if optimization fails
          }
        }
      }

      console.log("Images optimized, sending registration data...");

      // Send the request with optimized images
      const response = await api.auth.register(optimizedRegistrationData);

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

        // Registration successful with token, clear temporary form data
        await FormStorage.clearAllFormData();
        await FormStorage.clearVerificationData();

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

      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
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
      // Clear all stored data including verification
      await Promise.all([
        SecureStore.deleteItemAsync("driver"),
        SecureStore.deleteItemAsync("token"),
        SecureStore.deleteItemAsync("verificationData"), // Add this line
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

export default AuthProvider;
