import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "styled-components/native";
// import { useDriverContext } from "../../context/DriverContext";
import { 
  ProfileButton, 
  ProfileImage, 
  ProfileContainer,
  GreetingText,
  NameText 
} from "./styles";

const ProfileButtonComponent = () => {
  // const { handleGoToSettings } = useDriverContext();
  const theme = useTheme();

  return (
    <ProfileContainer>
      {/* <ProfileButton onPress={handleGoToSettings}>
        <ProfileImage source={{ uri: profileImage }} resizeMode="cover" />
      </ProfileButton> */}
      
      <View style={styles.textContainer}>
        <GreetingText>Hello!</GreetingText>
        {/* <NameText>{user?.fullName || "Driver"}</NameText> */}
      </View>
    </ProfileContainer>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    flexDirection: "column",
    justifyContent: "center"
  }
});

export default ProfileButtonComponent;