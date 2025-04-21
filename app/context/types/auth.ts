// User and authentication types
export interface LoginCredentials {
  loginIdentifier: string;
  password: string;
}

export interface Driver {
  id?: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  // Other fields as needed
}

export enum DocumentType {
  PROFILE_PHOTO = "PROFILE_PHOTO",
  DRIVING_LICENSE = "DRIVING_LICENSE",
  VEHICLE_INSURANCE = "VEHICLE_INSURANCE",
  REVENUE_LICENSE = "REVENUE_LICENSE",
  VEHICLE_REGISTRATION = "VEHICLE_REGISTRATION",
}

export interface DocumentUploadMetadata {
  base64Image: string;
  fileName: string;
  contentType: string;
  expiryDate?: string;
}

export interface RegistrationRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  licenseNumber: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  licensePlate: string;
  vehicleColor: string;
  documents: {
    [key in DocumentType]?: DocumentUploadMetadata;
  };
}

// API parameter types
export interface VerificationParams {
  phoneNumber: string;
  code: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  batteryLevel?: number;
  status?: string;
}

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface VehicleData {
  vehicleType?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  licensePlate?: string;
  vehicleColor?: string;
}