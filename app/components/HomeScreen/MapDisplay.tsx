import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Mapbox from '@rnmapbox/maps';
import { MaterialIcons } from "@expo/vector-icons";

import { useDriverContext } from "../../context/DriverContext";
import { MapContainer } from "./styles";
import OrderRouteDisplay from "./OrderRouteDisplay";

// Important: Initialize Mapbox with your access token
Mapbox.setAccessToken('pk.eyJ1IjoiYWthbGFua2EtIiwiYSI6ImNtOW1jNHFnaDA2eHAybHMzYTQya2dyMzIifQ.KVriyRUmtMCiOxWwHGGrtQ');

// Main MapDisplay component
const MapDisplay = () => {
  const { initialRegion, orderRoute, currentLocation } = useDriverContext();
  const [mapReady, setMapReady] = useState(false);
  const mapboxRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [followUserMode, setFollowUserMode] = useState<Mapbox.UserTrackingMode>(Mapbox.UserTrackingMode.Follow);
  
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
    if (mapReady && currentLocation && cameraRef.current && followUserMode === Mapbox.UserTrackingMode.Follow) {
      try {
        cameraRef.current.setCamera({
          centerCoordinate: [currentLocation.coords.longitude, currentLocation.coords.latitude],
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
    setFollowUserMode(prevMode => 
      prevMode === Mapbox.UserTrackingMode.Follow 
        ? Mapbox.UserTrackingMode.FollowWithHeading 
        : Mapbox.UserTrackingMode.Follow
    );
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
        />
        
        <Mapbox.UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
          minDisplacement={1}
          requestsAlwaysUse={true}
        />
        
        {mapReady && orderRoute && <OrderRouteDisplay orderRoute={orderRoute} />}
      </Mapbox.MapView>

      {/* Follow mode toggle button */}
      <TouchableOpacity 
        style={styles.followButton}
        onPress={toggleFollowMode}
      >
        <MaterialIcons 
          name={followUserMode === Mapbox.UserTrackingMode.Follow ? "my-location" : "location-searching"} 
          size={24} 
          color="white"
        />
      </TouchableOpacity>
    </MapContainer>
  );
};

const styles = StyleSheet.create({
  followButton: {
    position: 'absolute',
    bottom: 30,
    right: 16,
    backgroundColor: 'black',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});

export default MapDisplay;