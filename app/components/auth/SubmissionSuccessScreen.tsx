import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';

interface SubmissionSuccessScreenProps {
  onContinue?: () => void;
}

const SubmissionSuccessScreen = ({ onContinue }: SubmissionSuccessScreenProps) => {
  // Animation values
  const checkmarkScale = new Animated.Value(0);
  const fadeIn = new Animated.Value(0);
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    // Auto navigate to login screen after 5 seconds
    const timer = setTimeout(() => {
      handleContinue();
    }, 5000);
    
    // Clean up timer
    return () => clearTimeout(timer);
  }, []);
  
  // Function to handle "Continue" button press
  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
    
    // Navigate to the login screen
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.successContainer}>
        <Animated.View 
          style={[
            styles.successCircleOuter,
            { transform: [{ scale: checkmarkScale }] }
          ]}
        >
          <View style={styles.successCircleMiddle}>
            <View style={styles.successCircleInner}>
              <Ionicons name="checkmark" size={50} color="white" />
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: fadeIn }}>
        <Text style={styles.titleText}>Application Submitted!</Text>

        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            Your driver application has been successfully submitted for approval. Our team will review your information shortly.
          </Text>

          <View style={styles.infoBox}>
            <Ionicons name="mail-outline" size={24} color="#FF5722" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              You'll receive an email notification once your application has been verified.
            </Text>
          </View>
          
          <View style={styles.infoBox}>
            <Ionicons name="time-outline" size={24} color="#FF5722" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              The review process typically takes 1-3 business days.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    paddingTop: 60,
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
    marginBottom: 30,
    color: "#000",
  },
  messageContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: "row",
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  infoIcon: {
    marginRight: 15,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: "#FF5722",
    borderRadius: 30,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SubmissionSuccessScreen;