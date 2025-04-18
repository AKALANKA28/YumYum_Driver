import React from 'react';
import { StatusBar } from 'react-native';
import { DriverContextProvider } from '../src/context/DriverContext';
import MapScreen from '../src/components/HomeScreen';

const DriverHome = () => {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <DriverContextProvider>
        <MapScreen />
      </DriverContextProvider>
    </>
  );
};

export default DriverHome;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   Dimensions,
//   Platform,
//   Alert,
//   ActivityIndicator,
//   AppState,
//   AppStateStatus,
//   Image,
//   Animated,
//   Easing,
// } from "react-native";
// import { router } from "expo-router";
// import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
// import styled from "styled-components/native";
// import MapView, {
//   Marker,
//   PROVIDER_GOOGLE,
//   Polyline,
//   Region,
//   MapViewProps,
// } from "react-native-maps";
// import * as Location from "expo-location";

// const { width, height } = Dimensions.get("window");
// const ASPECT_RATIO = width / height;
// const LATITUDE_DELTA = 0.0922;
// const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// // Create animated versions of components
// // const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
// const AnimatedView = Animated.createAnimatedComponent(View);

// // Styled components
// const Container = styled(View)`
//   flex: 1;
//   background-color: ${(props) => props.theme.colors.background};
// `;

// const MapContainer = styled(View)`
//   flex: 1;
// `;

// // Top floating card for earnings display
// const EarningsCard = styled(View)`
//   position: absolute;
//   top: ${Platform.OS === "ios" ? "50px" : "40px"};
//   left: 15px;
//   background-color: ${(props) => props.theme.colors.primary || `#000`};
//   padding: 12px 15px;
//   border-radius: 20px;
//   shadow-color: #000;
//   shadow-offset: 0px 2px;
//   shadow-opacity: 0.2;
//   shadow-radius: 4px;
//   elevation: 5;
//   flex-direction: row;
//   align-items: center;
// `;

// const CurrencyText = styled(Text)`
//   font-size: 23px;
//   font-weight: bold;
//   color: ${(props) => props.theme.colors.secondary};
//   margin-left: 8px;
// `;

// const EarningsText = styled(Text)`
//   font-size: 23px;
//   font-weight: bold;
//   color: ${(props) => props.theme.colors.background};
//   margin-left: 8px;
// `;

// const SmallText = styled(Text)`
//   font-size: 12px;
//   color: #fff;
// `;

// // Profile button in top right
// const ProfileButton = styled(TouchableOpacity)`
//   position: absolute;
//   top: ${Platform.OS === "ios" ? "50px" : "40px"};
//   right: 15px;
//   background-color: white;
//   width: 50px;
//   height: 50px;
//   border-radius: 25px;
//   shadow-color: #000;
//   shadow-offset: 0px 2px;
//   shadow-opacity: 0.2;
//   shadow-radius: 4px;
//   elevation: 5;
//   align-items: center;
//   justify-content: center;
//   overflow: hidden;
// `;

// const ProfileImage = styled(Image)`
//   width: 50px;
//   height: 50px;
// `;

// // Online status indicator next to profile
// const OnlineStatusBadge = styled(View)<{ isOnline: boolean }>`
//   position: absolute;
//   top: ${Platform.OS === "ios" ? "80px" : "60px"};
//   right: 10px;
//   background-color: ${(props) => (props.isOnline ? "#00CC66" : "#E50914")};
//   padding: 6px 12px;
//   border-radius: 20px;
//   shadow-color: #000;
//   shadow-offset: 0px 2px;
//   shadow-opacity: 0.2;
//   shadow-radius: 4px;
//   elevation: 5;
//   flex-direction: row;
//   align-items: center;
// `;

// const StatusText = styled(Text)`
//   color: white;
//   font-size: 12px;
//   font-weight: bold;
//   margin-left: 4px;
// `;

// // Button that expands to the order container
// const ExpandableButtonContainer = styled(AnimatedView)`
//   position: absolute;
//   background-color: ${(props) => props.theme.colors.primary || "#000"};
//   border-radius: 30px;
//   shadow-color: #000;
//   shadow-offset: 0px 2px;
//   shadow-opacity: 0.3;
//   shadow-radius: 5px;
//   elevation: 6;
//   overflow: hidden;
//   align-items: center;
// `;

