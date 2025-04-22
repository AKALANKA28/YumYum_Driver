import React, { useEffect, useRef } from "react";
import { TouchableOpacity, StyleSheet, Animated, Button, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDriverContext } from "../../context/DriverContext";
import {
  FindingOrdersContent,
  ContentContainer,
  PulsingDot,
  FindingText,
  CloseButton,
} from "./styles";

const FindingOrdersButton = () => {
  const { cancelFindingOrders, receiveOrder } = useDriverContext();

  // Create a local scale animation for smoother initial render
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Start pulsing animation after component mounts
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Cleanup animation on unmount
    return () => {
      pulseAnim.setValue(1);
    };
  }, []);

  // TEMPORARY: Function to test showing order details
  const testShowOrderDetails = () => {
    // This will simulate receiving an order
    receiveOrder();
  };

  return (
    <TouchableOpacity style={styles.container}>
      <FindingOrdersContent>
        <ContentContainer>
          <PulsingDot
            style={{
              transform: [{ scale: pulseAnim }],
            }}
          />
          <FindingText>Finding Orders</FindingText>
          
          {/* TEMPORARY: Testing buttons */}
          <View style={styles.testControls}>
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={testShowOrderDetails}
            >
              <Ionicons name="bag-check" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <CloseButton onPress={cancelFindingOrders}>
            <Ionicons name="close" size={16} color="white" />
          </CloseButton>
        </ContentContainer>
      </FindingOrdersContent>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  // TEMPORARY: Styles for test controls
  testControls: {
    position: 'absolute',
    top: 10,
    right: 50,
    flexDirection: 'row',
  },
  testButton: {
    backgroundColor: '#f23f07',
    padding: 8,
    borderRadius: 15,
    marginLeft: 8,
  }
});

export default FindingOrdersButton;