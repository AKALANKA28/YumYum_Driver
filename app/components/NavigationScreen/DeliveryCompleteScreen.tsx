import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';

interface DeliveryCompleteScreenProps {
  orderDetails: {
    payment: {
      peakPay: number;
      basePay: number;
      tip: number;
      total: number;
    };
  };
  onClose?: () => void;
  onReschedule?: () => void;
}

const DeliveryCompleteScreen = ({
  orderDetails,
  onClose,
  onReschedule,
}: DeliveryCompleteScreenProps) => {
  
  // Function to handle "Got it" button press
  const handleGotItPress = () => {
    // Execute the onClose function if provided
    if (onClose) {
      onClose();
    }
    
    // Navigate to the Home screen using Expo Router
    router.replace('/');  // Navigate to home screen (root)
  };

  // Function to handle back button press
  const handleBackPress = () => {
    if (onClose) {
      onClose();
    }
    router.back();  // Go back in navigation history
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.successContainer}>
        <View style={styles.successCircleOuter}>
          <View style={styles.successCircleMiddle}>
            <View style={styles.successCircleInner}>
              <Ionicons name="checkmark" size={50} color="white" />
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.titleText}>Delivery Complete!</Text>

      <View style={styles.paymentContainer}>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Peak Pay</Text>
          <Text style={styles.paymentAmount}>
            ${orderDetails.payment.peakPay.toFixed(2)}
          </Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Base Pay</Text>
          <Text style={styles.paymentAmount}>
            ${orderDetails.payment.basePay.toFixed(2)}
          </Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Customer Tip</Text>
          <Text style={styles.paymentAmount}>
            ${orderDetails.payment.tip.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.paymentRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            ${orderDetails.payment.total.toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.gotItButton} onPress={handleGotItPress}>
        <Text style={styles.gotItButtonText}>Got it</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.rescheduleButton} 
        onPress={onReschedule || handleGotItPress}
      >
        <Text style={styles.rescheduleButtonText}>Reschedule</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
  },
  successCircleOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "rgba(255, 87, 34, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  successCircleMiddle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "rgba(255, 87, 34, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  successCircleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FF5722",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "#000",
  },
  paymentContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  paymentLabel: {
    fontSize: 16,
    color: "#888",
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    paddingTop: 15,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF5722",
  },
  gotItButton: {
    backgroundColor: "#FF5722",
    borderRadius: 30,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  gotItButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  rescheduleButton: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 30,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  rescheduleButtonText: {
    color: "#757575",
    fontSize: 18,
    fontWeight: "500",
  },
});

export default DeliveryCompleteScreen;