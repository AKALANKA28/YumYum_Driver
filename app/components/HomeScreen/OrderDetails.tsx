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
  AcceptOrderButtonText,
} from "./styles";
import { router } from "expo-router";

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
  const { declineOrder, orderTimer, orderDetails, acceptOrder, routeInfo } =
    useDriverContext();

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
  const pickupDistanceFormatted = routeInfo
    ? formatDistance(routeInfo.pickupDistance)
    : "Calculating...";
  const deliveryDistanceFormatted = routeInfo
    ? formatDistance(routeInfo.deliveryDistance)
    : "Calculating...";

  // Get total distance and duration
  const totalDistanceFormatted = routeInfo
    ? formatDistance(routeInfo.totalDistance)
    : orderDetails?.distance || "Calculating...";
  const totalDurationFormatted = routeInfo
    ? formatDuration(routeInfo.totalDuration)
    : orderDetails?.time || "Calculating...";

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

  // Create animation for the button width
  const timerWidthAnim = useRef(new Animated.Value(1)).current;

  // Calculate width based on animation value
  const timerWidth = timerWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Set up the animation when component mounts
  useEffect(() => {
    // Reset animation to full width
    timerWidthAnim.setValue(1);

    // Use timing animation with smoother easing
    Animated.timing(timerWidthAnim, {
      toValue: 0,
      duration: 15000, // 15 seconds
      easing: Easing.linear, // Linear animation for consistent speed
      useNativeDriver: false, // Must be false for width animations
    }).start();

    // Auto-decline after 15 seconds
    const timerTimeout = setTimeout(() => {
      console.log("Timer completed");
      handleDecline();
    }, 15000);

    // Clean up timeout on unmount
    return () => clearTimeout(timerTimeout);
  }, []);

  return (
    <OrderDetailsContent style={{ opacity }}>
      <View style={styles.contentContainer}>
        {/* Simplified close button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleDecline}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        {/* Payment Amount */}
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentAmount}>+ Rs{orderDetails?.payment}</Text>
          <Text style={styles.paymentNote}>Includes expected tip</Text>
        </View>

        {/* Time and Distance with Separator */}
        <OrderInfoRow style={styles.timeDistanceRow}>
          <View style={styles.timeDistanceContent}>
            <MaterialIcons
              name="access-time"
              size={18}
              color="black"
              style={styles.timeIcon}
            />
            <OrderTimeDistance>
              {totalDurationFormatted} <Text style={styles.separator}>|</Text>{" "}
              {totalDistanceFormatted} total
            </OrderTimeDistance>
          </View>
        </OrderInfoRow>

        {/* Restaurant and delivery locations with vertical separator */}
        <View style={styles.locationsContainer}>
          {/* Route visualization with vertical line */}
          <View style={styles.routeVisualization}>
            <View style={styles.routeStart}>
              <Ionicons name="ellipse" size={8} color="black" />
            </View>

            <View style={styles.verticalLine}>
              {[...Array(4)].map((_, i) => (
                <Entypo
                  key={i}
                  name="dot-single"
                  size={12}
                  color="rgba(0, 0, 0, 0.6)"
                />
              ))}
            </View>

            <View style={styles.routeEnd}>
              <FontAwesome name="square" size={8} color="black" />
            </View>
          </View>

          {/* Location details */}
          <View style={styles.locationsDetails}>
            <Text style={styles.subText}>Pickup Location</Text>
            <View style={styles.locationRow}>
              <OrderAddressText>
                {orderDetails?.restaurantName}
              </OrderAddressText>
              <Text style={styles.locationText}>{pickupDistanceFormatted}</Text>
            </View>

            <View style={styles.locationSpacing} />

            <Text style={styles.subText}>Deliver</Text>

            <View style={styles.locationRow}>
              <OrderAddressText>{orderDetails?.address}</OrderAddressText>
              <Text style={styles.locationText}>
                {deliveryDistanceFormatted}
              </Text>
            </View>
          </View>
        </View>

        {/* Accept button container with timer wrapper */}
        <View style={styles.acceptButtonContainer}>
          {/* Base button */}
          <View style={styles.acceptButton} />

          {/* Timer overlay - reduces from right to left */}
          <Animated.View
            style={[styles.timerOverlay, { width: timerWidth }]}
            pointerEvents="none"
          />

          {/* Touchable area with text on top of everything */}
          <TouchableOpacity
            style={styles.acceptTouchable}
            onPress={handleAccept}
            activeOpacity={0.8}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </OrderDetailsContent>
  );
};

// Updated styles
const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    width: "100%",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
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
    color: "#000",
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
    borderTopColor: "rgba(37, 37, 37, 0.07)",
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
    color: "rgba(39, 39, 39, 0.1)",
    paddingHorizontal: 6,
    fontWeight: "normal",
  },
  locationsContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(37, 37, 37, 0.07)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(37, 37, 37, 0.07)",
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
    height: 60,
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
    color: "#000",
    fontSize: 18,
  },
  subText: {
    color: "#666666",
    fontSize: 14,
  },
  acceptButtonContainer: {
    position: "relative",
    marginTop: 16,
    height: 56,
    overflow: "hidden",
    borderRadius: 28,
  },
  acceptButton: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 56,
    backgroundColor: "rgba(255, 87, 34, 0.3)",
    borderRadius: 28,
    zIndex: 1,
  },
  acceptTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3, // Higher than both the button and overlay
  },
  acceptButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  timerOverlay: {
    position: "absolute",
    top: 0,
    left: 0, // Position from right edge for right-to-left animation
    height: "100%",
    backgroundColor: "rgb(255, 86, 34)",
    zIndex: 2,
  },
});

export default OrderDetails;