// // Fix the ButtonContent styled component
// const ButtonContent = styled(View)<{ isOnline: boolean }>`
//   background-color: ${(props) =>
//     props.isOnline
//       ? props.theme.colors.primary || "#000"
//       : props.theme.colors.secondary || "#f23f07"};
//   width: 100%;
//   height: 100%;
//   flex-direction: row;
//   align-items: center;
//   justify-content: center;
//   padding: 15px;
// `;

// const GoOnlineText = styled(Text)`
//   color: white;
//   font-size: 18px;
//   font-weight: bold;
//   margin-left: 8px;
// `;

// // Finding orders animation component
// const FindingOrdersContent = styled(View)`
//   flex-direction: row;
//   align-items: center;
//   justify-content: center;
//   width: 100%;
//   height: 100%;
//   padding: 0;
//   position: relative;
// `;

// const ContentContainer = styled(View)`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   flex-direction: row;
//   align-items: center;
//   justify-content: center;
// `;

// const PulsingDot = styled(Animated.View)`
//   width: 10px;
//   height: 10px;
//   border-radius: 5px;
//   background-color: ${(props) => props.theme.colors.secondary || "#f23f07"};
//   position: absolute;
//   left: 15px;
//   top: 50%;
//   margin-top: -5px;
// `;

// const FindingText = styled(Text)`
//   color: white;
//   font-size: 16px;
//   font-weight: bold;
//   text-align: center;
// `;

// const CloseButton = styled(TouchableOpacity)`
//   width: 24px;
//   height: 24px;
//   border-radius: 12px;
//   background-color: rgba(255, 255, 255, 0.2);
//   align-items: center;
//   justify-content: center;
//   position: absolute;
//   right: 15px;
//   top: 50%;
//   margin-top: -12px;
// `;

// // Order details components
// const OrderDetailsContent = styled(AnimatedView)`
//   width: 100%;
//   opacity: 0;
//   overflow: hidden;
// `;

// const OrderInfoRow = styled(View)`
//   flex-direction: row;
//   align-items: center;
//   justify-content: center;
//   padding: 15px;
// `;

// const OrderTimeDistance = styled(Text)`
//   color: white;
//   font-size: 22px;
//   font-weight: bold;
//   text-align: center;
// `;

// const OrderAddressContainer = styled(View)`
//   padding: 10px 15px;
//   border-top-width: 1px;
//   border-top-color: rgba(255, 255, 255, 0.1);
// `;

// const OrderAddressText = styled(Text)`
//   color: white;
//   font-size: 16px;
//   text-align: center;
// `;

// const OrderAddressSubText = styled(Text)`
//   color: rgba(255, 255, 255, 0.7);
//   font-size: 14px;
//   text-align: center;
// `;

// const AcceptOrderButton = styled(TouchableOpacity)`
//   background-color: ${(props) => props.theme.colors.secondary || "#f23f07"};
//   margin: 15px;
//   padding: 15px;
//   border-radius: 8px;
//   flex-direction: row;
//   align-items: center;
//   justify-content: center;
// `;

// const AcceptOrderButtonText = styled(Text)`
//   color: white;
//   font-size: 18px;
//   font-weight: bold;
//   text-align: center;
//   margin-left: 10px;
// `;

// // Timer components
// const TimerCircle = styled(TouchableOpacity)`
//   position: absolute;
//   top: 15px;
//   right: 15px;
//   width: 40px;
//   height: 40px;
//   border-radius: 20px;
//   background-color: #333;
//   align-items: center;
//   justify-content: center;
//   border: 2px solid ${(props) => props.theme.colors.secondary || "#f23f07"};
// `;

// const TimerText = styled(Text)`
//   color: white;
//   font-size: 16px;
//   font-weight: bold;
// `;

// // Loading container
// const LoadingContainer = styled(View)`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background-color: rgba(255, 255, 255, 0.7);
//   justify-content: center;
//   align-items: center;
// `;

