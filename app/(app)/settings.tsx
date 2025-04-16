import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  Switch, StatusBar, Alert, Image 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

import { useAuth } from '../src/context/AuthContext';

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

const ProfileSection = styled(View)`
  background-color: white;
  padding: ${props => props.theme.spacing.lg}px;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const ProfileImageContainer = styled(View)`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  overflow: hidden;
  margin-bottom: ${props => props.theme.spacing.md}px;
  border-width: 2px;
  border-color: ${props => props.theme.colors.primary};
`;

const ProfileImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const ProfileName = styled(Text)`
  font-size: ${props => props.theme.fontSizes.large}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.xs}px;
`;

const ProfileEmail = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.lightText};
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const ProfileRating = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const RatingText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-left: ${props => props.theme.spacing.xs}px;
`;

const RatingCount = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.lightText};
  margin-left: ${props => props.theme.spacing.xs}px;
`;

const SectionHeader = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  padding: ${props => props.theme.spacing.md}px;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.lightText};
`;

const SettingItem = styled(TouchableOpacity)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg}px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const SettingItemLeft = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const SettingIcon = styled(View)`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${props => props.theme.colors.cardBackground};
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.theme.spacing.md}px;
`;

const SettingText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
`;

const SettingDescription = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.lightText};
  margin-top: 2px;
`;

const Version = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.lightText};
  text-align: center;
  padding: ${props => props.theme.spacing.lg}px;
`;

export default function SettingsScreen() {
  const { logout, authState } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const username = authState.user ? 
    `${authState.user.firstName} ${authState.user.lastName}` : 
    'Driver';
  
  const userEmail = authState.user ? authState.user.email : 'driver@example.com';
  
  const handleBack = () => {
    router.back();
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled automatically by the auth context
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const navigateToVehicle = () => {
    // Navigate to vehicle information screen
    Alert.alert('Vehicle Info', 'Navigate to vehicle information screen');
  };
  
  const navigateToDocuments = () => {
    // Navigate to documents screen
    Alert.alert('Documents', 'Navigate to documents screen');
  };
  
  const navigateToPayments = () => {
    // Navigate to payment methods screen
    Alert.alert('Payments', 'Navigate to payment methods screen');
  };
  
  const navigateToSupport = () => {
    // Navigate to support screen
    Alert.alert('Support', 'Navigate to support screen');
  };
  
  const toggleNotifications = () => {
    setNotifications(!notifications);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <Header>
        <BackButton onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </BackButton>
        <HeaderTitle>Profile & Settings</HeaderTitle>
      </Header>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileSection>
          <ProfileImageContainer>
            <ProfileImage 
              source={{ uri: 'https://via.placeholder.com/100x100?text=Profile' }} 
              resizeMode="cover"
            />
          </ProfileImageContainer>
          
          <ProfileName>{username}</ProfileName>
          <ProfileEmail>{userEmail}</ProfileEmail>
          
          <ProfileRating>
            <Ionicons name="star" size={20} color="#FFC107" />
            <RatingText>4.9</RatingText>
            <RatingCount>(142 reviews)</RatingCount>
          </ProfileRating>
        </ProfileSection>
        
        <SectionHeader>ACCOUNT</SectionHeader>
        
        <SettingItem onPress={() => router.push('/(app)/profile')}>
          <SettingItemLeft>
            <SettingIcon>
              <Ionicons name="person-outline" size={24} color="#000" />
            </SettingIcon>
            <View>
              <SettingText>Personal Information</SettingText>
              <SettingDescription>Update your personal details</SettingDescription>
            </View>
          </SettingItemLeft>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </SettingItem>
        
        <SettingItem onPress={navigateToVehicle}>
          <SettingItemLeft>
            <SettingIcon>
              <Ionicons name="car-outline" size={24} color="#000" />
            </SettingIcon>
            <View>
              <SettingText>Vehicle Information</SettingText>
              <SettingDescription>Manage your delivery vehicle details</SettingDescription>
            </View>
          </SettingItemLeft>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </SettingItem>
        
        <SettingItem onPress={navigateToDocuments}>
          <SettingItemLeft>
            <SettingIcon>
              <Ionicons name="document-text-outline" size={24} color="#000" />
            </SettingIcon>
            <View>
              <SettingText>Documents</SettingText>
              <SettingDescription>View and update your documents</SettingDescription>
            </View>
          </SettingItemLeft>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </SettingItem>
        
        <SettingItem onPress={navigateToPayments}>
          <SettingItemLeft>
            <SettingIcon>
              <Ionicons name="card-outline" size={24} color="#000" />
            </SettingIcon>
            <View>
              <SettingText>Payment Methods</SettingText>
              <SettingDescription>Manage your payout methods</SettingDescription>
            </View>
          </SettingItemLeft>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </SettingItem>
        
        <SectionHeader>APP SETTINGS</SectionHeader>
        
        <SettingItem>
          <SettingItemLeft>
            <SettingIcon>
              <Ionicons name="notifications-outline" size={24} color="#000" />
            </SettingIcon>
            <View>
              <SettingText>Notifications</SettingText>
              <SettingDescription>Manage your notification preferences</SettingDescription>
            </View>
          </SettingItemLeft>
          <Switch
            value={notifications}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#767577', true: '#000000' }}
            thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
          />
        </SettingItem>
        
        <SettingItem>
          <SettingItemLeft>
            <SettingIcon>
              <Ionicons name="moon-outline" size={24} color="#000" />
            </SettingIcon>
            <View>
              <SettingText>Dark Mode</SettingText>
              <SettingDescription>Toggle dark/light appearance</SettingDescription>
            </View>
          </SettingItemLeft>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#767577', true: '#000000' }}
            thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
          />
        </SettingItem>
        
        <SectionHeader>HELP & SUPPORT</SectionHeader>
        
        <SettingItem onPress={navigateToSupport}>
          <SettingItemLeft>
            <SettingIcon>
              <Ionicons name="help-buoy-outline" size={24} color="#000" />
            </SettingIcon>
            <View>
              <SettingText>Support Center</SettingText>
              <SettingDescription>Get help with issues and questions</SettingDescription>
            </View>
          </SettingItemLeft>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </SettingItem>
        
        <SettingItem onPress={() => Alert.alert('Terms', 'View Terms of Service')}>
          <SettingItemLeft>
            <SettingIcon>
              <Ionicons name="document-outline" size={24} color="#000" />
            </SettingIcon>
            <View>
              <SettingText>Terms of Service</SettingText>
            </View>
          </SettingItemLeft>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </SettingItem>
        
        <SettingItem onPress={() => Alert.alert('Privacy', 'View Privacy Policy')}>
          <SettingItemLeft>
            <SettingIcon>
              <Ionicons name="shield-outline" size={24} color="#000" />
            </SettingIcon>
            <View>
              <SettingText>Privacy Policy</SettingText>
            </View>
          </SettingItemLeft>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </SettingItem>
        
        <SettingItem onPress={handleLogout} style={{ borderBottomWidth: 0 }}>
          <SettingItemLeft>
            <SettingIcon style={{ backgroundColor: '#FFEBEE' }}>
              <Ionicons name="log-out-outline" size={24} color="#E50914" />
            </SettingIcon>
            <View>
              <SettingText style={{ color: '#E50914' }}>Logout</SettingText>
            </View>
          </SettingItemLeft>
        </SettingItem>
        
        <Version>Version 1.0.0</Version>
      </ScrollView>
    </Container>
  );
}