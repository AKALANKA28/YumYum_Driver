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

const { width } = Dimensions.get("window");
const ASPECT_RATIO = width / Dimensions.get("window").height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Define context type
interface DriverContextType {
  // State
  isOnline: boolean;
  isFindingOrders: boolean;
  showingOrderDetails: boolean;
  currentLocation: Location.LocationObject | null;
  initialRegion: Region | null;
  isLoading: boolean;
  error: string | null;
  orderRoute: any[] | null;
  orderTimer: number;
  currency: string;
  earnings: string;
  orderDetails: {
    restaurantName: string;
    time: string;
    distance: string;
    address: string;
    city: string;
    payment: string;
  };
  profileImage: string;

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
  receiveOrder: () => void;
  animateToFindingOrders: () => void;
  timerStrokeAnimation: Animated.AnimatedInterpolation<string | number>;

  // Refs
  mapRef: React.RefObject<MapboxGL.MapView>;
}

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

  // Stats data
  const [currency, setCurrency] = useState("LKR");
  const [earnings, setEarnings] = useState("2,850");

  // Order details
  const [orderDetails, setOrderDetails] = useState({
    restaurantName: "Assembly (Quincy)",
    address: "Hancock St & MA-3A, Quincy",
    city: "Quincy, MA",
    time: "10 min",
    distance: "0.7 mi",
    payment: "7.80",
    restaurantCoordinates: {
      latitude: 6.85883,
      longitude: 80.02470,
    },
    customerCoordinates: {
      latitude: 6.910771,
      longitude: 79.885107,
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

  // For the timer circular progress
  const timerStrokeAnimation = timerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Profile image
  const [profileImage, setProfileImage] = useState<string>(
    "https://randomuser.me/api/portraits/men/32.jpg"
  );

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
    console.log(
      "Toggling online status, current state:",
      isOnline ? "ONLINE" : "OFFLINE"
    );

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
          if (driverId) {
            console.log("Updating server with OFFLINE status...");
            // Uncomment when API is ready:
            // await api.tracking.goOffline(driverId);
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
        // Start watching location
        await startLocationUpdates();
        setIsOnline(true);
        console.log("Driver is now ONLINE");

        // Animate the button to finding orders style
        animateToFindingOrders();
      } catch (err) {
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

        // For development - provide a fallback ID
        if (__DEV__) {
          driverId = "dev-driver-123";
          await AsyncStorage.setItem("driverId", driverId);
        } else {
          return;
        }
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

          // Only log location changes that are significant
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
          }

          try {
            // Create location data object
            const locationData = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              heading: location.coords.heading || 0,
              speed: location.coords.speed || 0,
              accuracy: location.coords.accuracy || 0,
              batteryLevel: batteryLevel ?? undefined,
              status: "AVAILABLE",
            };

            // Send the location update
            await api.tracking.updateLocation(driverId, locationData);
          } catch (error: any) {
            console.error("Failed to update location:", error?.message);
          }
        }
      );

      // Store the subscription so we can remove it later
      setWatchId(locationWatchId);

      console.log("Driver is now ONLINE");
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
  const receiveOrder = () => {
    if (!currentLocation) return;

    // Generate route points based on current location
    const routePoints = generateRoutePoints(currentLocation);

    // Set order route for drawing on the map
    setOrderRoute(routePoints);

    // Ensure proper order details with coordinates
    setOrderDetails({
      restaurantName: "Assembly (Quincy)",
      address: "Hancock St & MA-3A, Quincy",
      city: "Quincy, MA",
      time: "10 min",
      distance: "0.7 mi",
      payment: "7.80",
      // Make sure coordinates are set correctly
      restaurantCoordinates: {
        latitude: routePoints[0].latitude,
        longitude: routePoints[0].longitude,
      },
      customerCoordinates: {
        latitude: routePoints[routePoints.length - 1].latitude,
        longitude: routePoints[routePoints.length - 1].longitude,
      },
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
          toValue: 350,
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
        if (callback) callback();
      });
    });
  };

  // Define interfaces for route points and coordinate types
  interface RoutePoint {
    latitude: number;
    longitude: number;
  }

  interface Coordinates {
    latitude: number;
    longitude: number;
  }

// In your generateRoutePoints function
// Define the interface for route point generation result
interface RoutePoint {
  latitude: number;
  longitude: number;
}

const generateRoutePoints = (currentLocation: Location.LocationObject | null): RoutePoint[] => {
  if (!currentLocation || !currentLocation.coords) {
    console.log("Using default route coordinates");
    // Use Boston area for testing if no current location
    return [
      { latitude: 42.3601, longitude: -71.0589 }, // Boston downtown
      { latitude: 42.3503, longitude: -71.0663 }  // Near Boston area
    ];
  }

  const { latitude, longitude } = currentLocation.coords;
  
  // Generate a route around the current location
  console.log(`Generating route from current location: ${latitude}, ${longitude}`);
  return [
    { latitude, longitude }, // Start at current location
    { latitude: latitude + 0.01, longitude: longitude + 0.01 } // End a bit northeast
  ];
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
        currentLocation,
        initialRegion,
        isLoading,
        error,
        orderRoute,
        orderTimer,
        currency,
        earnings,
        orderDetails,
        profileImage,

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