// export default function DriverMap() {
//   const [isOnline, setIsOnline] = useState(false);
//   const [currentLocation, setCurrentLocation] =
//     useState<Location.LocationObject | null>(null);
//   const [initialRegion, setInitialRegion] = useState<Region | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [watchId, setWatchId] = useState<Location.LocationSubscription | null>(
//     null
//   );
//   const [isFindingOrders, setIsFindingOrders] = useState(false);
//   const [showingOrderDetails, setShowingOrderDetails] = useState(false);
//   const [orderRoute, setOrderRoute] = useState<any>(null);
//   const [orderTimer, setOrderTimer] = useState(15);

//   // Stats data
//   const [currency, setCurrency] = useState("LKR");
//   const [earnings, setEarnings] = useState("2,850");

//   // Order details
//   const [orderDetails, setOrderDetails] = useState({
//     time: "7 mins",
//     distance: "1.6 km",
//     address: "6, Maitland Crescent",
//     city: "Colombo",
//   });

//   // Animation values
//   const buttonWidth = useRef(new Animated.Value(150)).current;
//   const buttonHeight = useRef(new Animated.Value(50)).current;
//   const buttonBottom = useRef(new Animated.Value(30)).current;
//   const buttonLeft = useRef(new Animated.Value((width - 150) / 2)).current; // Center the button initially
//   const buttonBorderRadius = useRef(new Animated.Value(30)).current;
//   const contentOpacity = useRef(new Animated.Value(1)).current;
//   const orderDetailsOpacity = useRef(new Animated.Value(0)).current;
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const timerProgress = useRef(new Animated.Value(1)).current;

//   // For the timer circular progress
//   const timerStrokeAnimation = timerProgress.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["0deg", "360deg"],
//   });

//   // Profile image
//   const [profileImage, setProfileImage] = useState<string>(
//     "https://randomuser.me/api/portraits/men/32.jpg"
//   );

//   const mapRef = useRef<MapView>(null);
//   const appState = useRef(AppState.currentState);

//   // Set up pulse animation for the dot when finding orders
//   useEffect(() => {
//     if (isFindingOrders) {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1.5,
//             duration: 800,
//             easing: Easing.ease,
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 800,
//             easing: Easing.ease,
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();
//     } else {
//       pulseAnim.setValue(1);
//     }
//   }, [isFindingOrders]);

//   // Order timer countdown
//   useEffect(() => {
//     let interval: NodeJS.Timeout;

//     if (showingOrderDetails && orderTimer > 0) {
//       interval = setInterval(() => {
//         setOrderTimer((prevTimer) => {
//           if (prevTimer <= 1) {
//             clearInterval(interval);
//             // Auto-decline the order when timer ends
//             setTimeout(() => declineOrder(), 200);
//             return 0;
//           }
//           return prevTimer - 1;
//         });
//       }, 1000);

//       // Animate timer progress
//       Animated.timing(timerProgress, {
//         toValue: 0,
//         duration: orderTimer * 1000,
//         useNativeDriver: true,
//         easing: Easing.linear,
//       }).start();
//     }

//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [showingOrderDetails, orderTimer]);

//   useEffect(() => {
//     (async () => {
//       try {
//         setIsLoading(true);

//         // Request location permissions
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           setError("Permission to access location was denied");
//           setIsLoading(false);
//           return;
//         }

//         // Get the current location
//         const location = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.Balanced,
//         });

//         setCurrentLocation(location);
//         setInitialRegion({
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//           latitudeDelta: LATITUDE_DELTA,
//           longitudeDelta: LONGITUDE_DELTA,
//         });

//         setIsLoading(false);
//       } catch (err) {
//         console.error("Error getting location:", err);
//         setError("Could not get your location. Please try again.");
//         setIsLoading(false);
//       }
//     })();

//     // Set up app state listener for background/foreground transitions
//     const appStateSubscription = AppState.addEventListener(
//       "change",
//       (nextAppState) => {
//         handleAppStateChange(nextAppState);
//       }
//     );

//     return () => {
//       // Clean up location watch subscription
//       if (watchId) {
//         watchId.remove();
//       }

