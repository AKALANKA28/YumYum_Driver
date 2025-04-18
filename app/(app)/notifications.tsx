import React, { useState } from 'react';
import { 
  View, Text, StatusBar, TouchableOpacity, 
  Switch, ScrollView 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

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

const SectionHeader = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  padding: ${props => props.theme.spacing.md}px;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.lightText};
`;

const SettingItem = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg}px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const SettingText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
`;

const SettingDescription = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.lightText};
  margin-top: 2px;
`;

export default function NotificationsScreen() {
  const [notificationSettings, setNotificationSettings] = useState({
    orderAlerts: true,
    newOrders: true,
    orderUpdates: true,
    paymentUpdates: true,
    promotions: false,
    news: false,
    accountAlerts: true,
  });
  
  const handleBack = () => {
    router.back();
  };
  
  const toggleSetting = (setting: string) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting as keyof typeof notificationSettings],
    });
  };
  
  return (
    <Container>
      {/* <StatusBar barStyle="light-content" backgroundColor="#000000" /> */}
      
      <Header>
        <BackButton onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </BackButton>
        <HeaderTitle>Notification Settings</HeaderTitle>
      </Header>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader>ORDER NOTIFICATIONS</SectionHeader>
        
        <SettingItem>
          <View>
            <SettingText>New Order Alerts</SettingText>
            <SettingDescription>Sound and notification for new orders</SettingDescription>
          </View>
          <Switch
            value={notificationSettings.orderAlerts}
            onValueChange={() => toggleSetting('orderAlerts')}
            trackColor={{ false: '#767577', true: '#000000' }}
            thumbColor={notificationSettings.orderAlerts ? '#FFFFFF' : '#FFFFFF'}
          />
        </SettingItem>
        
        <SettingItem>
          <View>
            <SettingText>Available Orders</SettingText>
            <SettingDescription>Notifications about available orders in your area</SettingDescription>
          </View>
          <Switch
            value={notificationSettings.newOrders}
            onValueChange={() => toggleSetting('newOrders')}
            trackColor={{ false: '#767577', true: '#000000' }}
            thumbColor={notificationSettings.newOrders ? '#FFFFFF' : '#FFFFFF'}
          />
        </SettingItem>
        
        <SettingItem>
          <View>
            <SettingText>Order Status Updates</SettingText>
            <SettingDescription>Updates about changes to your current orders</SettingDescription>
          </View>
          <Switch
            value={notificationSettings.orderUpdates}
            onValueChange={() => toggleSetting('orderUpdates')}
            trackColor={{ false: '#767577', true: '#000000' }}
            thumbColor={notificationSettings.orderUpdates ? '#FFFFFF' : '#FFFFFF'}
          />
        </SettingItem>
        
        <SectionHeader>PAYMENT NOTIFICATIONS</SectionHeader>
        
        <SettingItem>
          <View>
            <SettingText>Payment Updates</SettingText>
            <SettingDescription>Updates about your earnings and payments</SettingDescription>
          </View>
          <Switch
            value={notificationSettings.paymentUpdates}
            onValueChange={() => toggleSetting('paymentUpdates')}
            trackColor={{ false: '#767577', true: '#000000' }}
            thumbColor={notificationSettings.paymentUpdates ? '#FFFFFF' : '#FFFFFF'}
          />
        </SettingItem>
        
        <SectionHeader>MARKETING NOTIFICATIONS</SectionHeader>
        
        <SettingItem>
          <View>
            <SettingText>Promotions</SettingText>
            <SettingDescription>Special offers and promotions for drivers</SettingDescription>
          </View>
          <Switch
            value={notificationSettings.promotions}
            onValueChange={() => toggleSetting('promotions')}
            trackColor={{ false: '#767577', true: '#000000' }}
            thumbColor={notificationSettings.promotions ? '#FFFFFF' : '#FFFFFF'}
          />
        </SettingItem>
        
        <SettingItem>
          <View>
            <SettingText>News & Updates</SettingText>
            <SettingDescription>News about the Uber Eats platform</SettingDescription>
          </View>
          <Switch
            value={notificationSettings.news}
            onValueChange={() => toggleSetting('news')}
            trackColor={{ false: '#767577', true: '#000000' }}
            thumbColor={notificationSettings.news ? '#FFFFFF' : '#FFFFFF'}
          />
        </SettingItem>
        
        <SectionHeader>ACCOUNT NOTIFICATIONS</SectionHeader>
        
        <SettingItem>
          <View>
            <SettingText>Account Alerts</SettingText>
            <SettingDescription>Important updates about your account</SettingDescription>
          </View>
          <Switch
            value={notificationSettings.accountAlerts}
            onValueChange={() => toggleSetting('accountAlerts')}
            trackColor={{ false: '#767577', true: '#000000' }}
            thumbColor={notificationSettings.accountAlerts ? '#FFFFFF' : '#FFFFFF'}
          />
        </SettingItem>
      </ScrollView>
    </Container>
  );
}