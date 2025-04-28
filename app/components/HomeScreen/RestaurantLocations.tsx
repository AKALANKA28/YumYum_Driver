import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { MaterialIcons } from "@expo/vector-icons";
import { RestaurantLocationsProps } from "./types/restaurantDisplay";


const RestaurantLocations: React.FC<RestaurantLocationsProps> = ({
  restaurants,
  isOnline,
  onMarkerPress,
}) => {
  // Don't render if driver is offline
  if (!isOnline) {
    return null;
  }

  // Memoize restaurant markers to prevent unnecessary re-renders
  const restaurantMarkers = useMemo(() => {
    return restaurants.map((restaurant) => (
      <Mapbox.MarkerView
        key={restaurant.id}
        id={`restaurant-${restaurant.id}`}
        coordinate={[
          restaurant.coordinates.longitude,
          restaurant.coordinates.latitude,
        ]}
        anchor={{ x: 0.5, y: 1.0 }}
      >
        <View 
          style={styles.markerContainer}
          onTouchEnd={() => onMarkerPress?.(restaurant)}
        >
          {/* Restaurant icon */}
          <View style={styles.markerIconContainer}>
            <MaterialIcons name="restaurant" size={16} color="#fff" />
          </View>
          
          {/* Restaurant name bubble */}
          <View style={styles.markerBubble}>
            <Text 
              style={styles.markerText}
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {restaurant.name}
            </Text>
          </View>
        </View>
      </Mapbox.MarkerView>
    ));
  }, [restaurants, onMarkerPress]);

  return <>{restaurantMarkers}</>;
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    width: 140,
  },
  markerIconContainer: {
    backgroundColor: "#ff5722",
    padding: 8,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerBubble: {
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    maxWidth: 140,
  },
  markerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default RestaurantLocations;