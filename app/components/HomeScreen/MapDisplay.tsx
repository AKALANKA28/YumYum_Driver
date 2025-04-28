import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router"; // Import the router

import { useDriverContext } from "../../context/DriverContext";
import { MapContainer } from "./styles";
import OrderRouteDisplay from "./OrderRouteDisplay";
import { RouteInfo } from "../../context/types/driver";
import { Restaurant } from "./types/restaurantDisplay";
import RestaurantLocations from "./RestaurantLocations";

// Important: Initialize Mapbox with your access token
Mapbox.setAccessToken(
  "pk.eyJ1IjoiYWthbGFua2EtIiwiYSI6ImNtOW1jNHFnaDA2eHAybHMzYTQya2dyMzIifQ.KVriyRUmtMCiOxWwHGGrtQ"
);

// Main MapDisplay component
const MapDisplay = () => {
  const {
    initialRegion,
    orderRoute,
    currentLocation,
    updateRouteInfo,
    restaurants,
    isOnline,
    showingOrderDetails,
  } = useDriverContext();

  const [mapReady, setMapReady] = useState(false);

  const mapboxRef = useRef<Mapbox.MapView>(null)
  const cameraRef = useRef<Mapbox.Camera>(null);

  const [followUserMode, setFollowUserMode] = useState<Mapbox.UserTrackingMode>(
    Mapbox.UserTrackingMode.Follow
  );
  const [isShowingFullRoute, setIsShowingFullRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // Create animation for pulsing effect
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  // Start pulsing animation when component mounts
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

  // Handle map ready state
  const onMapReady = () => {
    console.log("Map is ready");
    setMapReady(true);
  };

  // Initialize map camera when map is ready and we have initial region
  useEffect(() => {
    if (mapReady && initialRegion && cameraRef.current) {
      try {
        cameraRef.current.setCamera({
          centerCoordinate: [initialRegion.longitude, initialRegion.latitude],
          zoomLevel: 14,
          animationDuration: 0,
        });
      } catch (error) {
        console.log("Camera setup error:", error);
      }
    }
  }, [mapReady, initialRegion]);

  // Update camera when user location changes but only if we're in follow mode
  // and not showing full route
  useEffect(() => {
    if (
      mapReady &&
      currentLocation &&
      cameraRef.current &&
      followUserMode === Mapbox.UserTrackingMode.Follow &&
      !isShowingFullRoute
    ) {
      try {
        cameraRef.current.setCamera({
          centerCoordinate: [
            currentLocation.coords.longitude,
            currentLocation.coords.latitude,
          ],
          animationMode: "flyTo",
          zoomLevel: 16,
          pitch: 30,
        });
      } catch (error) {
        console.log("Camera update error:", error);
      }
    }
  }, [mapReady, currentLocation, followUserMode, isShowingFullRoute]);

  // Add a ref to track if we're already showing a route
  const isAdjustingCamera = useRef(false);

  // Handle when routes are ready to show on map
  const handleRoutesReady = (bounds: [number, number, number, number]) => {
    if (cameraRef.current && mapReady && !isAdjustingCamera.current) {
      try {
        // Set flag to prevent multiple adjustments at once
        isAdjustingCamera.current = true;

        // Set state to prevent user location updates from changing the camera
        setIsShowingFullRoute(true);

        // Fit the camera to show the entire route
        cameraRef.current.fitBounds(
          [bounds[0], bounds[1]], // Southwest coordinates
          [bounds[2], bounds[3]], // Northeast coordinates
          40, // Padding
          1000 // Animation duration
        );

        console.log(
          "Camera adjusted to show full route - will remain for 15 seconds"
        );

        // After a delay, allow user location updates to control camera again if needed
        // Increased from 3 seconds to 15 seconds
        setTimeout(() => {
          setIsShowingFullRoute(false);
          isAdjustingCamera.current = false; // Reset the flag
          console.log("Resuming normal camera tracking");
        }, 15000); // 15 seconds
      } catch (error) {
        console.log("Error adjusting camera to route:", error);
        isAdjustingCamera.current = false; // Reset the flag on error
      }
    }
  };

  // Function to toggle between follow modes
  const toggleFollowMode = () => {
    setFollowUserMode((prevMode) =>
      prevMode === Mapbox.UserTrackingMode.Follow
        ? Mapbox.UserTrackingMode.FollowWithHeading
        : Mapbox.UserTrackingMode.Follow
    );
  };

  // Router navigation handlers
  const handleNavigateToOrders = () => {
    router.push("/(app)/orders");
  };

  const handleNavigateToStats = () => {
    router.push("/(app)/earnings");
  };

  const handleNavigateToSettings = () => {
    router.push("/(app)/settings");
  };

  // Handler for route information updates
  const handleRouteInfoUpdated = (info: RouteInfo) => {
    updateRouteInfo(info);
  };

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
          zoomLevel={16}
          animationDuration={600}
          followUserLocation={
            followUserMode !== Mapbox.UserTrackingMode.Follow &&
            !isShowingFullRoute
          }
          followUserMode={followUserMode}
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
            orderRoute={orderRoute}
            driverLocation={currentLocation.coords}
            onRoutesReady={handleRoutesReady}
            onRouteInfoUpdated={handleRouteInfoUpdated}
          />
        )}
      </Mapbox.MapView>

      {/* Action buttons - MOVED OUTSIDE the MapView but still inside MapContainer */}
      <View style={styles.actionButtonsPanel}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleNavigateToOrders}
          accessibilityLabel="Audio Settings"
        >
          <Feather name="triangle" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleNavigateToSettings}
          accessibilityLabel="App Settings"
        >
          <MaterialIcons name="settings" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleNavigateToStats}
          accessibilityLabel="View Statistics"
        >
          <MaterialIcons name="align-vertical-bottom" size={20} color="#fff" />
        </TouchableOpacity>

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
            size={22}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </MapContainer>
  );
};

const styles = StyleSheet.create({
  actionButtonsPanel: {
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
    backgroundColor: "black",
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
    backgroundColor: "#FF5722", // Orange color
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
