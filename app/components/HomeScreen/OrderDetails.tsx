import React from "react";
import { Animated, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDriverContext } from "../../src/context/DriverContext";
import {
  OrderDetailsContent,
  TimerCircle,
  TimerText,
  OrderInfoRow,
  OrderTimeDistance,
  OrderAddressContainer,
  OrderAddressText,
  OrderAddressSubText,
  AcceptOrderButton,
  AcceptOrderButtonText,
} from "./styles";

interface OrderDetailsProps {
  opacity: Animated.Value;
}

const OrderDetails = ({ opacity }: OrderDetailsProps) => {
  const {
    declineOrder,
    orderTimer,
    timerStrokeAnimation,
    orderDetails,
    acceptOrder,
  } = useDriverContext();

  return (
    <OrderDetailsContent style={{ opacity }}>
      {/* Timer with close button functionality */}
      <TimerCircle onPress={declineOrder}>
        <TimerText>{orderTimer}</TimerText>
        <Animated.View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: 20,
            borderWidth: 2,
            borderColor: "transparent",
            borderTopColor: "#f23f07",
            transform: [{ rotateZ: timerStrokeAnimation }],
          }}
        />
      </TimerCircle>

      {/* Order time and distance */}
      <OrderInfoRow>
        <OrderTimeDistance>
          {orderDetails.time} • {orderDetails.distance}
        </OrderTimeDistance>
      </OrderInfoRow>

      {/* Order address */}
      <OrderAddressContainer>
        <OrderAddressText>Delivery to: {orderDetails.address}</OrderAddressText>
        <OrderAddressSubText>{orderDetails.city}</OrderAddressSubText>
      </OrderAddressContainer>

      {/* Accept button */}
      <AcceptOrderButton onPress={acceptOrder}>
        <Ionicons name="receipt-outline" size={24} color="white" />
        <AcceptOrderButtonText>Accept Order</AcceptOrderButtonText>
      </AcceptOrderButton>
    </OrderDetailsContent>
  );
};

export default OrderDetails;
