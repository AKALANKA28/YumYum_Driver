import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  StatusBar, ActivityIndicator, StyleSheet, Alert, 
  Linking, Platform 
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

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

const ContentContainer = styled(ScrollView)`
  flex: 1;
`;

const OrderHeader = styled(View)`
  background-color: white;
  padding: ${props => props.theme.spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const OrderNumberRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const OrderNumber = styled(Text)`
  font-size: ${props => props.theme.fontSizes.large}px;
  font-weight: ${props => props.theme.fontWeights.bold};
`;

const OrderStatus = styled(View)<{ status: string }>`
  padding-vertical: 4px;
  padding-horizontal: 12px;
  border-radius: 16px;
  background-color: ${props => {
    switch(props.status) {
      case 'active': return '#FFC107';
      case 'completed': return '#00CC66';
      case 'cancelled': return '#E50914';
      default: return '#999999';
    }
  }};
`;

const OrderStatusText = styled(Text)`
  color: white;
  font-size: ${props => props.theme.fontSizes.small}px;
  font-weight: ${props => props.theme.fontWeights.bold};
`;

const EstimatedDelivery = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.lightText};
`;

const MapContainer = styled(View)`
  height: 200px;
  margin-vertical: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.medium}px;
  overflow: hidden;
`;

const SectionContainer = styled(View)`
  background-color: white;
  padding: ${props => props.theme.spacing.lg}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const SectionTitle = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const LocationRow = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const LocationDot = styled(View)<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${props => props.color};
  margin-right: ${props => props.theme.spacing.sm}px;
`;

const LocationDetails = styled(View)`
  flex: 1;
`;

const LocationName = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const LocationAddress = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.lightText};
`;

const Divider = styled(View)`
  height: 1px;
  background-color: ${props => props.theme.colors.border};
  margin-vertical: ${props => props.theme.spacing.md}px;
`;

const ItemRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm}px;
`;

const ItemName = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  flex: 1;
`;

const ItemQuantity = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.lightText};
  margin-horizontal: ${props => props.theme.spacing.md}px;
  min-width: 30px;
  text-align: center;
`;

const ItemPrice = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const TotalRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing.md}px;
  padding-top: ${props => props.theme.spacing.md}px;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border};
`;

const TotalText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
`;

const TotalAmount = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
`;

const CustomerInfoRow = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const CustomerName = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  flex: 1;
  margin-left: ${props => props.theme.spacing.sm}px;
`;

const CallButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.sm}px ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.medium}px;
`;

const CallButtonText = styled(Text)`
  color: white;
  font-size: ${props => props.theme.fontSizes.small}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-left: ${props => props.theme.spacing.xs}px;
`;

const MessageButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  background-color: #4CAF50;
  padding: ${props => props.theme.spacing.sm}px ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.medium}px;
  margin-left: ${props => props.theme.spacing.sm}px;
`;

const MessageButtonText = styled(Text)`
  color: white;
  font-size: ${props => props.theme.fontSizes.small}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-left: ${props => props.theme.spacing.xs}px;
`;

const BottomActions = styled(View)`
  padding: ${props => props.theme.spacing.lg}px;
  background-color: white;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border};
`;

const ActionButton = styled(TouchableOpacity)<{ type: string }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${props => {
    switch(props.type) {
      case 'primary': return props.theme.colors.primary;
      case 'success': return props.theme.colors.success;
      case 'danger': return props.theme.colors.error;
      default: return props.theme.colors.primary;
    }
  }};
  padding: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.medium}px;
