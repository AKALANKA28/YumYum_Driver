import React from "react";
import { Animated, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome, Entypo } from "@expo/vector-icons";
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
  } = useDriverContext();

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
  
  return (
    <OrderDetailsContent style={{ opacity }}>
      {/* Content Container with proper padding */}
      <View style={styles.contentContainer}>
        {/* Larger close button in top-right corner */}
        <TouchableOpacity style={styles.closeButton} onPress={handleDecline}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Payment Amount */}
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentAmount}>+ ${orderDetails?.payment}</Text>
          <Text style={styles.paymentNote}>Includes expected tip</Text>
        </View>

        {/* Time and Distance with Separator */}
        <OrderInfoRow style={styles.timeDistanceRow}>
          <View style={styles.timeDistanceContent}>
            <MaterialIcons name="access-time" size={18} color="white" style={styles.timeIcon} />
            <OrderTimeDistance>
              + {orderDetails?.time} <Text style={styles.separator}>|</Text> + {orderDetails?.distance} total
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
                <Entypo key={i} name="dot-single" size={12} color="rgba(255, 255, 255, 0.6)" />
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
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>{orderDetails?.restaurantName}</Text>
            </View>
            
            {/* Space that aligns with vertical line */}
            <View style={styles.locationSpacing} />
            
            {/* Delivery address */}
            <View style={styles.locationRow}>
              <OrderAddressText>{orderDetails?.address}</OrderAddressText>
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

// Add new styles without modifying existing ones
const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40, // Larger close button
    height: 40, // Larger close button
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentContainer: {
    marginBottom: 12,
  },
  paymentAmount: {
    fontSize: 52,
    fontWeight: 'bold',
    color: 'white',
  },
  paymentNote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    width: 133, // Larger close button
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginTop: 2,
  },
  timeDistanceRow: {
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  timeDistanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: 8,
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 6,
    fontWeight: 'normal',
  },
  locationsContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 5,
  },
  routeVisualization: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 5,
    paddingTop: 8, // Align with text
  },
  routeStart: {
    zIndex: 1, // Make dot appear on top of line
  },
  routeEnd: {
    zIndex: 1, // Make square appear on top of line
  },
  verticalLine: {
    alignItems: 'center',
    marginVertical: 2,
    height: 40, // Adjust this height based on your content
  },
  locationsDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationSpacing: {
    height: 24, // Adjust based on your vertical line height
  },
  locationText: {
    color: 'white',
    fontSize: 16,
  },
});

export default OrderDetails;