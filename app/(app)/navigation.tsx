import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OrderDetailsBottomSheet from '../components/NavigationScreen/OrderDetailsBottomSheet';
import { useDriverContext } from '../context/DriverContext';
import { router } from 'expo-router';

// Main Navigation Screen component
const NavigationScreen = () => {
  const { orderDetails, orderRoute } = useDriverContext();
  const [mapReady, setMapReady] = useState(false);
  const mapboxRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Add proper validation for route coordinates
  const validOrderRoute = orderRoute && orderRoute.length >= 2 
    ? orderRoute.filter(coord => 
        typeof coord.latitude === 'number' && 
        typeof coord.longitude === 'number')
    : [];
  
  // Only create mapboxRouteCoords if we have valid coordinates
  const mapboxRouteCoords = validOrderRoute.length >= 2
    ? validOrderRoute.map(coord => [coord.longitude, coord.latitude])
    : [];
  
  // Only set restaurant and customer locations if we have valid coordinates
  const restaurantLocation = mapboxRouteCoords.length >= 1 ? mapboxRouteCoords[0] : undefined;
  const customerLocation = mapboxRouteCoords.length >= 2 
    ? mapboxRouteCoords[mapboxRouteCoords.length - 1] 
    : undefined;
  
  // Handle map ready state
  const onMapReady = () => {
    console.log("Navigation map is ready");
    setMapReady(true);
  };

  // Initialize map and show the entire route
  useEffect(() => {
    if (mapReady && cameraRef.current && validOrderRoute.length >= 2) {
      // Calculate bounds to fit the entire route
      const lats = validOrderRoute.map(p => p.latitude);
      const lngs = validOrderRoute.map(p => p.longitude);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      // Add some padding
      const latPadding = (maxLat - minLat) * 0.3;
      const lngPadding = (maxLng - minLng) * 0.3;
      
      // Set camera bounds
      cameraRef.current.fitBounds(
        [minLng - lngPadding, minLat - latPadding], 
        [maxLng + lngPadding, maxLat + latPadding],
        100, // padding
        1000 // animation duration
      );
    }
  }, [mapReady, validOrderRoute]);

  // Toggle turn-by-turn navigation
  const toggleNavigation = () => {
    // Your existing code...
  };

  // Go back to the home screen
  const handleGoBack = () => {
    router.back();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Mapbox Map */}
      <View style={styles.mapContainer}>
        <Mapbox.MapView
          ref={mapboxRef}
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          zoomEnabled={true}
          rotateEnabled={true}
          onDidFinishLoadingMap={onMapReady}
          logoEnabled={false}
        >
          <Mapbox.Camera
            ref={cameraRef}
            zoomLevel={14}
            animationDuration={1000}
            followUserMode={isNavigating ? Mapbox.UserTrackingMode.FollowWithCourse : Mapbox.UserTrackingMode.Follow}
            followZoomLevel={16}
            followPitch={isNavigating ? 60 : 0}
          />
          
          <Mapbox.UserLocation
            visible={true}
            showsUserHeadingIndicator={true}
            minDisplacement={1}
            requestsAlwaysUse={true}
          />
          
          {/* Only render route line if we have valid coordinates */}
          {mapboxRouteCoords.length >= 2 && (
            <Mapbox.ShapeSource 
              id="routeSource" 
              shape={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: mapboxRouteCoords
                }
              }}
            >
              <Mapbox.LineLayer
                id="routeLine"
                style={{
                  lineColor: '#f23f07',
                  lineWidth: 4,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            </Mapbox.ShapeSource>
          )}
          
          {/* Only render restaurant marker if coordinates exist */}
          {restaurantLocation && (
            <Mapbox.PointAnnotation
              id="restaurantPoint"
              coordinate={restaurantLocation}
              title="Restaurant Location"
            >
              <View style={styles.markerContainer}>
                <View style={styles.restaurantMarker}>
                  <Ionicons name="restaurant" size={18} color="white" />
                </View>
              </View>
            </Mapbox.PointAnnotation>
          )}
          
          {/* Only render delivery marker if coordinates exist */}
          {customerLocation && (
            <Mapbox.PointAnnotation
              id="deliveryPoint"
              coordinate={customerLocation}
              title="Delivery Location"
            >
              <View style={styles.markerContainer}>
                <View style={styles.deliveryMarker}>
                  <Ionicons name="location" size={18} color="white" />
                </View>
              </View>
            </Mapbox.PointAnnotation>
          )}
        </Mapbox.MapView>
        
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Navigation button */}
        <TouchableOpacity 
          style={[
            styles.navigationButton,
            isNavigating ? styles.navigationButtonActive : {}
          ]} 
          onPress={toggleNavigation}
        >
          <MaterialIcons 
            name={isNavigating ? "navigation" : "assistant-direction"} 
            size={24} 
            color="white" 
          />
          <Text style={styles.navigationButtonText}>
            {isNavigating ? "Exit Navigation" : "Start Navigation"}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Order Details Bottom Sheet */}
      <OrderDetailsBottomSheet 
        ref={bottomSheetRef}
        orderDetails={orderDetails}
        isNavigating={isNavigating}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#f23f07',
    padding: 10,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navigationButton: {
    position: 'absolute',
    bottom: 200,
    right: 20,
    backgroundColor: '#f23f07',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigationButtonActive: {
    backgroundColor: '#00a651',
  },
  navigationButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  markerContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantMarker: {
    backgroundColor: '#f23f07',
    padding: 5,
    borderRadius: 15,
  },
  deliveryMarker: {
    backgroundColor: '#00a651',
    padding: 5,
    borderRadius: 15,
  },
});

export default NavigationScreen;