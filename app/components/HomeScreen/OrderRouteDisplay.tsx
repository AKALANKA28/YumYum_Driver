import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { Ionicons } from "@expo/vector-icons";
import { Coordinate, OrderRouteDisplayProps, RouteInfo } from "./types/routeDisplay";

// Helper function to convert standard map coordinates to Mapbox format
const coordToMapbox = (coord: Coordinate): [number, number] => [
  coord.longitude,
  coord.latitude,
];

// Add route distance and duration types
const OrderRouteDisplay: React.FC<OrderRouteDisplayProps> = ({
  orderRoute,
  driverLocation,
  apiKey = "pk.eyJ1IjoiYWthbGFua2EtIiwiYSI6ImNtOW1jNHFnaDA2eHAybHMzYTQya2dyMzIifQ.KVriyRUmtMCiOxWwHGGrtQ",
  onRoutesReady,
  onRouteInfoUpdated,
}) => {
  const [pickupCoordinates, setPickupCoordinates] = useState<
    [number, number][] | null
  >(null);
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<
    [number, number][] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track if we've already fetched routes and notified about them
  const routesFetched = useRef(false);
  const boundsNotified = useRef(false);
  const loggingDone = useRef(false);

  // Memoize these values to prevent unnecessary recalculations
  const mapboxRouteCoords = useMemo(
    () => orderRoute.map((coord) => coordToMapbox(coord)),
    [orderRoute]
  );

  // Get restaurant and customer coordinates
  const restaurantPoint = useMemo(
    () => (mapboxRouteCoords.length > 0 ? mapboxRouteCoords[0] : null),
    [mapboxRouteCoords]
  );

  const customerPoint = useMemo(
    () =>
      mapboxRouteCoords.length > 0
        ? mapboxRouteCoords[mapboxRouteCoords.length - 1]
        : null,
    [mapboxRouteCoords]
  );

  // Get driver location in Mapbox format
  const driverPoint = useMemo(
    () =>
      driverLocation
        ? ([driverLocation.longitude, driverLocation.latitude] as [
            number,
            number
          ])
        : null,
    [driverLocation]
  );

  // Generate a unique key for this set of coordinates to track changes
  const coordsKey = useMemo(() => {
    if (!driverPoint || !restaurantPoint || !customerPoint) return null;
    return `${driverPoint[0]},${driverPoint[1]}-${restaurantPoint[0]},${restaurantPoint[1]}-${customerPoint[0]},${customerPoint[1]}`;
  }, [driverPoint, restaurantPoint, customerPoint]);

  // Reset bounds notification when coordinates change
  useEffect(() => {
    // Reset notification flag when coordsKey changes (which means our route coordinates changed)
    if (coordsKey) {
      boundsNotified.current = false;
    }
  }, [coordsKey]);

  useEffect(() => {
    // Only log once
    if (
      !loggingDone.current &&
      driverPoint &&
      restaurantPoint &&
      customerPoint
    ) {
      console.log("Driver coordinates:", driverPoint);
      console.log("Restaurant coordinates:", restaurantPoint);
      console.log("Customer coordinates:", customerPoint);
      loggingDone.current = true;
    }

    // Only fetch routes once when we have all required coordinates and a new coords key
    if (
      coordsKey &&
      !routesFetched.current &&
      driverPoint &&
      restaurantPoint &&
      customerPoint
    ) {
      fetchRoutes();
      routesFetched.current = true;
    }

    // Reset flags when coordsKey changes (which means our coordinates changed significantly)
    return () => {
      if (coordsKey) {
        routesFetched.current = false;
        loggingDone.current = false;
      }
    };
  }, [coordsKey]); // Only depend on the coordsKey, not all the individual coordinates

  useEffect(() => {
    // If we have all route coordinates and bounds notification hasn't been sent yet, calculate bounds
    if ((pickupCoordinates || deliveryCoordinates) && !boundsNotified.current && onRoutesReady) {
      try {
        // Combine all coordinates to find bounds
        const allCoordinates = [
          ...(pickupCoordinates || []),
          ...(deliveryCoordinates || []),
        ];
        
        if (allCoordinates.length > 1) {
          // Find min and max values to create a bounding box
          let minLng = Infinity;
          let maxLng = -Infinity;
          let minLat = Infinity;
          let maxLat = -Infinity;
          
          allCoordinates.forEach(coord => {
            minLng = Math.min(minLng, coord[0]);
            maxLng = Math.max(maxLng, coord[0]);
            minLat = Math.min(minLat, coord[1]);
            maxLat = Math.max(maxLat, coord[1]);
          });
          
          // Add padding (about 20% on each side)
          const lngPadding = (maxLng - minLng) * 0.2;
          const latPadding = (maxLat - minLat) * 0.2;
          
          // Create bounding box with padding
          const bounds: [number, number, number, number] = [
            minLng - lngPadding,
            minLat - latPadding,
            maxLng + lngPadding,
            maxLat + latPadding
          ];
          
          console.log("Calculated route bounds:", bounds);
          
          // Notify parent component to update camera once
          onRoutesReady(bounds);
          boundsNotified.current = true;
        } else {
          console.warn("Not enough coordinates to calculate bounds");
        }
      } catch (err) {
        console.error("Error calculating route bounds:", err);
      }
    }
  }, [pickupCoordinates, deliveryCoordinates, onRoutesReady]);
  const fetchRoutes = async () => {
    if (!driverPoint || !restaurantPoint || !customerPoint) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching routes with distance and duration information");

      // Add annotations=distance,duration to get distance and duration data
      const pickupUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${driverPoint[0]},${driverPoint[1]};${restaurantPoint[0]},${restaurantPoint[1]}?alternatives=false&geometries=geojson&overview=full&steps=false&annotations=distance,duration&access_token=${apiKey}`;
      const deliveryUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${restaurantPoint[0]},${restaurantPoint[1]};${customerPoint[0]},${customerPoint[1]}?alternatives=false&geometries=geojson&overview=full&steps=false&annotations=distance,duration&access_token=${apiKey}`;

      // Fetch both routes in parallel
      const [pickupResponse, deliveryResponse] = await Promise.all([
        fetch(pickupUrl),
        fetch(deliveryUrl),
      ]);

      // Parse JSON responses
      const pickupData = await pickupResponse.json();
      const deliveryData = await deliveryResponse.json();

      // Collect route info
      let pickupDistance = 0;
      let pickupDuration = 0;
      let deliveryDistance = 0;
      let deliveryDuration = 0;

      // Update state with new route coordinates and extract distance/duration
      if (pickupData.routes && pickupData.routes.length > 0) {
        setPickupCoordinates(pickupData.routes[0].geometry.coordinates);
        pickupDistance = pickupData.routes[0].distance || 0; // in meters
        pickupDuration = pickupData.routes[0].duration || 0; // in seconds
        console.log("Pickup route fetched:", {
          distance: formatDistance(pickupDistance),
          duration: formatDuration(pickupDuration),
        });
      }

      if (deliveryData.routes && deliveryData.routes.length > 0) {
        setDeliveryCoordinates(deliveryData.routes[0].geometry.coordinates);
        deliveryDistance = deliveryData.routes[0].distance || 0; // in meters
        deliveryDuration = deliveryData.routes[0].duration || 0; // in seconds
        console.log("Delivery route fetched:", {
          distance: formatDistance(deliveryDistance),
          duration: formatDuration(deliveryDuration),
        });
      }

      // Calculate totals
      const totalDistance = pickupDistance + deliveryDistance;
      const totalDuration = pickupDuration + deliveryDuration;

      // Notify parent component about route info
      if (onRouteInfoUpdated) {
        const routeInfo: RouteInfo = {
          pickupDistance,
          pickupDuration,
          deliveryDistance,
          deliveryDuration,
          totalDistance,
          totalDuration,
        };

        onRouteInfoUpdated(routeInfo);
        console.log("Route info updated:", {
          totalDistance: formatDistance(totalDistance),
          totalDuration: formatDuration(totalDuration),
        });
      }
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch routes");
      routesFetched.current = false;
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to format distance and duration
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)} sec`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)} min`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.round((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  // Memoize the rendered components to prevent unnecessary re-renders
  const renderPickupRoute = useMemo(() => {
    if (!pickupCoordinates) return null;

    return (
      <Mapbox.ShapeSource
        id="pickupRouteSource"
        shape={{
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: pickupCoordinates,
          },
        }}
      >
        <Mapbox.LineLayer
          id="pickupRouteLine"
          style={{
            lineColor: "black", // Solid black as in the design image
            lineWidth: 3,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      </Mapbox.ShapeSource>
    );
  }, [pickupCoordinates]);

  const renderDeliveryRoute = useMemo(() => {
    if (!deliveryCoordinates) return null;

    return (
      <Mapbox.ShapeSource
        id="deliveryRouteSource"
        shape={{
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: deliveryCoordinates,
          },
        }}
      >
        <Mapbox.LineLayer
          id="deliveryRouteLine"
          style={{
            lineColor: "#FF5722", // Orange-red dashed line
            lineWidth: 3,
            lineCap: "round",
            lineJoin: "round",
            lineDasharray: [1, 2],
          }}
        />
      </Mapbox.ShapeSource>
    );
  }, [deliveryCoordinates]);

  // Render optimized markers
  const renderDriverMarker = useMemo(() => {
    if (!driverPoint) return null;

    return (
      <Mapbox.PointAnnotation
        id="driverPoint"
        coordinate={driverPoint}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View style={styles.driverMarker}>
          <View style={styles.driverInnerCircle} />
        </View>
      </Mapbox.PointAnnotation>
    );
  }, [driverPoint]);

  const renderRestaurantMarker = useMemo(() => {
    if (!restaurantPoint) return null;

    return (
      <Mapbox.PointAnnotation
        id="restaurantPoint"
        coordinate={restaurantPoint}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="restaurant" size={22} color="white" />
        </View>
      </Mapbox.PointAnnotation>
    );
  }, [restaurantPoint]);

  const renderCustomerMarker = useMemo(() => {
    if (!customerPoint) return null;

    return (
      <Mapbox.PointAnnotation
        id="customerPoint"
        coordinate={customerPoint}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="man" size={24} color="white" />
        </View>
      </Mapbox.PointAnnotation>
    );
  }, [customerPoint]);

  return (
    <>
      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f23f07" />
        </View>
      )}

      {/* Pickup route (driver to restaurant) - Solid black line */}
      {renderPickupRoute}

      {/* Delivery route (restaurant to customer) - Dashed orange/red line */}
      {renderDeliveryRoute}

      {/* Markers */}
      {renderRestaurantMarker}
      {renderCustomerMarker}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  // Updated marker styles to match the image
  iconCircle: {
    height: 40,
    width: 40,
    borderRadius: 18,
    backgroundColor: "black", // Black circle with white icons as shown in the image
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  driverMarker: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: "#FF5722", // Orange outer circle
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  driverInnerCircle: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "white", // White inner circle for driver marker
  },
});

export default React.memo(OrderRouteDisplay);
