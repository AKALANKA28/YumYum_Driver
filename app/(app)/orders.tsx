import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
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
  justify-content: space-between;
  padding: ${props => props.theme.spacing.lg}px;
  background-color: ${props => props.theme.colors.primary};
`;

const HeaderTitle = styled(Text)`
  color: white;
  font-size: ${props => props.theme.fontSizes.large}px;
  font-weight: ${props => props.theme.fontWeights.bold};
`;

const FilterButtonsContainer = styled(View)`
  flex-direction: row;
  justify-content: space-around;
  padding-vertical: ${props => props.theme.spacing.md}px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const FilterButton = styled(TouchableOpacity)<{ active: boolean }>`
  padding-vertical: ${props => props.theme.spacing.sm}px;
  padding-horizontal: ${props => props.theme.spacing.md}px;
  border-radius: 20px;
  background-color: ${props => props.active ? props.theme.colors.primary : 'transparent'};
`;

const FilterButtonText = styled(Text)<{ active: boolean }>`
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  font-weight: ${props => props.active ? props.theme.fontWeights.bold : props.theme.fontWeights.medium};
`;

const OrderCard = styled(TouchableOpacity)`
  margin: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.medium}px;
  background-color: white;
  padding: ${props => props.theme.spacing.md}px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const OrderHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm}px;
`;

const OrderNumber = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
`;

const OrderStatus = styled(View)<{ status: string }>`
  padding-vertical: 4px;
  padding-horizontal: 8px;
  border-radius: 12px;
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

const RestaurantRow = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-vertical: ${props => props.theme.spacing.sm}px;
`;

const RestaurantName = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  margin-left: ${props => props.theme.spacing.sm}px;
`;

const DeliveryAddressRow = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-vertical: ${props => props.theme.spacing.sm}px;
`;

const DeliveryAddress = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  margin-left: ${props => props.theme.spacing.sm}px;
  color: ${props => props.theme.colors.lightText};
`;

const OrderFooter = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing.md}px;
  padding-top: ${props => props.theme.spacing.sm}px;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border};
`;

const OrderPrice = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
`;

const OrderTime = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.lightText};
`;

const EmptyListContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${props => props.theme.spacing.xl}px;
`;

const EmptyListText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.lightText};
  text-align: center;
  margin-top: ${props => props.theme.spacing.md}px;
`;

// Sample data
const mockOrders = [
  {
    id: '1',
    orderNumber: '#UE-8471',
    status: 'active',
    restaurant: 'Burger King',
    address: '123 Main St, New York, NY',
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
    address: '456 Elm St, New York, NY',
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
  {
    id: '3',
    orderNumber: '#UE-8459',
    status: 'cancelled',
    restaurant: 'Subway',
    address: '789 Oak St, New York, NY',
    price: '$12.75',
    time: '8:45 AM',
    items: [
      { name: 'Footlong Turkey Sub', quantity: 1, price: '$8.99' },
      { name: 'Chips', quantity: 1, price: '$1.99' },
      { name: 'Water Bottle', quantity: 1, price: '$1.79' },
    ],
    customerName: 'Michael Brown',
    customerPhone: '+1 (555) 456-7890',
    estimatedDelivery: '9:00 AM - 9:15 AM',
    paymentMethod: 'Credit Card',
    totalDistance: '0.8 miles',
    coordinates: {
      restaurantLat: 40.7148,
      restaurantLng: -74.0080,
      customerLat: 40.7182,
      customerLng: -74.0082,
    }
  },
  {
    id: '4',
    orderNumber: '#UE-8450',
    status: 'completed',
    restaurant: 'Taco Bell',
    address: '321 Pine St, New York, NY',
    price: '$15.25',
    time: 'Yesterday',
    items: [
      { name: 'Crunchwrap Supreme', quantity: 2, price: '$9.98' },
      { name: 'Nachos Bell Grande', quantity: 1, price: '$4.99' },
      { name: 'Mountain Dew', quantity: 1, price: '$1.99' },
    ],
    customerName: 'Emily Wilson',
    customerPhone: '+1 (555) 789-0123',
    estimatedDelivery: '7:15 PM - 7:30 PM',
    paymentMethod: 'Credit Card',
    totalDistance: '1.5 miles',
    coordinates: {
      restaurantLat: 40.7218,
      restaurantLng: -74.0000,
      customerLat: 40.7312,
      customerLng: -74.0022,
    }
  },
];

export default function OrdersScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const filteredOrders = selectedFilter === 'all' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === selectedFilter);

  const handleRefresh = () => {
    setRefreshing(true);
    // In a real app, fetch new data here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const navigateToOrderDetail = (order: any) => {
    router.push({
      pathname: '/(app)/order-detail',
      params: { orderId: order.id }
    });
  };

  const renderEmptyList = () => (
    <EmptyListContainer>
      <Ionicons name="receipt-outline" size={60} color="#CCCCCC" />
      <EmptyListText>
        {selectedFilter === 'all' 
          ? "You don't have any orders yet"
          : `No ${selectedFilter} orders`}
      </EmptyListText>
    </EmptyListContainer>
  );

  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <Header>
        <HeaderTitle>Orders</HeaderTitle>
      </Header>
      
      <FilterButtonsContainer>
        <FilterButton 
          active={selectedFilter === 'all'} 
          onPress={() => setSelectedFilter('all')}
        >
          <FilterButtonText active={selectedFilter === 'all'}>All</FilterButtonText>
        </FilterButton>
        
        <FilterButton 
          active={selectedFilter === 'active'} 
          onPress={() => setSelectedFilter('active')}
        >
          <FilterButtonText active={selectedFilter === 'active'}>Active</FilterButtonText>
        </FilterButton>
        
        <FilterButton 
          active={selectedFilter === 'completed'} 
          onPress={() => setSelectedFilter('completed')}
        >
          <FilterButtonText active={selectedFilter === 'completed'}>Completed</FilterButtonText>
        </FilterButton>
        
        <FilterButton 
          active={selectedFilter === 'cancelled'} 
          onPress={() => setSelectedFilter('cancelled')}
        >
          <FilterButtonText active={selectedFilter === 'cancelled'}>Cancelled</FilterButtonText>
        </FilterButton>
      </FilterButtonsContainer>
      
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OrderCard onPress={() => navigateToOrderDetail(item)}>
            <OrderHeader>
              <OrderNumber>{item.orderNumber}</OrderNumber>
              <OrderStatus status={item.status}>
                <OrderStatusText>
                  {item.status === 'active' ? 'Active' : 
                   item.status === 'completed' ? 'Completed' : 'Cancelled'}
                </OrderStatusText>
              </OrderStatus>
            </OrderHeader>
            
            <RestaurantRow>
              <Ionicons name="restaurant-outline" size={18} color="#000" />
              <RestaurantName>{item.restaurant}</RestaurantName>
            </RestaurantRow>
            
            <DeliveryAddressRow>
              <Ionicons name="location-outline" size={18} color="#666" />
              <DeliveryAddress>{item.address}</DeliveryAddress>
            </DeliveryAddressRow>
            
            <OrderFooter>
              <OrderPrice>{item.price}</OrderPrice>
              <OrderTime>{item.time}</OrderTime>
            </OrderFooter>
          </OrderCard>
        )}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#000000']}
            tintColor="#000000"
          />
        }
      />
    </Container>
  );
}