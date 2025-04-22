import React from "react";
import { View, StyleSheet } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

// Define types for coordinates
interface Coordinate {
  latitude: number;
  longitude: number;
}

// Define the prop types for OrderRouteDisplay
interface OrderRouteDisplayProps {
  orderRoute: Coordinate[];
}

// Helper function to convert standard map coordinates to Mapbox format
const coordToMapbox = (coord: Coordinate): [number, number] => [coord.longitude, coord.latitude];

const OrderRouteDisplay: React.FC<OrderRouteDisplayProps> = ({ orderRoute }) => {
  // Convert route to Mapbox format
  const mapboxRouteCoords = orderRoute.map(coord => coordToMapbox(coord));
  
  const pickupPoint = mapboxRouteCoords[0];
  const deliveryPoint = mapboxRouteCoords[mapboxRouteCoords.length - 1];

  return (
    <>
      {/* Route line */}
      <MapboxGL.ShapeSource 
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
        <MapboxGL.LineLayer
          id="routeLine"
          style={{
            lineColor: '#f23f07',
            lineWidth: 4
          }}
        />
      </MapboxGL.ShapeSource>
      
      {/* Pickup marker */}
      <MapboxGL.PointAnnotation
        id="pickupPoint"
        coordinate={pickupPoint}
        title="Pickup Location"
      >
        <View style={styles.markerContainer}>
          <FontAwesome5 name="store" size={20} color="#f23f07" />
        </View>
      </MapboxGL.PointAnnotation>
      
      {/* Delivery marker */}
      <MapboxGL.PointAnnotation
        id="deliveryPoint"
        coordinate={deliveryPoint}
        title="Delivery Location"
      >
        <View style={styles.markerContainer}>
          <Ionicons name="location" size={20} color="#f23f07" />
        </View>
      </MapboxGL.PointAnnotation>
    </>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  }
});

export default OrderRouteDisplay;