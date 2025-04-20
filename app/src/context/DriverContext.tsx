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
import axios from "axios";
import * as Battery from 'expo-battery'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    time: string;
    distance: string;
    address: string;
    city: string;
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
  pulseAnim: Animated.Value;
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
  mapRef: React.RefObject<any>;
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
    time: "7 mins",
    distance: "1.6 km",
    address: "6, Maitland Crescent",
    city: "Colombo",
  });

  // Animation values
  const buttonWidth = useRef(new Animated.Value(150)).current;
  const buttonHeight = useRef(new Animated.Value(50)).current;
  const buttonBottom = useRef(new Animated.Value(30)).current;
  const buttonLeft = useRef(new Animated.Value((width - 150) / 2)).current;
  const buttonBorderRadius = useRef(new Animated.Value(30)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const orderDetailsOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
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

  const mapRef = useRef<any>(null);
  const appState = useRef(AppState.currentState);

  const API_BASE_URL = "https://your-api-endpoint.com/api";

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Set up pulse animation for the dot when finding orders
  useEffect(() => {
    if (isFindingOrders) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isFindingOrders]);

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
    if (isOnline) {
      // Going offline
      setIsFindingOrders(false);

      // First animate the button back to the original style
      resetButtonToDefault(() => {
        // Then set the online status to false
        stopLocationUpdates();
        setIsOnline(false);
      });
    } else {
      // Going online
      try {
        // Start watching location
        await startLocationUpdates();
        setIsOnline(true);

        // Animate the button to finding orders style
        animateToFindingOrders();
      } catch (err) {
        console.error("Error watching location:", err);
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
  
    // Get driver ID from secure storage or auth context
    const driverId = await AsyncStorage.getItem('driverId');
    
    if (!driverId) {
      console.error("Driver ID not found, cannot update location");
      return;
    }
  
    const locationWatchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      async (location) => {
        setCurrentLocation(location);
  
        // Send location update to backend
        if (isOnline) {
          try {
            // Include driver ID in the request URL or body based on your API design
            await apiClient.post(`/driver/${driverId}/location`, {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              heading: location.coords.heading || 0,
              speed: location.coords.speed || 0,
              accuracy: location.coords.accuracy || 0,
              batteryLevel: batteryLevel,
              status: "AVAILABLE",
            });
            
            // Optionally fetch latest driver data/status
            const response = await apiClient.get(`/driver/${driverId}/location`);
            // Update any state with the returned data if needed
            // For example: setDriverStatus(response.data.status);
          } catch (error) {
            console.error("Failed to update location:", error);
          }
        }
      }
    );
  
    setWatchId(locationWatchId);
  };

  const acceptOrder = async () => {
    try {
      // await apiClient.post('/orders/accept', { orderId: orderDetails.id });
      Alert.alert("Order Accepted", "You have accepted the delivery request.");

      // Close the order details container
      closeOrderDetails(() => {
        // Navigate to active delivery screen
        // router.push("/(app)/activeDelivery");
      });
    } catch (error) {
      console.error("Failed to accept order:", error);
      Alert.alert("Error", "Could not accept the order. Please try again.");
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

    // Move map to show the route
    mapRef.current?.fitToCoordinates(routePoints, {
      edgePadding: { top: 100, right: 80, bottom: 400, left: 80 },
      animated: true,
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
        // Expand width to full screen width
        Animated.timing(buttonWidth, {
          toValue: width,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        // Expand height to container height
        Animated.timing(buttonHeight, {
          toValue: 230,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        // Move to bottom of screen
        Animated.timing(buttonBottom, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        // Center horizontally
        Animated.timing(buttonLeft, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        // Change border radius to only round the top corners
        Animated.timing(buttonBorderRadius, {
          toValue: 20,
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

  const generateRoutePoints = (currentLoc: Location.LocationObject) => {
    // Generate a route with several points for demonstration
    const startPoint = {
      latitude: currentLoc.coords.latitude,
      longitude: currentLoc.coords.longitude,
    };

    // Destination point ~1.5km away
    const endPoint = {
      latitude: currentLoc.coords.latitude + 0.01,
      longitude: currentLoc.coords.longitude + 0.008,
    };

    // Create some intermediary points for a more realistic route
    const points = [
      startPoint,
      {
        latitude: startPoint.latitude + 0.002,
        longitude: startPoint.longitude + 0.003,
      },
      {
        latitude: startPoint.latitude + 0.005,
        longitude: startPoint.longitude + 0.001,
      },
      {
        latitude: startPoint.latitude + 0.008,
        longitude: startPoint.longitude + 0.005,
      },
      endPoint,
    ];

    return points;
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
        pulseAnim,
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
