import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { DriverContextProvider } from "../context/DriverContext";
import MapScreen from "../components/HomeScreen";
import { useLoading } from "../context/LoadingContext";
import ProfileButtonComponent from "../components/HomeScreen/ProfileButton";
import EarningsCardComponent from "../components/HomeScreen/EarningsCard";
import OrderButton from "../components/HomeScreen/OrdersButton";

// Track if home has been mounted before
let homeInitialized = false;

const Home = () => {
  const { logLoadingState } = useLoading();

  // Set home loading state only once
  useEffect(() => {
    console.log("HOME: Home screen mounted");
    // Signal that the home screen has loaded
    logLoadingState('home', false);
  }, []);

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <DriverContextProvider>
        <MapScreen />
        <ProfileButtonComponent />
        {/* <EarningsCardComponent /> */}
        <OrderButton />
      </DriverContextProvider>
    </>
  );
};

export default Home;
