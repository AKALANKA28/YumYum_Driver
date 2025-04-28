import { useState, useEffect } from 'react';
import { 
  createTripRecord, 
  updateTripStatus, 
  getTripStatus 
} from '../services/navigation/trips/tripService';
import { updateDriverLocation } from '../services/navigation/locationService';
import { useDriverContext } from '../context/DriverContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData } from '../services/navigation/trips/tripTypes';

/**
 * Custom hook for managing trip creation and updates
 */
const useTripManager = (
  orderId?: string,
  orderDetails?: any
) => {
  const [tripCreated, setTripCreated] = useState(false);
  const { routeInfo } = useDriverContext();
  
  // Create trip record
  const createTrip = async () => {
    try {
      if (!orderDetails) {
        throw new Error("Order details not available");
      }
      
      // Get driver ID
      const driverId = await AsyncStorage.getItem('driverId');
      if (!driverId) {
        throw new Error("Driver ID not found");
      }
      
      // Prepare waypoints
      const waypoints = [
        // Pickup waypoint (restaurant)
        {
          type: "PICKUP" as const,
          latitude: orderDetails.restaurantCoordinates?.latitude,
          longitude: orderDetails.restaurantCoordinates?.longitude,
          address: orderDetails.restaurantAddress || orderDetails.restaurantName
        },
        // Dropoff waypoint (customer)
        {
          type: "DROPOFF" as const,
          latitude: orderDetails.deliveryCoordinates?.latitude,
          longitude: orderDetails.deliveryCoordinates?.longitude,
          address: orderDetails.deliveryAddress || orderDetails.address
        }
      ];
      
      // Get distance and duration from route info
      const estimatedDistance = routeInfo?.totalDistance || 0;
      const estimatedDuration = routeInfo?.totalDuration || 0;
      
      // Create trip record
      await createTripRecord({
        orderId: orderId || orderDetails.id,
        driverId,
        customerId: orderDetails.customerId,
        waypoints,
        estimatedDistance,
        estimatedDuration
      });
      
      setTripCreated(true);
      console.log("Trip created successfully");
      
    } catch (err) {
      console.error('Failed to create trip:', err);
      // Don't block navigation if trip creation fails
    }
  };
  
  const markAsPickedUp = async () => {
    try {
      if (!orderId) return;
      
      // First update the trip status through the API
      await updateTripStatus(orderId, 'pickup');
      
      // Then update the driver location with status
      await updateDriverStatusWithCurrentLocation('DELIVERING');
      
      console.log("Order marked as picked up");
    } catch (error) {
      console.error("Error marking order as picked up:", error);
    }
  };
  
  const markAsDelivered = async () => {
    try {
      if (!orderId) return;
      
      // Update trip status
      await updateTripStatus(orderId, 'delivered');
      
      // Update driver status to AVAILABLE
      await updateDriverStatusWithCurrentLocation('AVAILABLE');
      
      console.log("Order marked as delivered");
    } catch (error) {
      console.error("Error marking order as delivered:", error);
    }
  };
  
  // Helper to update driver status with current location
  const updateDriverStatusWithCurrentLocation = async (status: 'AVAILABLE' | 'PICKING_UP' | 'DELIVERING' | 'COMPLETED') => {
    try {
      const driverId = await AsyncStorage.getItem('driverId');
      if (!driverId) return;
      
      // Get current position
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const locationData: LocationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                heading: position.coords.heading || 0,
                speed: position.coords.speed || 0,
                timestamp: position.timestamp,
                status
              };
              
              await updateDriverLocation(driverId, locationData);
              resolve(true);
            } catch (err) {
              reject(err);
            }
          },
          (error) => {
            console.error("Failed to get current position:", error);
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      });
    } catch (err) {
      console.error("Failed to update driver status:", err);
    }
  };
  
  return {
    tripCreated,
    createTrip,
    markAsPickedUp,
    markAsDelivered
  };
};

export default useTripManager;