//       // Clean up app state subscription
//       appStateSubscription.remove();
//     };
//   }, []);

//   const handleAppStateChange = (nextAppState: AppStateStatus) => {
//     if (
//       appState.current.match(/inactive|background/) &&
//       nextAppState === "active"
//     ) {
//       // App has come to the foreground
//       if (isOnline && !watchId) {
//         startLocationUpdates();
//       }
//     } else if (
//       nextAppState.match(/inactive|background/) &&
//       appState.current === "active"
//     ) {
//       // App has gone to the background
//       if (watchId) {
//         watchId.remove();
//         setWatchId(null);
//       }
//     }

//     appState.current = nextAppState;
//   };

//   const startLocationUpdates = async () => {
//     // Start watching position
//     const locationWatchId = await Location.watchPositionAsync(
//       {
//         accuracy: Location.Accuracy.Balanced,
//         timeInterval: 5000,
//         distanceInterval: 10,
//       },
//       (location) => {
//         setCurrentLocation(location);
//       }
//     );

//     setWatchId(locationWatchId);
//   };

//   const stopLocationUpdates = () => {
//     if (watchId) {
//       watchId.remove();
//       setWatchId(null);
//     }
//   };

//   const toggleOnlineStatus = async () => {
//     if (isOnline) {
//       // Going offline
//       setIsFindingOrders(false);

//       // First animate the button back to the original style
//       resetButtonToDefault(() => {
//         // Then set the online status to false
//         stopLocationUpdates();
//         setIsOnline(false);
//       });
//     } else {
//       // Going online
//       try {
//         // Start watching location
//         await startLocationUpdates();
//         setIsOnline(true);

//         // Animate the button to finding orders style
//         animateToFindingOrders();
//       } catch (err) {
//         console.error("Error watching location:", err);
//         Alert.alert(
//           "Error",
//           "Could not start location tracking. Please try again."
//         );
//       }
//     }
//   };

//   const resetButtonToDefault = (callback?: () => void) => {
//     // Animate back to default button
//     Animated.parallel([
//       Animated.timing(buttonWidth, {
//         toValue: 150,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//       Animated.timing(buttonHeight, {
//         toValue: 50,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//       Animated.timing(buttonBottom, {
//         toValue: 30,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//       Animated.timing(buttonLeft, {
//         toValue: (width - 150) / 2,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//       Animated.timing(buttonBorderRadius, {
//         toValue: 30,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//       Animated.timing(contentOpacity, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: false,
//       }),
//     ]).start(() => {
//       if (callback) callback();
//     });
//   };

//   const animateToFindingOrders = () => {
//     // Animate to finding orders state
//     setIsFindingOrders(true);
//     Animated.parallel([
//       Animated.timing(buttonWidth, {
//         toValue: 200,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//       Animated.timing(buttonLeft, {
//         toValue: (width - 200) / 2,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//       Animated.timing(contentOpacity, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//     ]).start();
//   };

//   const cancelFindingOrders = () => {
//     // Cancel finding orders but stay online
//     setIsFindingOrders(false);
//     Animated.parallel([
//       Animated.timing(buttonWidth, {
//         toValue: 150,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//       Animated.timing(buttonLeft, {
//         toValue: (width - 150) / 2,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//       Animated.timing(contentOpacity, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: false,
//       }),
//     ]).start();
//   };
  
//   // Simulated function to receive an order - in production, this would be triggered by your API
//   const receiveOrder = () => {
//     if (!currentLocation) return;

//     // Generate route points based on current location
//     const routePoints = generateRoutePoints(currentLocation);
    
//     // Set order route for drawing on the map
//     setOrderRoute(routePoints);
    
//     // Move map to show the route
//     mapRef.current?.fitToCoordinates(routePoints, {
//       edgePadding: { top: 100, right: 80, bottom: 400, left: 80 },
//       animated: true,
//     });
    
//     // Reset the timer
//     setOrderTimer(15);
//     timerProgress.setValue(1);
    
//     // Show order details
//     animateButtonToOrderDetails();
//   };

