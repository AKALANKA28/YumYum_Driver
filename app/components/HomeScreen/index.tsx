import React from "react";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import { useDriverContext } from "../../context/DriverContext";
import { Container } from "./styles";
import MapDisplay from "./MapDisplay";
import EarningsCardComponent from "./EarningsCard";
import ProfileButtonComponent from "./ProfileButton";
import OnlineStatusBadgeComponent from "./OnlineStatusBadge";
import OrderButton from "./OrdersButton";
import ErrorView from "./ErrorView";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SwipeableBottomSheet from "./SwipeableBottomSheet";

const MapScreen = () => {
  const { isOnline, showingOrderDetails, isLoading, error } =
    useDriverContext();

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Base Map and UI Elements */}
      <MapDisplay />
      <EarningsCardComponent />
      <ProfileButtonComponent />
      {isOnline && !showingOrderDetails && <OnlineStatusBadgeComponent />}

      {/* Order Button */}
      <OrderButton />
      {/* Bottom Sheet */}
      
      {/* <SwipeableBottomSheet /> */}

      {isLoading && <LoadingIndicator />}
    </GestureHandlerRootView>
  );
};

const LoadingIndicator = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#f23f07" />
      <Text style={{ marginTop: 10, fontWeight: "500" }}>Loading map...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MapScreen;
