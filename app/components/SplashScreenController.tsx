import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import CustomSplashScreen from './SplashScreen';
import { useLoading } from '../context/LoadingContext';

type SplashScreenControllerProps = {
  children: ReactNode;
};

export default function SplashScreenController({ children }: SplashScreenControllerProps) {
  const [appIsReady, setAppIsReady] = useState(false);
  const { loadingStates, logLoadingState } = useLoading();
  const [showSplash, setShowSplash] = useState(true);
  
  console.log("SPLASH: Controller initialized");

  // Force transition after a maximum time
  useEffect(() => {
    console.log("SPLASH: Setting up emergency timeout");
    
    // Force app to continue after 8 seconds regardless of loading state
    const emergencyTimeout = setTimeout(() => {
      console.log("SPLASH: Emergency timeout fired! Forcing app to continue.");
      console.log("SPLASH: Current loading states:", JSON.stringify(loadingStates));
      
      // Force all loading states to false
      Object.keys(loadingStates).forEach(key => {
        console.log(`SPLASH: Forcing '${key}' loading state to false`);
        logLoadingState(key, false);
      });
      
      // Force transition
      setAppIsReady(true);
      setTimeout(() => {
        console.log("SPLASH: Hiding splash screen now");
        setShowSplash(false);
      }, 500);
    }, 8000);
    
    return () => clearTimeout(emergencyTimeout);
  }, []);

  // Hide the native splash screen as soon as this component renders
  useEffect(() => {
    async function prepare() {
      try {
        console.log("SPLASH: Hiding native splash screen");
        await ExpoSplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error hiding native splash screen:', e);
      }
    }
    
    prepare();
  }, []);

  // Check if all critical loading states are complete
  useEffect(() => {
    const isLoading = Object.values(loadingStates).some(state => state === true);
    console.log("SPLASH: Loading states updated. Is still loading:", isLoading);
    console.log("SPLASH: Current states:", JSON.stringify(loadingStates));
    
    if (!isLoading && !appIsReady) {
      console.log("SPLASH: All loading complete! Setting app as ready.");
      setAppIsReady(true);
      
      // Add a slight delay for smoother transition
      setTimeout(() => {
        console.log("SPLASH: Hiding custom splash screen now");
        setShowSplash(false);
      }, 2000);
    }
  }, [loadingStates, appIsReady]);

  if (showSplash) {
    return <CustomSplashScreen />;
  }

  console.log("SPLASH: Rendering main app content");
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});