//   const animateButtonToOrderDetails = () => {
//     // Hide finding orders state and show order details
//     setIsFindingOrders(false);
//     setShowingOrderDetails(true);

//     // First fade out the current content
//     Animated.timing(contentOpacity, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: false,
//     }).start(() => {
//       // Then expand the button into a full container
//       Animated.parallel([
//         // Expand width to full screen width
//         Animated.timing(buttonWidth, {
//           toValue: width,
//           duration: 400,
//           easing: Easing.out(Easing.cubic),
//           useNativeDriver: false,
//         }),
//         // Expand height to container height
//         Animated.timing(buttonHeight, {
//           toValue: 230,
//           duration: 400,
//           easing: Easing.out(Easing.cubic),
//           useNativeDriver: false,
//         }),
//         // Move to bottom of screen
//         Animated.timing(buttonBottom, {
//           toValue: 0,
//           duration: 400,
//           easing: Easing.out(Easing.cubic),
//           useNativeDriver: false,
//         }),
//         // Center horizontally
//         Animated.timing(buttonLeft, {
//           toValue: 0,
//           duration: 400,
//           easing: Easing.out(Easing.cubic),
//           useNativeDriver: false,
//         }),
//         // Change border radius to only round the top corners
//         Animated.timing(buttonBorderRadius, {
//           toValue: 20,
//           duration: 400,
//           useNativeDriver: false,
//         }),
//       ]).start(() => {
//         // Fade in the order details content
//         Animated.timing(orderDetailsOpacity, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: false,
//         }).start();
//       });
//     });
//   };

//   const acceptOrder = () => {
//     // Handle order acceptance logic
//     Alert.alert("Order Accepted", "You have accepted the delivery request.");

//     // Close the order details container
//     closeOrderDetails(() => {
//       // After closing, you could navigate to a delivery screen or update the UI
//       // In a real app, you would navigate to the active delivery screen
//       // router.push("/(app)/activeDelivery");
//     });
//   };

//   const declineOrder = () => {
//     // Handle order decline logic
//     closeOrderDetails(() => {
//       // After closing, go back to finding orders state
//       animateToFindingOrders();
//     });
//   };

//   const closeOrderDetails = (callback?: () => void) => {
//     // First fade out order details content
//     Animated.timing(orderDetailsOpacity, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: false,
//     }).start(() => {
//       // Then shrink the container back to a button
//       resetButtonToDefault(() => {
//         setShowingOrderDetails(false);
//         setOrderRoute(null);
//         if (callback) callback();
//       });
//     });
//   };

//   const generateRoutePoints = (currentLoc: Location.LocationObject) => {
//     // Generate a route with several points for demonstration
//     const startPoint = {
//       latitude: currentLoc.coords.latitude,
//       longitude: currentLoc.coords.longitude,
//     };

//     // Destination point ~1.5km away
//     const endPoint = {
//       latitude: currentLoc.coords.latitude + 0.01,
//       longitude: currentLoc.coords.longitude + 0.008,
//     };

//     // Create some intermediary points for a more realistic route
//     const points = [
//       startPoint,
//       {
//         latitude: startPoint.latitude + 0.002,
//         longitude: startPoint.longitude + 0.003,
//       },
//       {
//         latitude: startPoint.latitude + 0.005,
//         longitude: startPoint.longitude + 0.001,
//       },
//       {
//         latitude: startPoint.latitude + 0.008,
//         longitude: startPoint.longitude + 0.005,
//       },
//       endPoint,
//     ];

//     return points;
//   };

//   const handleGoToSettings = () => {
//     router.push("/(app)/settings");
//   };

//   if (error) {
//     return (
//       <Container>
//         <StatusBar
//           barStyle="dark-content"
//           translucent
//           backgroundColor="transparent"
//         />
//         <View
//           style={{
//             flex: 1,
//             justifyContent: "center",
//             alignItems: "center",
//             padding: 20,
//           }}
//         >
//           <Ionicons name="alert-circle" size={60} color="#E50914" />
//           <Text style={{ marginTop: 20, fontSize: 18, textAlign: "center" }}>
//             {error}
//           </Text>
//           <TouchableOpacity
//             style={{
//               marginTop: 20,
//               backgroundColor: "#E50914",
//               padding: 15,
//               borderRadius: 8,
//               minWidth: 150,
//               alignItems: "center",
//             }}
//             onPress={() => router.replace("/(app)/home")}
//           >
//             <Text style={{ color: "white", fontWeight: "bold" }}>
//               Try Again
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </Container>
//     );
//   }

