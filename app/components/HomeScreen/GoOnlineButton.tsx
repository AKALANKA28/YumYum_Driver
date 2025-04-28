import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useDriverContext } from "../../context/DriverContext";
import { ButtonContent, GoOnlineText } from "./styles";

const GoOnlineButton = () => {

  
  const { toggleOnlineStatus, isOnline } = useDriverContext();

  return (
    <TouchableOpacity onPress={toggleOnlineStatus} style={styles.container}>
      <ButtonContent isOnline={isOnline}>
        <FontAwesome5 name="power-off" size={19} color="white" />
        <GoOnlineText>{isOnline ? "Go Offline" : "Go Online"}</GoOnlineText>
      </ButtonContent>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
});

export default GoOnlineButton;
