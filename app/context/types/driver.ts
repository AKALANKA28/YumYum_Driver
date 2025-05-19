import React from "react";
import {Animated} from "react-native";
import * as Location from "expo-location";
import { Region } from "react-native-maps";
import MapboxGL from "@rnmapbox/maps";



export interface RouteInfo {
  pickupDistance: number;
  pickupDuration: number;
  deliveryDistance: number;
  deliveryDuration: number;
  totalDistance: number;
  totalDuration: number;
}

export interface User {
  fullName: string;
  email: string;
  phone: string;
  rating: number;
  completedDeliveries: number;
}


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


export interface OrderAssignmentNotification {
  orderId: number;
  orderNumber: string;
  payment: string;
  currency: string;
  expiryTime: string;
  timestamp: number;
  
  // Restaurant pickup details
  restaurantName: string;
  pickupAddress: string;
  restaurantCoordinates: {
    latitude: number;
    longitude: number;
  };
  
  // Customer delivery details
  deliveryAddress: string;
  customerName: string;
  phoneNumber: string;
  customerCoordinates: {
    latitude: number;
    longitude: number;
  };
  
  // Order information
  deliveryFee?: number;
  specialInstructions?: string;
}



// Define context type
export interface DriverContextType {
  // State
  isOnline: boolean;
  isFindingOrders: boolean;
  showingOrderDetails: boolean;
  currentLocation: Location.LocationObject | null;
  initialRegion: Region | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  orderRoute: any[] | null;
  orderTimer: number;
  currency: string;
  earnings: string;
  orderDetails: {
    currentRoute?: {
      restaurantCoordinates?: {
        latitude: number;
        longitude: number;
      };
      customerCoordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    
    restaurantName: string;
    time: string;
    distance: string;
    address: string;
    city: string;
    payment: string;
  };
  restaurants: Restaurant[];
  isLoadingRestaurants: boolean;
  fetchNearbyRestaurantsData: () => Promise<void>;

  // Animation values
  buttonWidth: Animated.Value;
  buttonHeight: Animated.Value;
  buttonBottom: Animated.Value;
  buttonLeft: Animated.Value;
  buttonBorderRadius: Animated.Value;
  contentOpacity: Animated.Value;
  orderDetailsOpacity: Animated.Value;
  timerProgress: Animated.Value;

  // Methods
  toggleOnlineStatus: () => Promise<void>;
  cancelFindingOrders: () => void;
  acceptOrder: () => void;
  declineOrder: () => void;
  handleGoToSettings: () => void;
  // receiveOrder: () => void;
  animateToFindingOrders: () => void;
  updateRouteInfo: (info: RouteInfo) => void; 
  timerStrokeAnimation: Animated.AnimatedInterpolation<string | number>;

  // Refs
  mapRef: React.RefObject<MapboxGL.MapView>;
  routeInfo: RouteInfo | null;

  isAccepting: boolean;
  isRejecting: boolean;

}

