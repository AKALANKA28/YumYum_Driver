import React from "react";
import { View, StyleSheet } from "react-native";
import { MapboxNavigationView } from "@youssefhenna/expo-mapbox-navigation";
import DeliveryCompleteScreen from "./DeliveryCompleteScreen";
import { useDriverContext } from "../../context/DriverContext";

interface NavigationViewProps {
  navigationMode: "pickup" | "delivery";
  orderId?: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  onFinalDestinationArrival: () => void;
  showCompletionScreen: boolean;
  setShowCompletionScreen: (show: boolean) => void;
}

const NavigationView = ({ 
  navigationMode, 
  driverLocation,
  onFinalDestinationArrival,
  showCompletionScreen,
  setShowCompletionScreen
}: NavigationViewProps) => {
  // Get order details from context
  const { orderDetails } = useDriverContext();

  // Define restaurant and customer coordinates from context or fallbacks
  const restaurantCoordinates = orderDetails?.currentRoute?.restaurantCoordinates || { 
    latitude: 6.8517, 
    longitude: 80.0327 
  };
  
  const customerCoordinates = orderDetails?.currentRoute?.customerCoordinates || { 
    latitude: 6.910771, 
    longitude: 79.885107 
  };

  // Use driver location from props or fallback to default
  const driverCurrentLocation = driverLocation || { 
    latitude: 6.8317, 
    longitude: 80.0127 
  };

  // Current route based on navigation mode
  const currentCoordinates = navigationMode === "pickup" 
    ? [
        driverCurrentLocation, // Driver current location
        restaurantCoordinates // Restaurant location
      ]
    : [
        restaurantCoordinates, // Restaurant location (starting point for delivery)
        customerCoordinates // Customer location
      ];
  
  // Payment details for the completion screen
  const paymentDetails = {
    payment: {
      peakPay: 8.00,
      basePay: 0.00,
      tip: 2.00,
      total: 10.00
    }
  };
  
  // Handle closing the completion screen
  const handleCompletionClose = () => {
    setShowCompletionScreen(false);
  };

  // Show the delivery complete screen if delivery is finished
  if (showCompletionScreen) {
    return (
      <DeliveryCompleteScreen
        orderDetails={paymentDetails}
        onClose={handleCompletionClose}
      />
    );
  }

  return (
    <View style={styles.container}>
      <MapboxNavigationView
        style={styles.navigationView}
        coordinates={currentCoordinates}
        waypointIndices={[0, 1]}
        onFinalDestinationArrival={onFinalDestinationArrival}
        // shouldSimulateRoute={true} // For testing - remove in production
        // showsEndOfRouteFeedback={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigationView: {
    flex: 1,
  },
});

export default NavigationView;