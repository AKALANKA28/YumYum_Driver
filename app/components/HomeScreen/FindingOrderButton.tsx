import React, { useEffect, useRef } from "react";
import { TouchableOpacity, StyleSheet, Animated } from "react-native";
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
  const { cancelFindingOrders } = useDriverContext();

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
});

export default FindingOrdersButton;