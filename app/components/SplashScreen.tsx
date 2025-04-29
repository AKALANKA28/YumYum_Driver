// Modified SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import QuickServeLogo from '../../assets/images/logo2.png';
export default function SplashScreen() {
  // Animation for fade-in effect
  const fadeAnim = new Animated.Value(0);
  
  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
     }, []);
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <Image source={QuickServeLogo} style={{ width: 200, height: 200 }} />
        <Text style={styles.logoText}>QuickServe</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, 

  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    marginTop: 20,
    color: 'white',
    fontSize: 34,
    fontWeight: 'bold',
  }
});