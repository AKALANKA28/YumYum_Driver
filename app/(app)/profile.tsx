import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../src/context/AuthContext';
import Input from '../src/components/common/Input';
import Button from '../src/components/common/Button';

const Container = styled(View)`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: ${props => props.theme.spacing.lg}px;
  background-color: ${props => props.theme.colors.primary};
`;

const BackButton = styled(TouchableOpacity)`
  padding: ${props => props.theme.spacing.sm}px;
`;

const HeaderTitle = styled(Text)`
  color: white;
  font-size: ${props => props.theme.fontSizes.large}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-left: ${props => props.theme.spacing.md}px;
`;

const ProfileImageSection = styled(View)`
  align-items: center;
  margin-vertical: ${props => props.theme.spacing.xl}px;
`;

const ProfileImageContainer = styled(View)`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.md}px;
  border-width: 2px;
  border-color: ${props => props.theme.colors.primary};
`;

const ProfileImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const ChangePhotoButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
`;

const ChangePhotoText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.fontWeights.medium};
  margin-left: ${props => props.theme.spacing.xs}px;
`;

const FormContainer = styled(View)`
  padding: ${props => props.theme.spacing.lg}px;
`;

const ButtonContainer = styled(View)`
  padding: ${props => props.theme.spacing.lg}px;
  background-color: white;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border};
`;

const SectionHeader = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.md}px;
  color: ${props => props.theme.colors.text};
`;

export default function ProfileScreen() {
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/120x120?text=Profile');
  
  // Form state - would be pre-filled with user's information in a real app
  const [formData, setFormData] = useState({
    firstName: authState.user?.firstName || 'John',
    lastName: authState.user?.lastName || 'Smith',
    email: authState.user?.email || 'john.smith@example.com',
    phone: authState.user?.phoneNumber || '+1 (555) 123-4567',
    address: '123 Main St, New York, NY 10001',
  });
  
  const handleBack = () => {
    router.back();
  };
  
  const handleChangePhoto = async () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose a new profile photo',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Please grant camera permissions to take a photo');
              return;
            }
            
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setProfileImage(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Please grant media library permissions to select a photo');
              return;
            }
            
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setProfileImage(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };
  
  const handleUpdateProfile = () => {
    setIsLoading(true);
    
    // In a real app, call your API to update the profile
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => router.back()
          }
        ]
      );
    }, 2000);
  };
  
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  
  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <Header>
        <BackButton onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </BackButton>
        <HeaderTitle>Edit Profile</HeaderTitle>
      </Header>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileImageSection>
          <ProfileImageContainer>
            <ProfileImage 
              source={{ uri: profileImage }} 
              resizeMode="cover"
            />
          </ProfileImageContainer>
          
          <ChangePhotoButton onPress={handleChangePhoto}>
            <Ionicons name="camera-outline" size={20} color="#000000" />
            <ChangePhotoText>Change Photo</ChangePhotoText>
          </ChangePhotoButton>
        </ProfileImageSection>
        
        <FormContainer>
          <SectionHeader>PERSONAL INFORMATION</SectionHeader>
          
          <Input
            label="First Name"
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            placeholder="Enter first name"
            leftIcon={<Ionicons name="person-outline" size={20} color="#666" />}
          />
          
          <Input
            label="Last Name"
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            placeholder="Enter last name"
            leftIcon={<Ionicons name="person-outline" size={20} color="#666" />}
          />
          
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={20} color="#666" />}
          />
          
          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            leftIcon={<Ionicons name="call-outline" size={20} color="#666" />}
          />
          
          <Input
            label="Address"
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            placeholder="Enter your address"
            leftIcon={<Ionicons name="location-outline" size={20} color="#666" />}
            multiline
            numberOfLines={2}
            style={{ height: 80, textAlignVertical: 'top', paddingTop: 10 }}
          />
        </FormContainer>
      </ScrollView>
      
      <ButtonContainer>
        <Button
          title="Update Profile"
          onPress={handleUpdateProfile}
          loading={isLoading}
          fullWidth
        />
      </ButtonContainer>
    </Container>
  );
}