//   return (
//     <Container>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="transparent"
//         translucent={true}
//       />

//       <MapContainer>
//         {initialRegion && (
//           <MapView
//             ref={mapRef}
//             provider={PROVIDER_GOOGLE}
//             style={{ flex: 1 }}
//             initialRegion={initialRegion}
//             showsUserLocation
//             showsMyLocationButton={false} // Disable default button, we'll use our custom UI
//             followsUserLocation
//             onMapReady={() => console.log("Map is ready")}
//             onRegionChangeComplete={(region) => {
//               // Track region changes if needed
//             }}
//           >
//             {/* Order route */}
//             {orderRoute && (
//               <>
//                 {/* Starting point */}
//                 <Marker coordinate={orderRoute[0]} title="Pickup Location">
//                   <View
//                     style={{
//                       backgroundColor: "white",
//                       borderRadius: 15,
//                       padding: 5,
//                       shadowColor: "#000",
//                       shadowOffset: { width: 0, height: 2 },
//                       shadowOpacity: 0.3,
//                       shadowRadius: 2,
//                       elevation: 5,
//                     }}
//                   >
//                     <FontAwesome5 name="store" size={20} color="#f23f07" />
//                   </View>
//                 </Marker>

//                 {/* Destination */}
//                 <Marker
//                   coordinate={orderRoute[orderRoute.length - 1]}
//                   title="Delivery Location"
//                 >
//                   <View
//                     style={{
//                       backgroundColor: "white",
//                       borderRadius: 15,
//                       padding: 5,
//                       shadowColor: "#000",
//                       shadowOffset: { width: 0, height: 2 },
//                       shadowOpacity: 0.3,
//                       shadowRadius: 2,
//                       elevation: 5,
//                     }}
//                   >
//                     <Ionicons name="location" size={20} color="#f23f07" />
//                   </View>
//                 </Marker>

//                 {/* Route polyline */}
//                 <Polyline
//                   coordinates={orderRoute}
//                   strokeColor="#f23f07"
//                   strokeWidth={4}
//                   lineDashPattern={[0]}
//                 />
//               </>
//             )}
//           </MapView>
//         )}
//       </MapContainer>

//       {/* Earnings display in top left */}
//       <EarningsCard>
//         <CurrencyText>{currency}</CurrencyText>
//         <EarningsText>{earnings}</EarningsText>
//         <SmallText> today</SmallText>
//       </EarningsCard>

//       {/* Profile button in top right */}
//       <ProfileButton onPress={handleGoToSettings}>
//         <ProfileImage source={{ uri: profileImage }} resizeMode="cover" />
//       </ProfileButton>

//       {/* Online status indicator */}
//       {isOnline && !showingOrderDetails && (
//         <OnlineStatusBadge isOnline={isOnline}>
//           <Ionicons name="radio-button-on" size={12} color="white" />
//           <StatusText>Online</StatusText>
//         </OnlineStatusBadge>
//       )}

