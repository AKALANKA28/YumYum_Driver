import React, { useEffect, useRef } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Easing,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Entypo,
} from "@expo/vector-icons";
import { useDriverContext } from "../../context/DriverContext";
import {
  OrderDetailsContent,
  OrderInfoRow,
  OrderTimeDistance,
  OrderAddressText,
  AcceptOrderButton,
  AcceptOrderButtonText,
} from "./styles";
import { router } from "expo-router";
import Svg, { Circle } from "react-native-svg";

interface OrderDetailsProps {
  opacity: Animated.Value;
  onAcceptOrder?: () => void;
  onDeclineOrder?: () => void;
}

const OrderDetails = ({
  opacity,
  onAcceptOrder,
  onDeclineOrder,
}: OrderDetailsProps) => {
  const {
    declineOrder,
    orderTimer,
    timerStrokeAnimation,
    orderDetails,
    acceptOrder,
    routeInfo,
  } = useDriverContext();
  
  // Format distance for display
  const formatDistance = (meters: number | undefined): string => {
    if (!meters) return "N/A";
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };
  
  // Format duration for display
  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return "N/A";
    if (seconds < 60) {
      return `${Math.round(seconds)} sec`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)} min`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.round((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  // Get pickup and delivery distances
  const pickupDistanceFormatted = routeInfo ? formatDistance(routeInfo.pickupDistance) : "Calculating...";
  const deliveryDistanceFormatted = routeInfo ? formatDistance(routeInfo.deliveryDistance) : "Calculating...";
  
  // Get total distance and duration
  const totalDistanceFormatted = routeInfo ? formatDistance(routeInfo.totalDistance) : orderDetails?.distance || "Calculating...";
  const totalDurationFormatted = routeInfo ? formatDuration(routeInfo.totalDuration) : orderDetails?.time || "Calculating...";

  // Handler functions that call both context functions and props
  const handleAccept = () => {
    acceptOrder();
    if (onAcceptOrder) onAcceptOrder();
    router.push("/(app)/navigation");
  };

  const handleDecline = () => {
    declineOrder();
    if (onDeclineOrder) onDeclineOrder();
  };
  
  // Calculate circle dimensions for the timer
  const size = 52; // Size of the whole timer component
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Create animation ref for the timer circle
  const timerAnimation = useRef(new Animated.Value(0)).current;
  
  // Calculate the stroke dashoffset based on the timer progress
  // FIXED: Changed the interpolation to correctly reduce the orange arc
  const strokeDashoffset = timerAnimation.interpolate({
    inputRange: [0, 15],
    outputRange: [circumference, 0], // Start with full circle and reduce to 0
  });
  
  // Set up the animation when component mounts
  useEffect(() => {
    // Reset animation value to starting position
    timerAnimation.setValue(0);
    
    // Start the countdown animation for 15 seconds
    Animated.timing(timerAnimation, {
      toValue: 15,
      duration: 15000,
      easing: Easing.linear, // Use linear easing for consistent countdown
      useNativeDriver: true,
    }).start();
    
    // Optional: Add a timer completion callback
    const timerTimeout = setTimeout(() => {
      console.log('Timer completed');
      // You could automatically dismiss here if desired
      // handleDecline();
    }, 15000);
    
    // Clean up timeout on unmount
    return () => clearTimeout(timerTimeout);
  }, []);

  // Create an AnimatedCircle component
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <OrderDetailsContent style={{ opacity }}>
      {/* Content Container with proper padding */}
      <View style={styles.contentContainer}>
        {/* Timer around close button */}
        <View style={styles.closeButtonContainer}>
          {/* SVG Timer Ring */}
          <Svg width={size} height={size} style={styles.timerRing}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated progress circle - FIXED */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#FF5722"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          
          {/* Close button - smaller than the timer ring */}
          <TouchableOpacity style={styles.closeButton} onPress={handleDecline}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Payment Amount */}
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentAmount}>+ ${orderDetails?.payment}</Text>
          <Text style={styles.paymentNote}>Includes expected tip</Text>
        </View>

        {/* Time and Distance with Separator */}
        <OrderInfoRow style={styles.timeDistanceRow}>
          <View style={styles.timeDistanceContent}>
            <MaterialIcons
              name="access-time"
              size={18}
              color="white"
              style={styles.timeIcon}
            />
            <OrderTimeDistance>
              {totalDurationFormatted} <Text style={styles.separator}>|</Text> {totalDistanceFormatted} total
            </OrderTimeDistance>
          </View>
        </OrderInfoRow>

        {/* Restaurant and delivery locations with vertical separator */}
        <View style={styles.locationsContainer}>
          {/* Route visualization with vertical line */}
          <View style={styles.routeVisualization}>
            {/* Restaurant dot */}
            <View style={styles.routeStart}>
              <Ionicons name="ellipse" size={8} color="white" />
            </View>

            {/* Vertical line */}
            <View style={styles.verticalLine}>
              {/* Using dots to create a dashed vertical line */}
              {[...Array(4)].map((_, i) => (
                <Entypo
                  key={i}
                  name="dot-single"
                  size={12}
                  color="rgba(255, 255, 255, 0.6)"
                />
              ))}
            </View>

            {/* Destination square */}
            <View style={styles.routeEnd}>
              <FontAwesome name="square" size={8} color="white" />
            </View>
          </View>

          {/* Location details */}
          <View style={styles.locationsDetails}>
            {/* Restaurant */}
            <Text style={styles.subText}>Pickup Location</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>
                {orderDetails?.restaurantName}
              </Text>
              <Text style={styles.locationText}>{pickupDistanceFormatted}</Text>
            </View>

            {/* Space that aligns with vertical line */}
            <View style={styles.locationSpacing} />

            {/* Delivery address */}
            <Text style={styles.subText}>Deliver</Text>

            <View style={styles.locationRow}>
              <OrderAddressText>{orderDetails?.address}</OrderAddressText>
              <Text style={styles.locationText}>{deliveryDistanceFormatted}</Text>
            </View>
          </View>
        </View>

        {/* Accept button */}
        <AcceptOrderButton onPress={handleAccept}>
          <AcceptOrderButtonText>Accept</AcceptOrderButtonText>
        </AcceptOrderButton>
      </View>
    </OrderDetailsContent>
  );
};

// Updated styles to accommodate the timer
const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    width: "100%",
  },
  closeButtonContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 52, // Larger to accommodate timer ring
    height: 52, // Larger to accommodate timer ring
    alignItems: "center",
    justifyContent: "center",
  },
  timerRing: {
    position: "absolute",
    transform: [{ rotateZ: "-90deg" }],
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentContainer: {
    marginBottom: 12,
  },
  paymentAmount: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#fff",
  },
  paymentNote: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    backgroundColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    width: 133,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginTop: 2,
  },
  timeDistanceRow: {
    justifyContent: "flex-start",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  timeDistanceContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 8,
  },
  separator: {
    color: "rgba(255, 255, 255, 0.6)",
    paddingHorizontal: 6,
    fontWeight: "normal",
  },
  locationsContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    marginTop: 5,
  },
  routeVisualization: {
    width: 30,
    alignItems: "center",
    justifyContent: "flex-start",
    marginRight: 5,
    paddingTop: 8,
  },
  routeStart: {
    zIndex: 1,
  },
  routeEnd: {
    zIndex: 1,
  },
  verticalLine: {
    alignItems: "center",
    marginVertical: 2,
    height: 40,
  },
  locationsDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  locationSpacing: {
    height: 24,
  },
  locationText: {
    color: "#fff",
    fontSize: 18,
  },
  subText: {
    color: "#666666",
    fontSize: 14,
  },
});

export default OrderDetails;