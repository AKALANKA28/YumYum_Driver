import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "styled-components/native";
import { useDriverContext } from "../../context/DriverContext";
import { useAuth } from "../../context/AuthContext";
import { 
  ProfileButton, 
  ProfileImage, 
  ProfileContainer,
  GreetingText,
  NameText 
} from "./styles";

// Default profile image if none is available
const defaultProfileImage = "https://i.imgur.com/WxNkK7J.png";

const ProfileButtonComponent = () => {
  const { handleGoToSettings } = useDriverContext();
  const { authState } = useAuth();
  const theme = useTheme();
  const { toggleOnlineStatus, isOnline } = useDriverContext();
  
  // Get user data from auth context
  const driver = authState.driver;
  
  // Get profile image from driver data or use default
  const profileImage = defaultProfileImage;
  
  // Format full name
  const fullName = driver ? 
    `${driver.firstName || ''} ${driver.lastName || ''}`.trim() : 
    "Driver";

  // If driver is online, don't render the profile button
  if (isOnline) {
    return null;
  }

  // Only render when driver is offline
  return (
    <ProfileContainer>
      <ProfileButton onPress={handleGoToSettings}>
        <ProfileImage source={{ uri: profileImage }} resizeMode="cover" />
      </ProfileButton>
      
      <View style={styles.textContainer}>
        <GreetingText>Hello!</GreetingText>
        <NameText>{fullName}</NameText>
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