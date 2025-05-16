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
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

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

  // Animation values
  const buttonWidth = useRef(new Animated.Value(150)).current;
  const buttonHeight = useRef(new Animated.Value(50)).current;
  const buttonBottom = useRef(new Animated.Value(30)).current;
  const buttonLeft = useRef(new Animated.Value((width - 150) / 2)).current;
  const buttonBorderRadius = useRef(new Animated.Value(30)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const orderDetailsOpacity = useRef(new Animated.Value(0)).current;
  const timerProgress = useRef(new Animated.Value(1)).current;

  // For the timer circular progress
  const timerStrokeAnimation = timerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const mapRef = useRef<MapboxGL.MapView>(null);
  const appState = useRef(AppState.currentState);

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
            await api.tracking.updateDriverStatus(driverId, "OFFLINE");
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
            await api.tracking.updateDriverStatus(driverId, "AVAILABLE");
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
      if (!orderDetails?.orderId || !driver.id) {
        console.error("Missing order ID or driver ID for order acceptance");
        return;
      }

      // Send API request to accept the order
      await api.orders.acceptOrder(orderDetails.orderId, driver.id);

      // Close the order details container and navigate to navigation screen
      closeOrderDetails(() => {
        router.push("/(app)/navigation");
      });
    } catch (error) {
      console.error("Failed to accept order:", error);
      Alert.alert("Error", "Could not accept the order. Please try again.");
    }
  };

  const declineOrder = async () => {
    try {
      if (!orderDetails?.orderId || !driver.id) {
        console.error("Missing order ID or driver ID for order rejection");
        return;
      }

      // Send API request to decline the order
      await api.orders.declineOrder(orderDetails.orderId, driver.id);

      // Close the order details and go back to finding orders
      closeOrderDetails(() => {
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
    try {
      // Get the API URL from environment variables, keep it as http/https
      const apiUrl = API_BASE_URL;
      console.log("Connecting to WebSocket at:", apiUrl);

      // Extract the base URL without the /api path
      const baseUrl = apiUrl.replace(/\/api$/, "");
      console.log("Using base URL for WebSocket:", baseUrl);

      // Connect to the correct endpoint as configured in your backend
      const socket = new SockJS(`${baseUrl}/ws`);

      socket.onopen = () => {
        console.log("SockJS socket opened successfully");
      };

      socket.onclose = (event) => {
        console.log(
          `SockJS socket closed: code=${event.code}, reason=${event.reason}`
        );
      };

      socket.onerror = (error) => {
        console.error("SockJS socket error:", error);
      };

      const client: Client = new Client({
        webSocketFactory: () => socket,
        onConnect: (): void => {
          console.log("WebSocket connected successfully");
          subscribeToOrderAssignments();
        },
        onDisconnect: (): void => {
          console.log("WebSocket disconnected");
          // Consider implementing reconnection logic here
          setTimeout(() => {
            console.log("Attempting to reconnect...");
            connectWebSocket();
          }, 5000); // Retry after 5 seconds
        },
        onStompError: (frame): void => {
          console.error("STOMP protocol error:", frame);
        },
        debug: (msg) => {
          console.log("WebSocket Debug:", msg);
        },
        // Add reconnect options
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.activate();
      setStompClient(client);
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
    }
  };

  const disconnectWebSocket = () => {
    if (stompClient) {
      stompClient.deactivate();
      setStompClient(null);
    }
  };

  // WebSocket subscription function
  const subscribeToOrderAssignments = () => {
    if (!stompClient || !driver.id) return;

    // Define interface for the order assignment data that matches your backend structure
    interface OrderAssignmentData {
      orderId: string | number;
      orderNumber: string;
      payment: string;
      expiryTime: string;
      timestamp: number;
      restaurantName: string;
      restaurantAddress: string;
      customerAddress: string;
      restaurantCoordinates: {
        latitude: number;
        longitude: number;
      };
      customerCoordinates: {
        latitude: number;
        longitude: number;
      };
      specialInstructions: string | null;
    }

    // Define interface for location coordinates
    interface Coordinates {
      latitude: number;
      longitude: number;
    }

    stompClient.subscribe(
      `/queue/driver.${driver.id}.assignments`,
      (message: { body: string }) => {
        try {
          const orderData: OrderAssignmentData = JSON.parse(message.body);
          console.log("New order assignment received:", orderData);

          // Set order details from the notification
          setOrderDetails({
            orderId: orderData.orderId,
            orderNumber: orderData.orderNumber,
            restaurantName: orderData.restaurantName,
            address: orderData.customerAddress,
            payment: orderData.payment,
            specialInstructions: orderData.specialInstructions || "",

            // Use coordinates directly from the nested objects
            restaurantCoordinates: orderData.restaurantCoordinates,
            customerCoordinates: orderData.customerCoordinates,
          });

          // Set route points for the map
          setOrderRoute([
            orderData.restaurantCoordinates as Coordinates,
            orderData.customerCoordinates as Coordinates,
          ]);

          // Show the order details modal
          animateButtonToOrderDetails();

          // Start the timer
          setOrderTimer(15);
          timerProgress.setValue(1);
        } catch (error) {
          console.error("Error processing order assignment:", error);
        }
      }
    );

    // Subscribe to assignment cancellations
    stompClient.subscribe(
      `/queue/driver.${driver.id}.cancellations`,
      (message: { body: string }) => {
        try {
          const cancellationData = JSON.parse(message.body);
          console.log("Assignment cancellation received:", cancellationData);
          // Handle cancellation if needed
        } catch (error) {
          console.error("Error processing cancellation:", error);
        }
      }
    );
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
