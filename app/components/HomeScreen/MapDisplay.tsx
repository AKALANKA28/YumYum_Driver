import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useDriverContext } from "../../context/DriverContext";
import { MapContainer } from "./styles";
import OrderRouteDisplay from "./OrderRouteDisplay";
import { RouteInfo } from "../../context/types/driver";
import { Restaurant } from "./types/restaurantDisplay";
import RestaurantLocations from "./RestaurantLocations";
import { useLoading } from "@/app/context/LoadingContext";
import BlurredMapOverlay from "./BlurredMapOverlay";
import EarningsCardComponent from "./EarningsCard";
import { Coordinate } from "./types/routeDisplay";

// Initialize Mapbox with access token
Mapbox.setAccessToken(
  "pk.eyJ1IjoiYWthbGFua2EtIiwiYSI6ImNtOW1jNHFnaDA2eHAybHMzYTQya2dyMzIifQ.KVriyRUmtMCiOxWwHGGrtQ"
);

const MapDisplay = () => {
  const {
    initialRegion,
    orderRoute,
    currentLocation,
    updateRouteInfo,
    restaurants,
    isOnline,
    showingOrderDetails,
    setIsLoading: setDriverContextLoading,
  } = useDriverContext();

  const { logLoadingState } = useLoading();

  // Map state
  const [mapReady, setMapReady] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Overlay animation
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const [overlayZIndex, setOverlayZIndex] = useState(10);

  // Refs
  const mapboxRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const isAdjustingCamera = useRef(false);

  // Map view state
  const [followUserMode, setFollowUserMode] = useState<Mapbox.UserTrackingMode>(
    Mapbox.UserTrackingMode.Follow
  );
  const [isShowingFullRoute, setIsShowingFullRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const [customOrderRoute, setCustomOrderRoute] = useState<Coordinate[]>([
    // Initial coordinates
    { latitude: 6.8489171, longitude: 80.0199555 }, // Restaurant coordinates
    { latitude: 6.8731942, longitude: 80.017573 }, // Customer coordinates
  ]);

  // Pulsing animation for user location marker
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  // Initialize pulsing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Set initial loading state
  useEffect(() => {
    logLoadingState("map", false);
  }, []);

  const onMapReady = () => {
    console.log("Map is ready");
    setMapReady(true);

    // Indicate that the map has loaded
    logLoadingState("map", false);
  };

  // When component unmounts, ensure we reset the loading state
  useEffect(() => {
    return () => {
      logLoadingState("map", false);
    };
  }, []);

  // Initial camera setup
  useEffect(() => {
    if (
      mapReady &&
      initialRegion &&
      cameraRef.current &&
      !initialLoadComplete
    ) {
      try {
        cameraRef.current.setCamera({
          centerCoordinate: [initialRegion.longitude, initialRegion.latitude],
          zoomLevel: 12,
          animationDuration: 0,
        });
      } catch (error) {
        // Silent fail
      }
    }
  }, [mapReady, initialRegion, initialLoadComplete]);

  // Update camera when user location becomes available
  useEffect(() => {
    if (
      mapReady &&
      currentLocation &&
      cameraRef.current &&
      initialLoadComplete &&
      !isOnline
    ) {
      try {
        cameraRef.current.setCamera({
          centerCoordinate: [
            currentLocation.coords.longitude,
            currentLocation.coords.latitude,
          ],
          zoomLevel: 12,
          animationDuration: 500,
        });
      } catch (error) {
        // Silent fail
      }
    }
  }, [currentLocation, mapReady, initialLoadComplete, isOnline]);

  // Handle online/offline transitions
  useEffect(() => {
    if (isOnline) {
      // Fade out overlay when user goes online
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setOverlayZIndex(-1);
      });

      // Zoom in to user location
      if (currentLocation && cameraRef.current && mapReady) {
        cameraRef.current.setCamera({
          centerCoordinate: [
            currentLocation.coords.longitude,
            currentLocation.coords.latitude,
          ],
          zoomLevel: 16,
          pitch: 30,
          animationDuration: 1000,
        });
      }
    } else {
      // Show overlay when offline
      setOverlayZIndex(10);
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Zoom out to show broader area
      if (cameraRef.current && mapReady) {
        const coordinates = initialRegion
          ? [initialRegion.longitude, initialRegion.latitude]
          : currentLocation
          ? [currentLocation.coords.longitude, currentLocation.coords.latitude]
          : [0, 0];

        cameraRef.current.setCamera({
          centerCoordinate: coordinates,
          zoomLevel: 12,
          pitch: 0,
          animationDuration: 1000,
        });
      }
    }
  }, [isOnline, currentLocation, initialRegion, mapReady]);

  // Update camera based on user location changes
  // Update this existing useEffect in your MapDisplay.tsx
  useEffect(() => {
    if (
      mapReady &&
      currentLocation &&
      cameraRef.current &&
      followUserMode === Mapbox.UserTrackingMode.Follow &&
      !isShowingFullRoute &&
      isOnline &&
      initialLoadComplete
    ) {
      try {
        cameraRef.current.setCamera({
          centerCoordinate: [
            currentLocation.coords.longitude,
            currentLocation.coords.latitude,
          ],
          animationMode: "flyTo",
          zoomLevel: orderRoute ? 17 : 15, // Higher zoom when navigating
          pitch: orderRoute ? 60 : 30, // More pitch when navigating
          animationDuration: 500,
        });
      } catch (error) {
        // Silent fail
      }
    }
  }, [
    mapReady,
    currentLocation,
    followUserMode,
    isShowingFullRoute,
    isOnline,
    initialLoadComplete,
    orderRoute, // Added orderRoute dependency
  ]);

  // Handle route display
  // Handle route display
  const handleRoutesReady = (bounds: [number, number, number, number]) => {
    if (cameraRef.current && mapReady && !isAdjustingCamera.current) {
      try {
        isAdjustingCamera.current = true;
        setIsShowingFullRoute(true);

        // More padding and smoother animation
        cameraRef.current.fitBounds(
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
          50, // Increase padding from 20 to 50
          2000 // Slower animation (2 seconds instead of 1)
        );

        // Wait a bit longer before returning to follow mode
        setTimeout(() => {
          setIsShowingFullRoute(false);
          isAdjustingCamera.current = false;

          // Return to driver-focused view after showing route
          if (
            currentLocation &&
            followUserMode !== Mapbox.UserTrackingMode.Follow
          ) {
            cameraRef.current?.setCamera({
              centerCoordinate: [
                currentLocation.coords.longitude,
                currentLocation.coords.latitude,
              ],
              zoomLevel: 15, // Good zoom level for navigation
              pitch: 45, // More angled view for navigation
              animationDuration: 1500,
            });
          }
        }, 8000); // Reduced from 15000 to 8000 ms (8 seconds is enough to see the route)
      } catch (error) {
        isAdjustingCamera.current = false;
      }
    }
  };

  const toggleFollowMode = () => {
    setFollowUserMode((prevMode) =>
      prevMode === Mapbox.UserTrackingMode.Follow
        ? Mapbox.UserTrackingMode.FollowWithCourse
        : Mapbox.UserTrackingMode.Follow
    );
  };
  // Navigation handlers
  const handleNavigateToOrders = () => router.push("/(app)/orders");
  const handleNavigateToStats = () => router.push("/(app)/earnings");
  const handleNavigateToSettings = () => router.push("/(app)/settings");

  // Route info update handler
  const handleRouteInfoUpdated = (info: RouteInfo) => updateRouteInfo(info);

  // Restaurant press handler
  const handleRestaurantPress = (restaurant: Restaurant) => {
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [
          restaurant.coordinates.longitude,
          restaurant.coordinates.latitude,
        ],
        zoomLevel: 15,
        animationDuration: 500,
      });
    }
  };

  const updateOrderRoute = (newRoute: Coordinate[]) => {
    setCustomOrderRoute(newRoute);
  };

  // Show empty view if no initial region
  if (!initialRegion) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <MapContainer>
      <Mapbox.MapView
        ref={mapboxRef}
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL.Outdoors}
        zoomEnabled={true}
        rotateEnabled={true}
        onDidFinishLoadingMap={onMapReady}
        logoEnabled={false}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={isOnline ? 16 : 12}
          animationDuration={600}
          followUserLocation={
            followUserMode !== Mapbox.UserTrackingMode.Follow &&
            !isShowingFullRoute &&
            isOnline
          }
          followUserMode={
            isOnline ? followUserMode : Mapbox.UserTrackingMode.FollowWithCourse
          }
        />

        {/* Hide the default user location */}
        <Mapbox.UserLocation visible={false} />

        {/* Restaurant locations when driver is online */}
        <RestaurantLocations
          restaurants={restaurants}
          isOnline={isOnline && !showingOrderDetails}
          onMarkerPress={handleRestaurantPress}
        />

        {/* Custom user location marker with pulsing effect */}
        {currentLocation && (
          <Mapbox.MarkerView
            id="customUserLocation"
            coordinate={[
              currentLocation.coords.longitude,
              currentLocation.coords.latitude,
            ]}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userLocationContainer}>
              {/* Animated pulsing circle */}
              <Animated.View
                style={[
                  styles.pulsingCircle,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseAnim.interpolate({
                      inputRange: [0.8, 1.2],
                      outputRange: [0.6, 0],
                    }),
                  },
                ]}
              />

              {/* Solid orange circle */}
              <View style={styles.userLocationDot}>
                {followUserMode === Mapbox.UserTrackingMode.FollowWithHeading &&
                  currentLocation.coords.heading !== undefined && (
                    <View
                      style={[
                        styles.headingArrow,
                        {
                          transform: [
                            { rotate: `${currentLocation.coords.heading}deg` },
                          ],
                        },
                      ]}
                    />
                  )}
              </View>
            </View>
          </Mapbox.MarkerView>
        )}

        {mapReady && orderRoute && currentLocation && (
          <OrderRouteDisplay
            orderRoute={customOrderRoute}
            driverLocation={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            }}
            onRoutesReady={handleRoutesReady}
            onRouteInfoUpdated={handleRouteInfoUpdated}
          />
        )}
      </Mapbox.MapView>

      {/* Blurred overlay */}
      <BlurredMapOverlay
        opacity={overlayOpacity}
        zIndex={overlayZIndex}
        mapReady={mapReady}
      />

      {/* Action buttons - shown only when online */}
      {isOnline && (
        <>
          <EarningsCardComponent />

          <View style={styles.actionButtonsPanel}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={toggleFollowMode}
              accessibilityLabel="Toggle Location Tracking Mode"
            >
              <MaterialIcons
                name={
                  followUserMode === Mapbox.UserTrackingMode.Follow
                    ? "my-location"
                    : "location-searching"
                }
                size={24}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </>
      )}
      <View style={styles.ButtonsPanel}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleNavigateToOrders}
          accessibilityLabel="Orders"
        >
          <Ionicons name="list-sharp" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleNavigateToStats}
          accessibilityLabel="View Statistics"
        >
          <Ionicons name="wallet-outline" size={25} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleNavigateToSettings}
          accessibilityLabel="App Settings"
        >
          <Ionicons name="settings-outline" size={25} color="#000" />
        </TouchableOpacity>
      </View>
    </MapContainer>
  );
};

const styles = StyleSheet.create({
  actionButtonsPanel: {
    position: "absolute",
    bottom: 215,
    right: 16,
    flexDirection: "column",
    alignItems: "center",
  },
  ButtonsPanel: {
    position: "absolute",
    bottom: 30,
    right: 16,
    flexDirection: "column",
    alignItems: "center",
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 100,
  },
  userLocationContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
  },
  pulsingCircle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF5722",
    opacity: 0.5,
  },
  userLocationDot: {
    width: 13,
    height: 13,
    borderRadius: 10,
    backgroundColor: "#FF5722",
    borderWidth: 1,
    borderColor: "#FF5722",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  headingArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "white",
    position: "absolute",
    top: -6,
  },
});

export default MapDisplay;
