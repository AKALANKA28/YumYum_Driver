import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF5722" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});

export default LoadingScreen;