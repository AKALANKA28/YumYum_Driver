import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OrderDetailsBottomSheet from '../components/NavigationScreen/OrderDetailsBottomSheet';
import { useDriverContext } from '../context/DriverContext';
import { router } from 'expo-router';
import { MapboxNavigationView } from '@youssefhenna/expo-mapbox-navigation';

// Main Navigation Screen component
const NavigationScreen = () => {
    // Sample coordinates for demonstration purposes
    const [coordinates, setCoordinates] = useState([
        { longitude: -122.4194, latitude: 37.7749 },  // San Francisco
        { longitude: -122.2711, latitude: 37.8044 },  // Berkeley
        { longitude: -122.0308, latitude: 37.9733 }   // Concord
    ]);

    return (
        <MapboxNavigationView
            style={{ flex: 1 }}
            coordinates={coordinates}
        />
    );
};

export default NavigationScreen;