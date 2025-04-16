import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  StatusBar, Dimensions, Platform, Alert,
  ActivityIndicator, AppState, AppStateStatus
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import MapView, { 
  Marker, 
  PROVIDER_GOOGLE, 
  Polyline, 
  Region,
  MapViewProps
} from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const Container = styled(View)`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const MapContainer = styled(View)`
  flex: 1;
`;

const HeaderOverlay = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  padding: ${props => props.theme.spacing.lg}px;
  z-index: 10;
`;

const HeaderContent = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled(Text)`
  color: white;
  font-size: ${props => props.theme.fontSizes.large}px;
  font-weight: ${props => props.theme.fontWeights.bold};
`;

const StatusIndicator = styled(View)<{ status: string }>`
  flex-direction: row;
  align-items: center;
  background-color: ${props => {
    switch(props.status) {
      case 'online': return 'rgba(0, 204, 102, 0.8)';
      case 'offline': return 'rgba(229, 9, 20, 0.8)';
      case 'busy': return 'rgba(255, 193, 7, 0.8)';
      default: return 'rgba(0, 0, 0, 0.5)';
    }
  }};
  padding: 4px 12px;
  border-radius: 20px;
`;

const StatusText = styled(Text)`
  color: white;
  font-size: ${props => props.theme.fontSizes.small}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-left: 4px;
`;

const BottomCard = styled(View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: ${props => props.theme.spacing.lg}px;
  border-top-left-radius: ${props => props.theme.borderRadius.large}px;
  border-top-right-radius: ${props => props.theme.borderRadius.large}px;
  shadow-color: #000;
  shadow-offset: 0px -2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 5;
`;

const BottomCardTitle = styled(Text)`
  font-size: ${props => props.theme.fontSizes.large}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const OnlineStatusToggle = styled(TouchableOpacity)<{ isOnline: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isOnline ? '#E50914' : '#00CC66'};
  padding: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.medium}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const ToggleText = styled(Text)`
  color: white;
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-left: ${props => props.theme.spacing.sm}px;
`;

const StatsContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing.md}px;
`;

const StatItem = styled(View)`
  align-items: center;
  flex: 1;
`;

const StatValue = styled(Text)`
  font-size: ${props => props.theme.fontSizes.large}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
`;

const StatLabel = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.lightText};
  margin-top: 2px;
`;

const ActionButtonsContainer = styled(View)`
  flex-direction: row;
  justify-content: space-around;
  margin-top: ${props => props.theme.spacing.lg}px;
`;

const ActionButton = styled(TouchableOpacity)`
  align-items: center;
`;

const ActionButtonIcon = styled(View)`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: ${props => props.theme.colors.cardBackground};
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`;

const ActionButtonText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.text};
`;

const LoadingContainer = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  justify-content: center;
  align-items: center;
`;

