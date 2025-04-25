import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SIGNUP_FORM: 'signup_form_data',
  PERSONAL_INFO: 'personal_info_form_data',
  VEHICLE_INFO: 'vehicle_info_form_data',
  VERIFICATION_DATA: 'verification_data'
};

export interface VerificationData {
  phoneNumber: string;
  verificationId: string;
  timestamp: number;
}

/**
 * FormStorage - Utility for storing and retrieving form data during multi-step registration
 */
const FormStorage = {
  /**
   * Save personal info form data
   */
  savePersonalInfo: async (data: any): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PERSONAL_INFO, JSON.stringify(data));
      console.log('Personal info saved to storage');
    } catch (error) {
      console.error('Error saving personal info:', error);
    }
  },

  /**
   * Retrieve personal info form data
   */
  getPersonalInfo: async (): Promise<any> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PERSONAL_INFO);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving personal info:', error);
      return null;
    }
  },

  /**
   * Save vehicle info form data
   */
  saveVehicleInfo: async (data: any): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLE_INFO, JSON.stringify(data));
      console.log('Vehicle info saved to storage');
    } catch (error) {
      console.error('Error saving vehicle info:', error);
    }
  },

  /**
   * Retrieve vehicle info form data
   */
  getVehicleInfo: async (): Promise<any> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.VEHICLE_INFO);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving vehicle info:', error);
      return null;
    }
  },

  /**
   * Save verification data (phone + verification ID)
   */
  saveVerificationData: async (data: VerificationData): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VERIFICATION_DATA, JSON.stringify(data));
      console.log('Verification data saved to storage');
    } catch (error) {
      console.error('Error saving verification data:', error);
    }
  },

  /**
   * Retrieve verification data
   */
  getVerificationData: async (): Promise<VerificationData | null> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.VERIFICATION_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving verification data:', error);
      return null;
    }
  },

  /**
   * Clear all temporary registration data after completion
   */
  clearAllFormData: async (): Promise<void> => {
    try {
      const keys = [
        STORAGE_KEYS.PERSONAL_INFO,
        STORAGE_KEYS.VEHICLE_INFO,
      ];
      await AsyncStorage.multiRemove(keys);
      console.log('All form data cleared');
    } catch (error) {
      console.error('Error clearing form data:', error);
    }
  },

  /**
   * Clear verification data after successful registration
   */
  clearVerificationData: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.VERIFICATION_DATA);
      console.log('Verification data cleared');
    } catch (error) {
      console.error('Error clearing verification data:', error);
    }
  }
};

export default FormStorage;