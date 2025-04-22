import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router"; // Import the router

import { useDriverContext } from "../../context/DriverContext";
import { MapContainer } from "./styles";
import OrderRouteDisplay from "./OrderRouteDisplay";

// Important: Initialize Mapbox with your access token
Mapbox.setAccessToken(
  "pk.eyJ1IjoiYWthbGFua2EtIiwiYSI6ImNtOW1jNHFnaDA2eHAybHMzYTQya2dyMzIifQ.KVriyRUmtMCiOxWwHGGrtQ"
);

// Main MapDisplay component
const MapDisplay = () => {
  const { initialRegion, orderRoute, currentLocation } = useDriverContext();
  const [mapReady, setMapReady] = useState(false);
  const mapboxRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [followUserMode, setFollowUserMode] = useState<Mapbox.UserTrackingMode>(
    Mapbox.UserTrackingMode.Follow
  );

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
  useEffect(() => {
    if (
      mapReady &&
      currentLocation &&
      cameraRef.current &&
      followUserMode === Mapbox.UserTrackingMode.Follow
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
  }, [mapReady, currentLocation, followUserMode]);

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
        <Mapbox.Camera ref={cameraRef} zoomLevel={16} animationDuration={600} />

        <Mapbox.UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
          minDisplacement={1}
          requestsAlwaysUse={true}
        />

        {mapReady && orderRoute && (
          <OrderRouteDisplay orderRoute={orderRoute} />
        )}
      </Mapbox.MapView>

      <View style={styles.actionButtonsPanel}>
        {/* Audio settings button */}
        <TouchableOpacity 
          style={styles.circleButton}
          onPress={handleNavigateToOrders}
          accessibilityLabel="Audio Settings"
        >
          <Feather name="triangle" size={20} color="#fff" />
        </TouchableOpacity>
        
        {/* Statistics button */}
        <TouchableOpacity 
          style={styles.circleButton}
          onPress={handleNavigateToStats}
          accessibilityLabel="View Statistics"
        >
          <MaterialIcons name="settings" size={20} color="#fff" />
        </TouchableOpacity>
        
        {/* Settings button */}
        <TouchableOpacity 
          style={styles.circleButton}
          onPress={handleNavigateToSettings}
          accessibilityLabel="App Settings"
        >
          <MaterialIcons name="align-vertical-bottom" size={20} color="#fff" />
        </TouchableOpacity>
        
        {/* Follow mode toggle button */}
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
  },
});

export default MapDisplay;