//       {/* Expandable button container */}
//       <ExpandableButtonContainer
//         style={{
//           width: buttonWidth,
//           height: buttonHeight,
//           left: buttonLeft,
//           bottom: buttonBottom,
//           borderRadius: buttonBorderRadius,
//         }}
//       >
//         {/* Button Content */}
//         <Animated.View style={{ opacity: contentOpacity, width: "100%" }}>
//           {isFindingOrders ? (
//             <TouchableOpacity style={{ width: "100%", height: "100%" }}>
//               <FindingOrdersContent>
//                 <ContentContainer>
//                   <PulsingDot
//                     style={{
//                       transform: [{ scale: pulseAnim }],
//                     }}
//                   />
//                   <FindingText>Finding Orders</FindingText>
//                   <CloseButton onPress={cancelFindingOrders}>
//                     <Ionicons name="close" size={16} color="white" />
//                   </CloseButton>
//                 </ContentContainer>
//               </FindingOrdersContent>
//             </TouchableOpacity>
//           ) : !showingOrderDetails ? (
//             <TouchableOpacity
//               onPress={toggleOnlineStatus}
//               style={{ width: "100%", height: "100%" }}
//             >
//               <ButtonContent isOnline={isOnline}>
//                 <FontAwesome5 name="power-off" size={19} color="white" />
//                 <GoOnlineText>
//                   {isOnline ? "Go Offline" : "Go Online"}
//                 </GoOnlineText>
//               </ButtonContent>
//             </TouchableOpacity>
//           ) : null}
//         </Animated.View>

//         {/* Order Details Content (conditionally rendered) */}
//         {showingOrderDetails && (
//           <OrderDetailsContent style={{ opacity: orderDetailsOpacity }}>
//             {/* Timer with close button functionality */}
//             <TimerCircle onPress={declineOrder}>
//               <TimerText>{orderTimer}</TimerText>
//               <Animated.View
//                 style={{
//                   position: "absolute",
//                   width: "100%",
//                   height: "100%",
//                   borderRadius: 20,
//                   borderWidth: 2,
//                   borderColor: "transparent",
//                   borderTopColor: "#f23f07",
//                   transform: [{ rotateZ: timerStrokeAnimation }],
//                 }}
//               />
//             </TimerCircle>

//             {/* Order time and distance */}
//             <OrderInfoRow>
//               <OrderTimeDistance>
//                 {orderDetails.time} • {orderDetails.distance}
//               </OrderTimeDistance>
//             </OrderInfoRow>

//             {/* Order address */}
//             <OrderAddressContainer>
//               <OrderAddressText>
//                 Delivery to: {orderDetails.address},
//               </OrderAddressText>
//               <OrderAddressSubText>{orderDetails.city}</OrderAddressSubText>
//             </OrderAddressContainer>

//             {/* Accept button */}
//             <AcceptOrderButton onPress={acceptOrder}>
//               <Ionicons name="receipt-outline" size={24} color="white" />
//               <AcceptOrderButtonText>Accept Order</AcceptOrderButtonText>
//             </AcceptOrderButton>
//           </OrderDetailsContent>
//         )}
//       </ExpandableButtonContainer>

//       {isLoading && (
//         <LoadingContainer>
//           <ActivityIndicator size="large" color="#f23f07" />
//           <Text style={{ marginTop: 10, fontWeight: "500" }}>
//             Loading map...
//           </Text>
//         </LoadingContainer>
//       )}
//     </Container>
//   );
// }

// // Define theme
// const theme = {
//   colors: {
//     primary: "#000000", // Black
//     secondary: "#f23f07", // Orange-red
//     background: "#FFFFFF", // White
//     cardBackground: "#F8F8F8", // Light gray for cards
//     text: "#000000", // Black
//     lightText: "#666666", // Gray for secondary text
//     error: "#E50914", // Red for errors
//     success: "#f23f07", // Orange-red for success states (using secondary color)
//     warning: "#FFC107", // Yellow for warnings
//     border: "#E0E0E0", // Light gray for borders
//     inputBackground: "#F5F5F5", // Light gray for input backgrounds
//     buttonText: "#FFFFFF", // White for button text
//     disabledButton: "#CCCCCC", // Gray for disabled buttons
//   },
//   spacing: {
//     xs: 4,
//     sm: 8,
//     md: 16,
//     lg: 24,
//     xl: 32,
//     xxl: 48,
//   },
//   borderRadius: {
//     small: 4,
//     medium: 8,
//     large: 16,
//   },
//   fontSizes: {
//     small: 12,
//     medium: 14,
//     regular: 16,
//     large: 18,
//     xlarge: 24,
//     xxlarge: 32,
//   },
//   fontWeights: {
//     regular: "400",
//     medium: "500",
//     bold: "700",
//   },
// };

// export type Theme = typeof theme;
