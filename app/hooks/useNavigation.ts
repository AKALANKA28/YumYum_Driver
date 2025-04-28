import { useState, useEffect } from 'react';
import { mapCoordinatesForNavigation } from '../services/navigation/mapboxService';
import { updateDriverLocation } from '../services/navigation/locationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData } from '../services/navigation/trips/tripTypes';

/**
 * Custom hook for managing navigation state and coordinates
 */
const useNavigation = (
  navigationMode: 'pickup' | 'delivery', 
  orderDetails: any, 
  driverLocation: any
) => {
  const [coordinates, setCoordinates] = useState<any[]>([]);
  const [navigationOptions, setNavigationOptions] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const setupNavigation = async () => {
      setIsLoading(true);
      try {
        if (!orderDetails) {
          throw new Error("Order details not available");
        }
        
        if (navigationMode === 'pickup') {
          await setupPickupNavigation();
        } else {
          await setupDeliveryNavigation();
        }
      } catch (err) {
        console.error('Error setting up navigation:', err);
        setError('Failed to load navigation. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    setupNavigation();
  }, [navigationMode, orderDetails, driverLocation]);
  
  const setupPickupNavigation = async () => {
    if (!driverLocation) {
      throw new Error('Unable to get your current location');
    }
    
    // Format coordinates for MapboxNavigationView
    const formattedCoordinates = mapCoordinatesForNavigation(
      driverLocation.coords,
      orderDetails.restaurantCoordinates,
      "Your Location",
      orderDetails.restaurantName || "Restaurant"
    );
    
    setCoordinates(formattedCoordinates);
    
    // Set navigation options
    setNavigationOptions({
      showsEndOfRouteFeedback: true,
      shouldSimulateRoute: __DEV__, // Simulate in dev, real navigation in production
      simulateRoute: __DEV__,
      showsSpeedLimit: true,
      language: "en",
      units: "imperial", // or metric
      mapStyleURL: "mapbox://styles/mapbox/navigation-night-v1",
    });
    
    // Update driver status to PICKING_UP
    await updateDriverStatusLocation(driverLocation.coords, 'PICKING_UP');
  };
  
  const setupDeliveryNavigation = async () => {
    // Format coordinates for delivery - from restaurant to customer
    const formattedCoordinates = mapCoordinatesForNavigation(
      orderDetails.restaurantCoordinates,
      orderDetails.deliveryCoordinates,
      orderDetails.restaurantName || "Restaurant",
      "Customer"
    );
    
    setCoordinates(formattedCoordinates);
    
    // Set navigation options
    setNavigationOptions({
      showsEndOfRouteFeedback: true,
      shouldSimulateRoute: __DEV__,
      simulateRoute: __DEV__,
      showsSpeedLimit: true,
      language: "en",
      units: "imperial",
      mapStyleURL: "mapbox://styles/mapbox/navigation-night-v1",
    });
    
    // Update driver status to DELIVERING
    if (driverLocation) {
      await updateDriverStatusLocation(driverLocation.coords, 'DELIVERING');
    }
  };
  
  // Handle progress updates during navigation
  const handleNavigationProgress = async (event: any) => {
    if (event.latitude && event.longitude) {
      try {
        const driverId = await AsyncStorage.getItem('driverId');
        if (!driverId) return;
        
        // Create location data that matches your schema
        const locationData: LocationData = {
          latitude: event.latitude,
          longitude: event.longitude,
          heading: event.heading || 0,
          speed: event.speed || 0,
          accuracy: event.horizontalAccuracy || 10,
          altitude: event.altitude || 0,
          timestamp: new Date().getTime(),
          batteryLevel: event.batteryLevel || 0.5,
          status: navigationMode === 'pickup' ? 'PICKING_UP' : 'DELIVERING'
        };
        
        await updateDriverLocation(driverId, locationData);
      } catch (error) {
        console.log("Failed to update location during navigation", error);
      }
    }
  };
  
  // Update driver location with status
  const updateDriverStatusLocation = async (coords: any, status: 'AVAILABLE' | 'PICKING_UP' | 'DELIVERING' | 'COMPLETED') => {
    try {
      const driverId = await AsyncStorage.getItem('driverId');
      if (!driverId) return;
      
      const locationData: LocationData = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy || 10,
        heading: coords.heading || 0,
        speed: coords.speed || 0,
        timestamp: new Date().getTime(),
        status
      };
      
      await updateDriverLocation(driverId, locationData);
    } catch (error) {
      console.error("Failed to update driver status location:", error);
    }
  };
  
  // Handle navigation errors
  const handleNavigationError = (event: any) => {
    console.error("Navigation error:", event);
    setError(`Navigation error: ${event.message || 'Unknown error'}`);
  };
  
  return {
    coordinates,
    navigationOptions,
    isLoading,
    error,
    handleNavigationProgress,
    handleNavigationError
  };
};

export default useNavigation;