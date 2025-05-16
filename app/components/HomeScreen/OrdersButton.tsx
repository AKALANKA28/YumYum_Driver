import React, { useRef, useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  View,
} from "react-native";
import { useDriverContext } from "../../context/DriverContext";
import { ExpandableButtonContainer } from "./styles";
import FindingOrdersButton from "./FindingOrderButton";
import GoOnlineButton from "./GoOnlineButton";
import OrderDetails from "./OrderDetails";
import { Audio } from "expo-av";

const OrderButton = () => {
  const {
    isFindingOrders,
    showingOrderDetails,
    buttonWidth,
    buttonHeight,
    buttonLeft,
    buttonBottom,
    buttonBorderRadius,
    contentOpacity,
    orderDetailsOpacity,
    toggleOnlineStatus,
    isOnline,
  } = useDriverContext();

  // Add refs for fade animations and sound
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const sound = useRef<Audio.Sound | null>(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const soundLoopCount = useRef(0);
  const maxSoundLoops = 10; // Maximum number of times to repeat the sound

  // Handle smooth transition between button states
  useEffect(() => {
    // Fade out current content
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      // Fade in new content after a small delay
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        delay: 50, // Small delay to ensure layout changes complete
      }),
    ]).start();

    // Play notification sound when order details appear
    if (showingOrderDetails) {
      playOrderSound();
    } else {
      // Stop sound when order details are dismissed
      stopOrderSound();
    }
  }, [isFindingOrders, showingOrderDetails]);

  // Auto-trigger order after going online
  // useEffect(() => {
  //   let orderTimer: NodeJS.Timeout;
    
  //   // if (isOnline && isFindingOrders) {
  //   //   // Set a timer to automatically receive an order after 3 seconds
  //   //   orderTimer = setTimeout(() => {
  //   //     receiveOrder();
  //   //   }, 3000);
  //   // }
    
  //   // Cleanup timer if component unmounts or state changes
  //   // return () => {
  //   //   if (orderTimer) {
  //   //     clearTimeout(orderTimer);
  //   //   }
  //   // };
  // // }, [isOnline, isFindingOrders, receiveOrder]);
  

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      stopOrderSound();
    };
  }, []);

  // Function to stop playing the sound
  const stopOrderSound = async () => {
    if (sound.current) {
      try {
        const status = await sound.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await sound.current.stopAsync();
        }
        await sound.current.unloadAsync();
        setIsSoundPlaying(false);
        soundLoopCount.current = 0;
      } catch (error) {
        console.log("Error stopping sound:", error);
      }
    }
  };

  // Function to play the order notification sound with repeat
  const playOrderSound = async () => {
    try {
      // First stop any currently playing sound
      await stopOrderSound();
      // Configure audio mode for alerts
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Load the notification sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/order-notification-2.mp3"),
        { volume: 1.0, shouldPlay: false }
      );

      sound.current = newSound;
      setIsSoundPlaying(true);
      soundLoopCount.current = 0;

      // Set up the onPlaybackStatusUpdate callback to handle looping
      sound.current.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          // Simply always play again until we reach the max loops
          if (soundLoopCount.current < maxSoundLoops - 1) {
            // Increment loop counter
            soundLoopCount.current += 1;

            // Play again with a short delay
            setTimeout(() => {
              if (sound.current) {
                sound.current.playFromPositionAsync(0);
              }
            }, 500); // 0.5 second delay between repeats
          } else {
            // We've reached max loops, stop playing
            setIsSoundPlaying(false);
          }
        }
      });

      // Start playing the sound
      await sound.current.playAsync();
    } catch (error) {
      console.log("Error playing sound:", error);
      setIsSoundPlaying(false);
    }
  };

  return (
    <ExpandableButtonContainer
      style={{
        width: buttonWidth,
        height: buttonHeight,
        left: buttonLeft,
        bottom: buttonBottom,
        borderRadius: buttonBorderRadius,
        overflow: "hidden",
      }}
    >
      {/* Button Content with improved transition */}
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {isFindingOrders ? (
          <FindingOrdersButton />
        ) : !showingOrderDetails ? (
          <GoOnlineButton />
        ) : null}
      </Animated.View>

      {/* Order Details Content */}
      {showingOrderDetails && (
        <OrderDetails
          opacity={orderDetailsOpacity}
          onAcceptOrder={() => stopOrderSound()} // Stop sound when order is accepted
          onDeclineOrder={() => stopOrderSound()} // Stop sound when order is declined
        />
      )}
    </ExpandableButtonContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default OrderButton;