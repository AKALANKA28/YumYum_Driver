import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useLoading } from '../context/LoadingContext';
import QuickServeSplashScreen from '../components/SplashScreen';

type Props = {
  children: React.ReactNode;
};

const AppLoadingScreen: React.FC<Props> = ({ children }) => {
  const { isLoading } = useLoading();
  const [showSplash, setShowSplash] = useState(true);
  
  // Hide native splash when our component is ready
  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    
    if (!isLoading && !showSplash) {
      hideSplash();
    }
  }, [isLoading, showSplash]);
  
  // Keep our splash visible for minimum time
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading || showSplash) {
    return <QuickServeSplashScreen />;
  }
  
  return <>{children}</>;
};

export default AppLoadingScreen;