import React from "react";
import { useDriverContext } from "../../context/DriverContext";
import { ProfileButton, ProfileImage } from "./styles";

const ProfileButtonComponent = () => {
  const { handleGoToSettings, profileImage } = useDriverContext();

  return (
    <ProfileButton onPress={handleGoToSettings}>
      <ProfileImage source={{ uri: profileImage }} resizeMode="cover" />
    </ProfileButton>
  );
};

export default ProfileButtonComponent;
