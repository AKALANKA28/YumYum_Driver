import api from '../../context/types/api';
import { LocationData } from './trips/tripTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Format location for server
const formatLocationForServer = (locationData: LocationData) => {
  // MongoDB expects longitude first, latitude second
  return {
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    speed: locationData.speed || 0,
    heading: locationData.heading || 0,
    accuracy: locationData.accuracy || 0,
    timestamp: locationData.timestamp,
    batteryLevel: locationData.batteryLevel || 0,
    status: locationData.status || 'AVAILABLE'
  };
};

// Update driver location with retry capability
export const updateDriverLocation = async (
  driverId: string, 
  locationData: LocationData
): Promise<void> => {
  try {
    const formattedLocation = formatLocationForServer(locationData);
    await api.tracking.updateLocation(driverId, formattedLocation);
  } catch (error) {
    // Store failed update for later retry
    await storeFailedLocationUpdate(driverId, locationData);
    throw error;
  }
};

// Store failed location update for later retry
export const storeFailedLocationUpdate = async (
  driverId: string, 
  locationData: LocationData
): Promise<void> => {
  try {
    const key = 'failed_location_updates';
    const storedDataJson = await AsyncStorage.getItem(key);
    const storedData = storedDataJson ? JSON.parse(storedDataJson) : [];
    
    // Add the failed update
    storedData.push({
      driverId,
      locationData,
      timestamp: new Date().toISOString()
    });
    
    // Keep only the most recent 50 updates
    const trimmedData = storedData.slice(-50);
    
    await AsyncStorage.setItem(key, JSON.stringify(trimmedData));
    console.log(`Stored failed location update. Total pending: ${trimmedData.length}`);
  } catch (error) {
    console.error('Error storing failed location update:', error);
  }
};

// Retry stored location updates
export const retryFailedLocationUpdates = async (): Promise<{ 
  success: number; 
  failed: number; 
  remaining: number;
}> => {
  try {
    const key = 'failed_location_updates';
    const storedDataJson = await AsyncStorage.getItem(key);
    
    if (!storedDataJson) {
      return { success: 0, failed: 0, remaining: 0 };
    }
    
    const updates = JSON.parse(storedDataJson);
    
    if (updates.length === 0) {
      return { success: 0, failed: 0, remaining: 0 };
    }
    
    console.log(`Retrying ${updates.length} stored location updates`);
    
    let successCount = 0;
    let failedCount = 0;
    const remainingUpdates = [];
    
    for (const update of updates) {
      try {
        await updateDriverLocation(update.driverId, update.locationData);
        successCount++;
      } catch (error) {
        failedCount++;
        
        // Keep updates that are less than 30 minutes old
        const updateTime = new Date(update.timestamp).getTime();
        const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
        
        if (updateTime > thirtyMinutesAgo) {
          remainingUpdates.push(update);
        }
      }
    }
    
    await AsyncStorage.setItem(key, JSON.stringify(remainingUpdates));
    
    return {
      success: successCount,
      failed: failedCount,
      remaining: remainingUpdates.length
    };
  } catch (error) {
    console.error('Error retrying location updates:', error);
    return { success: 0, failed: 0, remaining: 0 };
  }
};