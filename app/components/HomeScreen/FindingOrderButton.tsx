import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDriverContext } from "../../src/context/DriverContext";
import {
  FindingOrdersContent,
  ContentContainer,
  PulsingDot,
  FindingText,
  CloseButton,
} from "./styles";

const FindingOrdersButton = () => {
  const { cancelFindingOrders, pulseAnim } = useDriverContext();

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
