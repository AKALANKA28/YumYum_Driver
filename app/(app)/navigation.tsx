import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import NavigationView from '../components/NavigationScreen/NavigationView';
import { useDriverContext } from '../context/DriverContext';
import DestinationBottomSheet from '../components/NavigationScreen/DestinationBottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';

const NavigationScreen = () => {
  // Get navigation parameters from URL
  const params = useLocalSearchParams();
  const initialMode = params.mode as 'pickup' | 'delivery' || 'pickup';
  const orderId = params.orderId as string;

  // Local state for navigation mode (so we can change it during the flow)
  const [navigationMode, setNavigationMode] = useState(initialMode);
  
  // Track whether to show completion screen
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  // Bottom sheet reference
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Get data from context
  const { orderDetails, currentLocation } = useDriverContext();
  
  // Format order details for the bottom sheet
  const formattedOrderDetails = {
    price: `$${orderDetails?.payment || '0.00'}`,
    pickup: {
      time: orderDetails?.time || '10:10 PM',
      items: ['Margherita pizza', 'Pepperoni Pizza', 'Hawaiian Pizza', 'Cheese Pizza'], // Add actual items when available
    },
    customer: {
      name: 'Lisa C. Torrez', // Replace with actual customer name when available
      image: undefined,
      code: 'YUM-4582', // Replace with actual order code when available
    },
    payment: {
      peakPay: 8.00,
      basePay: 0.00,
      tip: 2.00,
      total: 10.00
    }
  };

  // Handle arrival at destination
  const handleFinalDestinationArrival = () => {
    console.log(`Arrived at ${navigationMode === "pickup" ? "restaurant" : "customer location"}`);
    bottomSheetRef.current?.expand();
  };
  
  // Handle pickup completion
  const handlePickupConfirmed = () => {
    console.log("Pickup confirmed, navigating to customer");
    
    // Collapse bottom sheet
    bottomSheetRef.current?.collapse();
    
    // Switch to delivery mode
    setNavigationMode("delivery");
    
    // Short delay before showing the delivery instructions
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0); // Show just the header (10%)
    }, 1000);
  };
  
  // Handle delivery completion
  const handleDeliveryConfirmed = () => {
    console.log("Delivery confirmed, order completed");
    
    // Close the bottom sheet completely
    bottomSheetRef.current?.close();
    
    // Show the completion screen
    setShowCompletionScreen(true);
  };
  
  // Choose the appropriate confirmation handler based on mode
  const handleConfirmation = () => {
    if (navigationMode === "pickup") {
      handlePickupConfirmed();
    } else {
      handleDeliveryConfirmed();
    }
  };
  
  // For initial setup - show just the header initially
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0); // Just show header initially (10%)
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <NavigationView 
        navigationMode={navigationMode} 
        orderId={orderId} 
        driverLocation={currentLocation?.coords}
        onFinalDestinationArrival={handleFinalDestinationArrival}
        showCompletionScreen={showCompletionScreen}
        setShowCompletionScreen={setShowCompletionScreen}
      />
      
      <DestinationBottomSheet
        ref={bottomSheetRef}
        navigationMode={navigationMode}
        onConfirm={handleConfirmation}
        onCancel={() => bottomSheetRef.current?.collapse()}
        orderDetails={formattedOrderDetails}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default NavigationScreen;