import React from "react";
import { StatusBar } from "react-native";
import { DriverContextProvider } from "../context/DriverContext";
import MapScreen from "../components/HomeScreen";

const Home = () => {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <DriverContextProvider>
        <MapScreen />
      </DriverContextProvider>
    </>
  );
};

export default Home;

