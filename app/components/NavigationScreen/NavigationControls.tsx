import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavigationControlsProps {
  onCancel: () => void;
}

const NavigationControls = ({ onCancel }: NavigationControlsProps) => {
  return (
    <View style={styles.controlsContainer}>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  cancelButton: {
    backgroundColor: '#FF5722',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default NavigationControls;