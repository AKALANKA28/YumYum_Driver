// Enum to match backend DocumentType
export enum DocumentType {
    PROFILE_PHOTO = "PROFILE_PHOTO",
    DRIVING_LICENSE = "DRIVING_LICENSE",
    VEHICLE_INSURANCE = "VEHICLE_INSURANCE",
    REVENUE_LICENSE = "REVENUE_LICENSE",
    VEHICLE_REGISTRATION = "VEHICLE_REGISTRATION"
  }
  
  // Interface to match DocumentUploadMetadata DTO
  export interface DocumentUploadMetadata {
    base64Image: string;
    fileName: string;
    contentType: string;
    expiryDate?: string; // LocalDateTime in backend
  }
  
  // Interface for driver registration request
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