export default function MapScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<Location.LocationSubscription | null>(null);
  
  const mapRef = useRef<MapView>(null);
  const appState = useRef(AppState.currentState);
  
  // Mock data for active order (in real app this would come from API)
  interface ActiveOrder {
    coordinates: {
      restaurantLat: number;
      restaurantLng: number;
      customerLat: number;
      customerLng: number;
    };
    restaurant: string;
    customerName: string;
  }

  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  
  // Stats data
  const [stats, setStats] = useState({
    earnings: '$145.75',
    hours: '6.5',
    deliveries: '12',
  });

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          setIsLoading(false);
          return;
        }
        
        // Get the current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setCurrentLocation(location);
        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error getting location:', err);
        setError('Could not get your location. Please try again.');
        setIsLoading(false);
      }
    })();
    
    // Set up app state listener for background/foreground transitions
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      handleAppStateChange(nextAppState);
    });
    
    return () => {
      // Clean up location watch subscription
      if (watchId) {
        watchId.remove();
      }
      
      // Clean up app state subscription
      appStateSubscription.remove();
    };
  }, []);
  
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      if (isOnline && !watchId) {
        startLocationUpdates();
      }
    } else if (nextAppState.match(/inactive|background/) && appState.current === 'active') {
      // App has gone to the background
      if (watchId) {
        watchId.remove();
        setWatchId(null);
      }
    }
    
    appState.current = nextAppState;
  };
  
  const startLocationUpdates = async () => {
    // Start watching position
    const locationWatchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        setCurrentLocation(location);
        
        // In a real app, you would send location updates to your server here
        // sendLocationToServer(location);
      }
    );
    
    setWatchId(locationWatchId);
  };
  
  const stopLocationUpdates = () => {
    if (watchId) {
      watchId.remove();
      setWatchId(null);
    }
  };
  
  const toggleOnlineStatus = async () => {
    if (isOnline) {
      // Going offline
      stopLocationUpdates();
      setIsOnline(false);
      
      // In a real app, notify the server that driver is offline
    } else {
      // Going online
      try {
        // Start watching location
        await startLocationUpdates();
        setIsOnline(true);
        
        // In a real app, notify the server that driver is online
      } catch (err) {
        console.error('Error watching location:', err);
        Alert.alert('Error', 'Could not start location tracking. Please try again.');
      }
    }
  };
  
  const handleGoToOrders = () => {
    router.push('/(app)/orders');
  };
  
  const handleGoToEarnings = () => {
    router.push('/(app)/earnings');
  };
  
  const handleGoToSettings = () => {
    router.push('/(app)/settings');
  };
  
  if (error) {
    return (
      <Container>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle" size={60} color="#E50914" />
          <Text style={{ marginTop: 20, fontSize: 18, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity 
            style={{ 
              marginTop: 20, 
              backgroundColor: '#000000', 
              padding: 12, 
              borderRadius: 8 
            }}
            onPress={() => router.replace('/(app)/map')}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }
  
  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <MapContainer>
        {initialRegion && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={initialRegion}
            showsUserLocation
            showsMyLocationButton
            followsUserLocation
          >
            {/* If there's an active order, show route */}
            {activeOrder && (
              <>
                <Marker
                  coordinate={{
                    latitude: activeOrder.coordinates.restaurantLat,
                    longitude: activeOrder.coordinates.restaurantLng,
                  }}
                  title={activeOrder.restaurant}
                  description="Restaurant location"
                >
                  <Ionicons name="restaurant" size={24} color="#E50914" />
                </Marker>
                
                <Marker
                  coordinate={{
                    latitude: activeOrder.coordinates.customerLat,
                    longitude: activeOrder.coordinates.customerLng,
                  }}
                  title={activeOrder.customerName}
                  description="Delivery location"
                >
                  <Ionicons name="location" size={24} color="#00CC66" />
                </Marker>
                
                <Polyline
                  coordinates={[
                    {
                      latitude: activeOrder.coordinates.restaurantLat,
                      longitude: activeOrder.coordinates.restaurantLng,
                    },
                    {
                      latitude: activeOrder.coordinates.customerLat,
                      longitude: activeOrder.coordinates.customerLng,
                    },
                  ]}
                  strokeColor="#000000"
                  strokeWidth={3}
                />
              </>
            )}
          </MapView>
        )}
      </MapContainer>
      
      <HeaderOverlay>
        <HeaderContent>
          <HeaderTitle>Uber Eats Driver</HeaderTitle>
          <StatusIndicator status={isOnline ? 'online' : 'offline'}>
            <Ionicons 
              name={isOnline ? 'radio-button-on' : 'radio-button-off'} 
              size={16} 
              color="white" 
            />
            <StatusText>{isOnline ? 'Online' : 'Offline'}</StatusText>
          </StatusIndicator>
        </HeaderContent>
      </HeaderOverlay>
      
      <BottomCard>
        <BottomCardTitle>Driver Dashboard</BottomCardTitle>
        
        <OnlineStatusToggle 
          isOnline={isOnline} 
          onPress={toggleOnlineStatus}
        >
          <Ionicons 
            name={isOnline ? 'power' : 'power'} 
            size={24} 
            color="white" 
          />
          <ToggleText>
            {isOnline ? 'Go Offline' : 'Go Online'}
          </ToggleText>
        </OnlineStatusToggle>
        
        <StatsContainer>
          <StatItem>
            <StatValue>{stats.earnings}</StatValue>
            <StatLabel>Today's Earnings</StatLabel>
          </StatItem>
          
          <StatItem>
            <StatValue>{stats.hours}</StatValue>
            <StatLabel>Online Hours</StatLabel>
          </StatItem>
          
          <StatItem>
            <StatValue>{stats.deliveries}</StatValue>
            <StatLabel>Deliveries</StatLabel>
          </StatItem>
        </StatsContainer>
        
        <ActionButtonsContainer>
          <ActionButton onPress={handleGoToOrders}>
            <ActionButtonIcon>
              <Ionicons name="receipt-outline" size={24} color="#000" />
            </ActionButtonIcon>
            <ActionButtonText>Orders</ActionButtonText>
          </ActionButton>
          
          <ActionButton onPress={handleGoToEarnings}>
            <ActionButtonIcon>
              <Ionicons name="cash-outline" size={24} color="#000" />
            </ActionButtonIcon>
            <ActionButtonText>Earnings</ActionButtonText>
          </ActionButton>
          
          <ActionButton onPress={handleGoToSettings}>
            <ActionButtonIcon>
              <Ionicons name="settings-outline" size={24} color="#000" />
            </ActionButtonIcon>
            <ActionButtonText>Settings</ActionButtonText>
          </ActionButton>
        </ActionButtonsContainer>
      </BottomCard>
      
      {isLoading && (
        <LoadingContainer>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={{ marginTop: 10 }}>Loading map...</Text>
        </LoadingContainer>
      )}
    </Container>
  );
}