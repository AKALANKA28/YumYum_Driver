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
import api, { API_BASE_URL } from "./types/api";
import MapboxGL from "@rnmapbox/maps";
import { DriverContextType, Restaurant, RouteInfo } from "./types/driver";
import { fetchNearbyRestaurants } from "../services/fetchNearbyRestaurants";
import { Client } from "@stomp/stompjs";
import { createStompClient } from "../utils/websocket-client";

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
  const [driver, setDriver] = useState<{ id: string | null }>({ id: null });

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);

  // Order details
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // WebSocket client
  const [stompClient, setStompClient] = useState<Client | null>(null);

  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  // Animation values
  const buttonWidth = useRef(new Animated.Value(150)).current;
  const buttonHeight = useRef(new Animated.Value(50)).current;
  const buttonBottom = useRef(new Animated.Value(30)).current;
  const buttonLeft = useRef(new Animated.Value((width - 150) / 2)).current;
  const buttonBorderRadius = useRef(new Animated.Value(30)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const orderDetailsOpacity = useRef(new Animated.Value(0)).current;
  const timerProgress = useRef(new Animated.Value(1)).current;
  const websocketRef = useRef<any>(null);
  const websocketClientRef = useRef<any>(null);

  // For the timer circular progress
  const timerStrokeAnimation = timerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const mapRef = useRef<MapboxGL.MapView>(null);
  const appState = useRef(AppState.currentState);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Load driver information on mount
  useEffect(() => {
    loadDriverInfo();
  }, []);

  // Load driver ID from storage
  const loadDriverInfo = async () => {
    try {
      const driverId = await AsyncStorage.getItem("driverId");
      setDriver({ id: driverId });
    } catch (error) {
      console.error("Error loading driver info:", error);
    }
  };

  // Connect to WebSocket when driver goes online
  useEffect(() => {
    if (isOnline && driver.id) {
      connectWebSocket();
    } else if (!isOnline && stompClient) {
      disconnectWebSocket();
    }
  }, [isOnline, driver.id]);

  // Add route info update method
  const updateRouteInfo = (info: RouteInfo) => {
    setRouteInfo(info);

    // Update order details with real route information if orderDetails exists
    if (orderDetails) {
      setOrderDetails((prev: any) => ({
        ...prev,
        time: formatDuration(info.totalDuration),
        distance: formatDistance(info.totalDistance),
      }));
    }
  };

  // Helper functions to format distance and duration
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
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

  useEffect(() => {
    if (showingOrderDetails && orderTimer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setOrderTimer((prevTimer) => {
          if (prevTimer <= 1) {
            if (timerIntervalRef.current)
              clearInterval(timerIntervalRef.current);
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
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
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
    setIsLoadingRestaurants(true);
    try {
      const nearbyRestaurants = await fetchNearbyRestaurants();
      // Make sure we have a valid array of restaurants
      if (Array.isArray(nearbyRestaurants)) {
        setRestaurants(nearbyRestaurants);
      } else {
        console.warn("Restaurants data is not an array:", nearbyRestaurants);
        setRestaurants([]);
      }
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
      setIsFindingOrders(false);

      // First animate the button back to the original style
      resetButtonToDefault(async () => {
        // Then set the online status to false
        stopLocationUpdates();
        setIsOnline(false);

        // Update driver status on the server
        try {
          const driverId = await AsyncStorage.getItem("driverId");
          if (driverId) {
            await api.drivers.updateDriverStatus(driverId, "OFFLINE");
          }
        } catch (error) {
          console.error("Failed to update offline status:", error);
        }
      });
    } else {
      // Going online
      try {
        // First set online state to true immediately
        setIsOnline(true);

        // Also set finding orders state immediately
        setIsFindingOrders(true);

        // Start the finding orders animation right away
        animateToFindingOrders();

        // Then start location updates in the background
        await startLocationUpdates();

        // Update driver status on the server
        try {
          const driverId = await AsyncStorage.getItem("driverId");
          if (driverId) {
            await api.drivers.updateDriverStatus(driverId, "AVAILABLE");
          }
        } catch (error) {
          console.error("Failed to update online status:", error);
        }
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
      // // Set online state first, before setting up the watcher
      // setIsOnline(true);
      console.log("Starting location updates for driver:", driverId);

      const locationWatchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (location) => {
          // Update current location in state
          setCurrentLocation(location);
          console.log("Location updated:", location.coords);

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
                console.log("Sending location update to API:", locationData);
                await api.tracking.updateLocation(driverId, locationData);
                console.log("Location update sent successfully");
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
      console.log("Location watching started successfully");
      setWatchId(locationWatchId);
    } catch (error: any) {
      console.error("Error setting up location tracking:", error?.message);
      throw error;
    }
  };

  const acceptOrder = async () => {
    // Prevent multiple simultaneous accept requests
    if (isAccepting) return;

    try {
      setIsAccepting(true);

      if (!orderDetails?.orderId || !driver.id) {
        console.error("Missing order ID or driver ID for order acceptance");
        return;
      }

      // Clear any existing timers to prevent auto-rejection
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Reset the timer display immediately
      setOrderTimer(0);

      // Cancel any animations that might be running
      if (timerAnimationRef.current) {
        timerAnimationRef.current.stop();
      }

      console.log(
        `Accepting order ${orderDetails.orderId} by driver ${driver.id}`
      );

      // Store order details for navigation
      const currentOrderDetails = { ...orderDetails };

      // IMMEDIATELY close order details and navigate to navigation screen
      closeOrderDetails(() => {
        // Navigate to the navigation screen immediately
        router.push("/(app)/navigation");
      });

      // Send API request AFTER navigation has started
      try {
        await api.orders.acceptOrder(currentOrderDetails.orderId, driver.id);
        console.log("Order accepted successfully");
      } catch (error: any) {
        console.error("Failed to accept order:", error);

        // Even if the API call fails, we're already on the navigation screen
        // Just show a toast or small notification without disrupting the flow
        if (error.response?.status === 404) {
          // Order was already taken by someone else
          Alert.alert(
            "Order Unavailable",
            "This order was assigned to another driver. You'll be redirected back to find new orders.",
            [
              {
                text: "OK",
                onPress: () => {
                  // Go back to the home screen to find new orders
                  router.replace("/(app)/home");
                },
              },
            ]
          );
        } else {
          // For other errors, we can allow the driver to continue with the delivery
          // But show a warning that there might be issues
          Alert.alert(
            "Connection Issue",
            "We've had trouble confirming your acceptance with our servers. You can continue with the delivery, but please check your connection.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error("Unexpected error in acceptOrder:", error);
    } finally {
      // Always reset accepting state
      setIsAccepting(false);
    }
  };
  const declineOrder = async () => {
    // Prevent multiple simultaneous decline requests
    if (isRejecting) return;

    try {
      setIsRejecting(true);

      if (!orderDetails?.orderId || !driver.id) {
        console.error("Missing order ID or driver ID for order rejection");
        return;
      }

      // Clear any existing timers
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Reset the timer display
      setOrderTimer(0);

      console.log(
        `Declining order ${orderDetails.orderId} by driver ${driver.id}`
      );

      // Send API request to decline the order
      await api.orders.declineOrder(orderDetails.orderId, driver.id);

      // Close the order details and go back to finding orders
      closeOrderDetails(() => {
        animateToFindingOrders();
      });
    } catch (error: any) {
      console.error("Failed to decline order:", error);
      Alert.alert("Error", "Could not decline the order. Please try again.");
    } finally {
      // Always reset rejecting state
      setIsRejecting(false);
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
        setRouteInfo(null);
        if (callback) callback();
      });
    });
  };

  // WebSocket connection functions
  const connectWebSocket = () => {
    if (!driver.id) {
      console.error("Cannot connect WebSocket: No driver ID available");
      return;
    }

    try {
      const apiUrl = API_BASE_URL;
      const baseUrl = apiUrl.replace(/\/api$/, "");

      // Create a new WebSocket client with the enhanced implementation
      const wsClient = createStompClient(baseUrl, driver.id, (orderData) => {
        console.log("Processing new order assignment in context:", orderData);

        // Set order details
        setOrderDetails({
          orderId: orderData.orderId,
          orderNumber: orderData.orderNumber || "Order",
          restaurantName: orderData.restaurantName || "Restaurant",
          address: orderData.deliveryAddress || "Customer Address",
          payment: orderData.payment || "0",
          specialInstructions: orderData.specialInstructions || "",
          restaurantCoordinates: orderData.restaurantCoordinates,
          customerCoordinates: orderData.customerCoordinates,
        });

        // Set route points for the map
        if (orderData.restaurantCoordinates && orderData.customerCoordinates) {
          setOrderRoute([
            orderData.restaurantCoordinates,
            orderData.customerCoordinates,
          ]);
        }

        // Show the order details modal
        animateButtonToOrderDetails();

        // Start the timer
        setOrderTimer(15);
        timerProgress.setValue(1);
      });

      // Store the client reference
      if (wsClient) {
        if (websocketClientRef.current) {
          // Disconnect previous client if it exists
          websocketClientRef.current.disconnect();
        }

        websocketClientRef.current = wsClient;
        setStompClient(wsClient.client);
      }
    } catch (error) {
      console.error("Failed to establish WebSocket connection:", error);
    }
  };

  // Add a cleanup function in your useEffect
  useEffect(() => {
    if (isOnline && driver.id) {
      connectWebSocket();
    } else if (!isOnline && websocketClientRef.current) {
      // Disconnect when going offline
      websocketClientRef.current.disconnect();
      websocketClientRef.current = null;
      setStompClient(null);
    }

    // Cleanup on component unmount
    return () => {
      if (websocketClientRef.current) {
        websocketClientRef.current.disconnect();
        websocketClientRef.current = null;
      }
    };
  }, [isOnline, driver.id]);

  const disconnectWebSocket = () => {
    if (stompClient) {
      stompClient.deactivate();
      setStompClient(null);
    }
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
        isAccepting,
        isRejecting,

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
        animateToFindingOrders,
        updateRouteInfo,
        timerStrokeAnimation,
        fetchNearbyRestaurantsData,

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