`;

const ActionButtonText = styled(Text)`
  color: white;
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-left: ${props => props.theme.spacing.sm}px;
`;

// Sample data - in a real app, you would fetch this by order ID
const mockOrders = [
  {
    id: '1',
    orderNumber: '#UE-8471',
    status: 'active',
    restaurant: 'Burger King',
    restaurantAddress: '123 Main St, New York, NY',
    customerAddress: '456 Park Ave, New York, NY',
    price: '$18.50',
    time: '10:30 AM',
    items: [
      { name: 'Whopper', quantity: 1, price: '$8.99' },
      { name: 'French Fries (Large)', quantity: 1, price: '$3.99' },
      { name: 'Coca Cola', quantity: 2, price: '$2.99' },
    ],
    customerName: 'John Smith',
    customerPhone: '+1 (555) 123-4567',
    estimatedDelivery: '10:45 AM - 11:00 AM',
    paymentMethod: 'Credit Card',
    totalDistance: '2.3 miles',
    coordinates: {
      restaurantLat: 40.7128,
      restaurantLng: -74.0060,
      customerLat: 40.7282,
      customerLng: -73.9942,
    }
  },
  {
    id: '2',
    orderNumber: '#UE-8465',
    status: 'completed',
    restaurant: 'Pizza Hut',
    restaurantAddress: '123 Broadway, New York, NY',
    customerAddress: '456 Elm St, New York, NY',
    price: '$24.99',
    time: '9:15 AM',
    items: [
      { name: 'Large Pepperoni Pizza', quantity: 1, price: '$18.99' },
      { name: 'Garlic Breadsticks', quantity: 1, price: '$4.99' },
      { name: 'Sprite', quantity: 1, price: '$1.99' },
    ],
    customerName: 'Sarah Johnson',
    customerPhone: '+1 (555) 987-6543',
    estimatedDelivery: '9:30 AM - 9:45 AM',
    paymentMethod: 'Cash on Delivery',
    totalDistance: '1.8 miles',
    coordinates: {
      restaurantLat: 40.7228,
      restaurantLng: -74.0030,
      customerLat: 40.7382,
      customerLng: -74.0052,
    }
  },
  // Additional mock orders...
];

export default function OrderDetailScreen() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  
  // Find the order details
  const order = mockOrders.find(o => o.id === orderId);
  
  const [isLoading, setIsLoading] = useState(false);
  
  if (!order) {
    return (
      <Container>
        <Header>
          <BackButton onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </BackButton>
          <HeaderTitle>Order Detail</HeaderTitle>
        </Header>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Order not found</Text>
        </View>
      </Container>
    );
  }

  const handleStartNavigation = () => {
    const { customerLat, customerLng } = order.coordinates;
    const url = Platform.select({
      ios: `maps:?daddr=${customerLat},${customerLng}`,
      android: `google.navigation:q=${customerLat},${customerLng}`,
    });
    
    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(
            'Navigation Error',
            'Could not open maps application. Please ensure you have a maps app installed.',
            [{ text: 'OK' }]
          );
        }
      });
    } else {
      Alert.alert(
        'Navigation Error',
        'Could not generate a valid navigation URL.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:${order.customerPhone}`);
  };

  const handleMessage = () => {
    Linking.openURL(`sms:${order.customerPhone}`);
  };

  const handleCompleteOrder = () => {
    setIsLoading(true);
    // In a real app, call your API to complete the order
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Order Completed',
        'The order has been marked as completed successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/(app)/orders')
          }
        ]
      );
    }, 2000);
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            setIsLoading(true);
            // In a real app, call your API to cancel the order
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert(
                'Order Cancelled',
                'The order has been cancelled successfully.',
                [
                  { 
                    text: 'OK', 
                    onPress: () => router.replace('/(app)/orders')
                  }
                ]
              );
            }, 2000);
          }
        }
      ]
    );
  };

  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <Header>
        <BackButton onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </BackButton>
        <HeaderTitle>Order {order.orderNumber}</HeaderTitle>
      </Header>
      
      <ContentContainer showsVerticalScrollIndicator={false}>
        <OrderHeader>
          <OrderNumberRow>
            <OrderNumber>{order.orderNumber}</OrderNumber>
            <OrderStatus status={order.status}>
              <OrderStatusText>
                {order.status === 'active' ? 'Active' : 
                 order.status === 'completed' ? 'Completed' : 'Cancelled'}
              </OrderStatusText>
            </OrderStatus>
          </OrderNumberRow>
          
          <EstimatedDelivery>
            Estimated delivery: {order.estimatedDelivery}
          </EstimatedDelivery>
        </OrderHeader>
        
        <MapContainer>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: (order.coordinates.restaurantLat + order.coordinates.customerLat) / 2,
              longitude: (order.coordinates.restaurantLng + order.coordinates.customerLng) / 2,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: order.coordinates.restaurantLat,
                longitude: order.coordinates.restaurantLng,
              }}
              title={order.restaurant}
              description="Restaurant location"
            >
              <Ionicons name="restaurant" size={24} color="#E50914" />
            </Marker>
            
            <Marker
              coordinate={{
                latitude: order.coordinates.customerLat,
                longitude: order.coordinates.customerLng,
              }}
              title={order.customerName}
              description="Delivery location"
            >
              <Ionicons name="location" size={24} color="#00CC66" />
            </Marker>
            
            <Polyline
              coordinates={[
                {
                  latitude: order.coordinates.restaurantLat,
                  longitude: order.coordinates.restaurantLng,
                },
                {
                  latitude: order.coordinates.customerLat,
                  longitude: order.coordinates.customerLng,
                },
              ]}
              strokeColor="#000000"
              strokeWidth={2}
            />
          </MapView>
        </MapContainer>
        
        <SectionContainer>
          <SectionTitle>Delivery Locations</SectionTitle>
          
          <LocationRow>
            <LocationDot color="#E50914" />
            <LocationDetails>
              <LocationName>{order.restaurant}</LocationName>
              <LocationAddress>{order.restaurantAddress}</LocationAddress>
            </LocationDetails>
          </LocationRow>
          
          <LocationRow>
            <LocationDot color="#00CC66" />
            <LocationDetails>
              <LocationName>Customer</LocationName>
              <LocationAddress>{order.customerAddress}</LocationAddress>
            </LocationDetails>
          </LocationRow>
          
          <TouchableOpacity onPress={handleStartNavigation} style={{ marginTop: 10 }}>
            <ActionButton type="primary">
              <Ionicons name="navigate" size={24} color="white" />
              <ActionButtonText>Start Navigation</ActionButtonText>
            </ActionButton>
          </TouchableOpacity>
        </SectionContainer>
        
        <SectionContainer>
          <SectionTitle>Order Items</SectionTitle>
          
          {order.items.map((item, index) => (
            <ItemRow key={index}>
              <ItemName>{item.name}</ItemName>
              <ItemQuantity>x{item.quantity}</ItemQuantity>
              <ItemPrice>{item.price}</ItemPrice>
            </ItemRow>
          ))}
          
          <TotalRow>
            <TotalText>Total</TotalText>
            <TotalAmount>{order.price}</TotalAmount>
          </TotalRow>
        </SectionContainer>
        
        <SectionContainer>
          <SectionTitle>Customer Information</SectionTitle>
          
          <CustomerInfoRow>
            <Ionicons name="person-circle-outline" size={24} color="#000" />
            <CustomerName>{order.customerName}</CustomerName>
            
            <CallButton onPress={handleCall}>
              <Ionicons name="call" size={16} color="white" />
              <CallButtonText>Call</CallButtonText>
            </CallButton>
            
            <MessageButton onPress={handleMessage}>
              <Ionicons name="chatbubble" size={16} color="white" />
              <MessageButtonText>Text</MessageButtonText>
            </MessageButton>
          </CustomerInfoRow>
          
          <Divider />
          
          <LocationRow>
            <Ionicons name="card-outline" size={20} color="#000" />
            <LocationDetails>
              <LocationName>Payment Method</LocationName>
              <LocationAddress>{order.paymentMethod}</LocationAddress>
            </LocationDetails>
          </LocationRow>
          
          <LocationRow>
            <Ionicons name="speedometer-outline" size={20} color="#000" />
            <LocationDetails>
              <LocationName>Distance</LocationName>
              <LocationAddress>{order.totalDistance}</LocationAddress>
            </LocationDetails>
          </LocationRow>
        </SectionContainer>
      </ContentContainer>
      
      {order.status === 'active' && (
        <BottomActions>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ActionButton 
              type="danger" 
              onPress={handleCancelOrder}
              style={{ width: '48%' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color="white" />
                  <ActionButtonText>Cancel Order</ActionButtonText>
                </>
              )}
            </ActionButton>
            
            <ActionButton 
              type="success" 
              onPress={handleCompleteOrder}
              style={{ width: '48%' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <ActionButtonText>Complete Delivery</ActionButtonText>
                </>
              )}
            </ActionButton>
          </View>
        </BottomActions>
      )}
    </Container>
  );
}