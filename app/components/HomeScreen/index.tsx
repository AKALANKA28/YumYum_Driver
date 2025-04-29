import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useDriverContext } from "../../context/DriverContext";
import { useLoading } from "../../context/LoadingContext";
import MapDisplay from "./MapDisplay";
import EarningsCardComponent from "./EarningsCard";
import ProfileButtonComponent from "./ProfileButton";
import OrderButton from "./OrdersButton";
import ErrorView from "./ErrorView";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const MapScreen = () => {
  const { isOnline, showingOrderDetails, isLoading, error } = useDriverContext();
  const { setIsLoading: setGlobalLoading } = useLoading();
  
  // Report loading state up to global context
  useEffect(() => {
    setGlobalLoading(isLoading);
  }, [isLoading, setGlobalLoading]);

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Base Map and UI Elements */}
      <MapDisplay />
      {/* <ProfileButtonComponent /> */}
      {/* <EarningsCardComponent /> */}
      {/* <OrderButton /> */}
      
      {/* No need for local loading indicator now */}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapScreen;