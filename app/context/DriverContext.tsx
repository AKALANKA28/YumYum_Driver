import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import { Region } from "react-native-maps";
import { router } from "expo-router";
import * as Battery from "expo-battery";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./types/api";
import MapboxGL from "@rnmapbox/maps";
import { DriverContextType, Restaurant, RouteInfo } from "./types/driver";
import { fetchNearbyRestaurants } from "../services/fetchNearbyRestaurants";

const { width } = Dimensions.get("window");
const ASPECT_RATIO = width / Dimensions.get("window").height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const DriverContext = createContext<DriverContextType | undefined>(undefined);

export const DriverContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State
  const [isOnline, setIsOnline] = useState(false);
  const [isFindingOrders, setIsFindingOrders] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<Location.LocationSubscription | null>(
    null
  );
  const [showingOrderDetails, setShowingOrderDetails] = useState(false);
  const [orderRoute, setOrderRoute] = useState<any[] | null>(null);
  const [orderTimer, setOrderTimer] = useState(15);

  // Add route info state
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // Stats data
  const [currency, setCurrency] = useState("LKR");
  const [earnings, setEarnings] = useState("2,850");

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);

  // Order details
  const [orderDetails, setOrderDetails] = useState({
    restaurantName: "Assembly (Quincy)",
    address: "Hancock St & MA-3A, Quincy",
    city: "Quincy, MA",
    time: "10 min",
    distance: "0.7 mi",
    payment: "780.00",
    restaurantCoordinates: {
      latitude: 6.8517,
      longitude: 80.0327,
    },
    customerCoordinates: {
      latitude: 6.8731942,
      longitude: 80.017573,
    },
  });

  // Animation values
  const buttonWidth = useRef(new Animated.Value(150)).current;
  const buttonHeight = useRef(new Animated.Value(50)).current;
  const buttonBottom = useRef(new Animated.Value(30)).current;
  const buttonLeft = useRef(new Animated.Value((width - 150) / 2)).current;
  const buttonBorderRadius = useRef(new Animated.Value(30)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const orderDetailsOpacity = useRef(new Animated.Value(0)).current;
  const timerProgress = useRef(new Animated.Value(1)).current;

  // Add route info update method
  const updateRouteInfo = (info: RouteInfo) => {
    setRouteInfo(info);

    // Format distance and duration for display in orderDetails if needed
    const formattedDistance = formatDistance(info.totalDistance);
    const formattedDuration = formatDuration(info.totalDuration);

    // Update order details with real route information
    setOrderDetails((prev) => ({
      ...prev,
      time: formattedDuration,
      distance: formattedDistance,
    }));

    console.log("Route info updated in context:", {
      distance: formattedDistance,
      duration: formattedDuration,
    });
  };

  // Helper functions to format distance and duration
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      // For US audience, convert to miles
      const miles = meters / 1609.34;
      return `${miles.toFixed(1)} mi`;
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)} sec`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)} min`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.round((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  // For the timer circular progress
  const timerStrokeAnimation = timerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });


  const mapRef = useRef<MapboxGL.MapView>(null);
  const appState = useRef(AppState.currentState);

  // Order timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (showingOrderDetails && orderTimer > 0) {
      interval = setInterval(() => {
        setOrderTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            // Auto-decline the order when timer ends
            setTimeout(() => declineOrder(), 200);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      // Animate timer progress
      Animated.timing(timerProgress, {
        toValue: 0,
        duration: orderTimer * 1000,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showingOrderDetails, orderTimer]);

  // Initialize location tracking
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          setIsLoading(false);
          return;
        }

        // Get the current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setCurrentLocation(location);
        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error getting location:", err);
        setError("Could not get your location. Please try again.");
        setIsLoading(false);
      }
    })();

    // Set up app state listener for background/foreground transitions
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        handleAppStateChange(nextAppState);
      }
    );

    return () => {
      // Clean up location watch subscription
      if (watchId) {
        watchId.remove();
      }

      // Clean up app state subscription
      appStateSubscription.remove();
    };
  }, []);

  // Add this effect to fetch restaurants when driver goes online
  useEffect(() => {
    if (isOnline && currentLocation) {
      fetchNearbyRestaurantsData();
    } else {
      setRestaurants([]);
    }
  }, [isOnline, currentLocation]);

  // Add this function to fetch nearby restaurants
  const fetchNearbyRestaurantsData = async () => {
    if (!currentLocation) return;

    setIsLoadingRestaurants(true);
    try {
      const nearbyRestaurants = await fetchNearbyRestaurants(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        10000
      );
      setRestaurants(nearbyRestaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setRestaurants([]);
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // App has come to the foreground
      if (isOnline && !watchId) {
        startLocationUpdates();
      }
    } else if (
      nextAppState.match(/inactive|background/) &&
      appState.current === "active"
    ) {
      // App has gone to the background
      if (watchId) {
        watchId.remove();
        setWatchId(null);
      }
    }

    appState.current = nextAppState;
  };

  const stopLocationUpdates = () => {
    if (watchId) {
      watchId.remove();
      setWatchId(null);
    }
  };

  const toggleOnlineStatus = async () => {
    
    if (isOnline) {
      // Going offline
      console.log("Going OFFLINE...");
      setIsFindingOrders(false);

      // First animate the button back to the original style
      resetButtonToDefault(async () => {
        // Then set the online status to false
        stopLocationUpdates();
        setIsOnline(false);

        // Update driver status on the server
        try {
          const driverId = await AsyncStorage.getItem("driverId");
          if (driverId && currentLocation) {
            console.log("Updating server with OFFLINE status...");

            // Use the correct endpoint and data structure
            await api.tracking.updateDriverStatus(
              driverId,
              "OFFLINE",
              currentLocation.coords.latitude,
              currentLocation.coords.longitude
            );

            console.log("Server status updated to OFFLINE");
          }
        } catch (error) {
          console.error("Failed to update offline status:", error);
        }

        console.log("Driver is now OFFLINE");
      });
    } else {
      // Going online
      console.log("Going ONLINE...");
      try {
        // First set online state to true immediately
        setIsOnline(true);

        // Also set finding orders state immediately - this is the key change
        setIsFindingOrders(true);

        // Start the finding orders animation right away
        animateToFindingOrders();

        // Then start location updates in the background
        await startLocationUpdates();

        // Update driver status on the server
        try {
          const driverId = await AsyncStorage.getItem("driverId");
          if (driverId && currentLocation) {
            console.log("Updating server with ONLINE status...");

            // Use the correct endpoint and data structure
            await api.tracking.updateDriverStatus(
              driverId,
              "AVAILABLE",
              currentLocation.coords.latitude,
              currentLocation.coords.longitude
            );

            console.log("Server status updated to ONLINE/AVAILABLE");
          }
        } catch (error) {
          console.error("Failed to update online status:", error);
        }

        console.log("Driver is now ONLINE");
      } catch (err) {
        // If there's an error, revert states
        setIsOnline(false);
        setIsFindingOrders(false);
        resetButtonToDefault();

        console.error("Error going online:", err);
        Alert.alert(
          "Error",
          "Could not start location tracking. Please try again."
        );
      }
    }
  };

  const startLocationUpdates = async () => {
    console.log("Starting location updates...");

    // Get battery level if possible
    let batteryLevel = null;
    try {
      const battery = await Battery.getBatteryLevelAsync();
      batteryLevel = battery;
    } catch (err) {
      console.log("Battery information not available");
    }

    // Get driver ID from secure storage
    let driverId;
    try {
      driverId = await AsyncStorage.getItem("driverId");

      if (!driverId) {
        console.error("Driver ID not found, cannot update location");
      }
    } catch (error) {
      console.error("Error retrieving driver ID:", error);
      return;
    }

    try {
      // Set online state first, before setting up the watcher
      setIsOnline(true);

      const locationWatchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (location) => {
          // Update current location in state
          setCurrentLocation(location);

          // Only send location updates if there's significant change
          if (
            !currentLocation ||
            Math.abs(
              location.coords.latitude - currentLocation.coords.latitude
            ) > 0.0001 ||
            Math.abs(
              location.coords.longitude - currentLocation.coords.longitude
            ) > 0.0001
          ) {
            console.log(
              `New location: ${location.coords.latitude.toFixed(
                5
              )}, ${location.coords.longitude.toFixed(5)}`
            );

            try {
              // Create the location data object as expected by the API
              const locationData = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy || 0,
                heading: location.coords.heading || 0,
                speed: location.coords.speed || 0,
                altitude: location.coords.altitude || 0,
                timestamp: location.timestamp,
                batteryLevel: batteryLevel || 0,
              };

              // Send location update using the updateLocation endpoint
              if (driverId) {
                await api.tracking.updateLocation(driverId, locationData);
              } else {
                console.error("Cannot update location: Driver ID is null");
              }
            } catch (error: any) {
              console.error("Failed to update location:", error?.message);
            }
          }
        }
      );

      // Store the subscription so we can remove it later
      setWatchId(locationWatchId);
    } catch (error: any) {
      console.error("Error setting up location tracking:", error?.message);
      throw error;
    }
  };
  const acceptOrder = async () => {
    try {
      // await apiClient.post('/orders/accept', { orderId: orderDetails.id });

      // Close the order details container
      closeOrderDetails(() => {
        // Navigate to active delivery screen
        // router.push("/(app)/activeDelivery");
      });
    } catch (error) {
      console.error("Failed to accept order:", error);
    }
  };

  const declineOrder = async () => {
    try {
      // await apiClient.post('/orders/decline', { orderId: orderDetails.id });

      closeOrderDetails(() => {
        // Back to finding orders state
        animateToFindingOrders();
      });
    } catch (error) {
      console.error("Failed to decline order:", error);
      Alert.alert("Error", "Could not decline the order. Please try again.");
    }
  };
  const resetButtonToDefault = (callback?: () => void) => {
    // Animate back to default button
    Animated.parallel([
      Animated.timing(buttonWidth, {
        toValue: 150,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(buttonHeight, {
        toValue: 50,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(buttonBottom, {
        toValue: 30,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(buttonLeft, {
        toValue: (width - 150) / 2,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(buttonBorderRadius, {
        toValue: 30,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const animateToFindingOrders = () => {
    // Animate to finding orders state
    setIsFindingOrders(true);
    Animated.parallel([
      Animated.timing(buttonWidth, {
        toValue: 200,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(buttonLeft, {
        toValue: (width - 200) / 2,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const cancelFindingOrders = () => {
    // Cancel finding orders but stay online
    setIsFindingOrders(false);
    Animated.parallel([
      Animated.timing(buttonWidth, {
        toValue: 150,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(buttonLeft, {
        toValue: (width - 150) / 2,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Function to receive an order - in production, connect to your API
  // Update this function in DriverContext.tsx
  const receiveOrder = () => {
    if (!currentLocation) return;

    // Create a proper route with well-separated points to show the route clearly
    const restaurantCoordinates = {
      latitude: currentLocation.coords.latitude + 0.005,
      longitude: currentLocation.coords.longitude + 0.005,
    };

    const customerCoordinates = {
      latitude: currentLocation.coords.latitude + 0.01,
      longitude: currentLocation.coords.longitude + 0.01,
    };

    // Set order route for drawing on the map - contains both restaurant and customer locations
    const routePoints = [
      restaurantCoordinates, // First point is the restaurant
      customerCoordinates, // Second point is the customer
    ];

    console.log("Generated order route points:", routePoints);
    setOrderRoute(routePoints);

    // Reset route info when receiving new order
    setRouteInfo(null);

    // Ensure proper order details with coordinates
    setOrderDetails({
      restaurantName: "Savoury Bites, High Level Road, Homagama",
      address: "Habarakada-Ranala Road, 10654",
      city: "Godagama",
      time: "Calculating...", // Will be updated when route info arrives
      distance: "Calculating...", // Will be updated when route info arrives
      payment: "372.00",
      restaurantCoordinates: restaurantCoordinates,
      customerCoordinates: customerCoordinates,
    });

    // Reset the timer
    setOrderTimer(15);
    timerProgress.setValue(1);

    // Show order details
    animateButtonToOrderDetails();
  };

  const animateButtonToOrderDetails = () => {
    // Hide finding orders state and show order details
    setIsFindingOrders(false);
    setShowingOrderDetails(true);

    // First fade out the current content
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      // Then expand the button into a full container
      Animated.parallel([
        // Expand width to almost full screen width with proper margins
        Animated.timing(buttonWidth, {
          toValue: width - 32, // 16px margin on each side
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(buttonHeight, {
          toValue: 390,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(buttonBottom, {
          toValue: 16,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(buttonLeft, {
          toValue: 16,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(buttonBorderRadius, {
          toValue: 28,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Fade in the order details content
        Animated.timing(orderDetailsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    });
  };

  // When closing order details, also reset route info
  const closeOrderDetails = (callback?: () => void) => {
    // First fade out order details content
    Animated.timing(orderDetailsOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      // Then shrink the container back to a button
      resetButtonToDefault(() => {
        setShowingOrderDetails(false);
        setOrderRoute(null);
        setRouteInfo(null); // Clear route info
        if (callback) callback();
      });
    });
  };

  const handleGoToSettings = () => {
    router.push("/(app)/settings");
  };

  return (
    <DriverContext.Provider
      value={{
        // State
        isOnline,
        isFindingOrders,
        showingOrderDetails,
        setIsLoading,
        currentLocation,
        initialRegion,
        isLoading,
        error,
        orderRoute,
        orderTimer,
        currency,
        earnings,
        orderDetails,        
        routeInfo,
        restaurants,
        isLoadingRestaurants,
        fetchNearbyRestaurantsData,

        // Animation values
        buttonWidth,
        buttonHeight,
        buttonBottom,
        buttonLeft,
        buttonBorderRadius,
        contentOpacity,
        orderDetailsOpacity,
        timerProgress,

        // Methods
        toggleOnlineStatus,
        cancelFindingOrders,
        acceptOrder,
        declineOrder,
        handleGoToSettings,
        receiveOrder,
        animateToFindingOrders,
        updateRouteInfo, // Add route info update method
        timerStrokeAnimation,

        // Refs
        mapRef,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

// Create a hook for using the context
export const useDriverContext = () => {
  const context = useContext(DriverContext);
  if (context === undefined) {
    throw new Error(
      "useDriverContext must be used within a DriverContextProvider"
    );
  }
  return context;
};

export default DriverContextProvider;
