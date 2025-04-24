import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Coordinate, OrderRouteDisplayProps } from "./types/routeDisplay";

// // Define types for coordinates
// interface Coordinate {
//   latitude: number;
//   longitude: number;
// }

// // Define the prop types for OrderRouteDisplay
// interface OrderRouteDisplayProps {
//   orderRoute: Coordinate[];
//   apiKey?: string; // Optional API key prop
// }

// // Type for optimized route response
// interface OptimizedRoute {
//   routes: Array<{
//     geometry: {
//       coordinates: [number, number][];
//     };
//     distance: number;
//     duration: number;
//   }>;
// }

// Helper function to convert standard map coordinates to Mapbox format
const coordToMapbox = (coord: Coordinate): [number, number] => [coord.longitude, coord.latitude];

const OrderRouteDisplay: React.FC<OrderRouteDisplayProps> = ({ 
  orderRoute,
  apiKey = "pk.eyJ1IjoiYWthbGFua2EtIiwiYSI6ImNtOW1jNHFnaDA2eHAybHMzYTQya2dyMzIifQ.KVriyRUmtMCiOxWwHGGrtQ"
}) => {
  const [optimizedRouteCoords, setOptimizedRouteCoords] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Convert route to Mapbox format
  const mapboxRouteCoords = orderRoute.map(coord => coordToMapbox(coord));
  
  const pickupPoint = mapboxRouteCoords[0];
  const deliveryPoint = mapboxRouteCoords[mapboxRouteCoords.length - 1];

  useEffect(() => {
    // Only fetch optimized route if we have at least start and end points
    if (orderRoute.length >= 2) {
      fetchOptimizedRoute();
    } else {
      // If insufficient points, just use the original route
      setOptimizedRouteCoords(mapboxRouteCoords);
    }
  }, [orderRoute]);

  const fetchOptimizedRoute = async () => {
    if (orderRoute.length <= 1) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Format coordinates for the API request
      const waypointsString = orderRoute
        .map(coord => `${coord.longitude},${coord.latitude}`)
        .join(';');
      
      // Use Directions API instead of Optimization API for simpler implementation
      // The optimization API requires different parameters and setup
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointsString}?alternatives=false&geometries=geojson&overview=full&steps=false&access_token=${apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes[0] && data.routes[0].geometry) {
        setOptimizedRouteCoords(data.routes[0].geometry.coordinates);
      } else {
        // Fallback to original route if optimization didn't return valid route
        setOptimizedRouteCoords(mapboxRouteCoords);
      }
    } catch (err) {
      console.error("Error fetching optimized route:", err);
      setError(err instanceof Error ? err.message : "Failed to optimize route");
      // Fallback to original route on error
      setOptimizedRouteCoords(mapboxRouteCoords);
    } finally {
      setLoading(false);
    }
  };

  // Use optimized route if available, otherwise fall back to original route
  const displayRouteCoords = optimizedRouteCoords.length > 0 ? optimizedRouteCoords : mapboxRouteCoords;

  return (
    <>
      {/* Loading indicator while fetching optimized route */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f23f07" />
        </View>
      )}
      
      {/* Route line */}
      <Mapbox.ShapeSource 
        id="routeSource" 
        shape={{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: displayRouteCoords
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
      
      {/* Pickup marker */}
      <Mapbox.PointAnnotation
        id="pickupPoint"
        coordinate={pickupPoint}
        title="Pickup Location"
      >
        <View style={styles.markerContainer}>
          <FontAwesome5 name="store" size={20} color="#f23f07" />
        </View>
      </Mapbox.PointAnnotation>
      
      {/* Delivery marker */}
      <Mapbox.PointAnnotation
        id="deliveryPoint"
        coordinate={deliveryPoint}
        title="Delivery Location"
      >
        <View style={styles.markerContainer}>
          <Ionicons name="location" size={20} color="#f23f07" />
        </View>
      </Mapbox.PointAnnotation>
      
      {/* If there are waypoints between start and end, show them too */}
      {mapboxRouteCoords.length > 2 && mapboxRouteCoords.slice(1, -1).map((coord, index) => (
        <Mapbox.PointAnnotation
          key={`waypoint-${index}`}
          id={`waypoint-${index}`}
          coordinate={coord}
          title={`Waypoint ${index + 1}`}
        >
          <View style={styles.waypointContainer}>
            <Ionicons name="radio-button-on" size={14} color="#f23f07" />
          </View>
        </Mapbox.PointAnnotation>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  markerContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  waypointContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  }
});

export default OrderRouteDisplay;