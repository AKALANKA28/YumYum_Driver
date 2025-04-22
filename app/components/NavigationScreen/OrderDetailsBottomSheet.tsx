import React, { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';

interface OrderDetailsBottomSheetProps {
  orderDetails: any;
  isNavigating: boolean;
}

const OrderDetailsBottomSheet = forwardRef<BottomSheet, OrderDetailsBottomSheetProps>(
  ({ orderDetails, isNavigating }, ref) => {
    const snapPoints = useMemo(() => ['20%', '50%'], []);

    // Handle calling restaurant
    const handleCallRestaurant = () => {
      const phoneNumber = orderDetails.restaurantPhone || '+1234567890';
      Linking.openURL(`tel:${phoneNumber}`);
    };

    // Handle calling customer
    const handleCallCustomer = () => {
      const phoneNumber = orderDetails.customerPhone || '+1234567890';
      Linking.openURL(`tel:${phoneNumber}`);
    };

    // Handle opening external navigation app
    const handleExternalNavigation = () => {
      const destination = orderDetails.address || '';
      const label = orderDetails.restaurantName || 'Restaurant';
      
      let url;
      if (Platform.OS === 'ios') {
        url = `maps:?daddr=${encodeURIComponent(destination)}&ll=${orderDetails.latitude},${orderDetails.longitude}`;
      } else {
        url = `google.navigation:q=${encodeURIComponent(destination)}&title=${encodeURIComponent(label)}`;
      }
      
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          alert('Unable to open navigation app');
        }
      });
    };

    return (
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        handleIndicatorStyle={styles.handleIndicator}
        enablePanDownToClose={false}
        backgroundStyle={styles.bottomSheetBackground}
        style={styles.bottomSheet}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Navigation Status */}
          <View style={styles.navigationStatusContainer}>
            <View style={[styles.statusIndicator, isNavigating ? styles.activeIndicator : {}]} />
            <Text style={styles.navigationStatusText}>
              {isNavigating ? 'Navigating to Restaurant' : 'Route Overview'}
            </Text>
          </View>
          
          {/* Restaurant Info */}
          <View style={styles.restaurantContainer}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/60' }} // Replace with actual restaurant image
              style={styles.restaurantImage}
            />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{orderDetails.restaurantName || 'Assembly (Quincy)'}</Text>
              <Text style={styles.restaurantAddress}>{orderDetails.address || 'Hancock St & MA-3A, Quincy'}</Text>
              <View style={styles.estimateContainer}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.estimateText}>
                  {orderDetails.time || '10 min'} • {orderDetails.distance || '0.7 mi'}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCallRestaurant}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="call" size={20} color="#f23f07" />
              </View>
              <Text style={styles.actionButtonText}>Call Restaurant</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleCallCustomer}>
              <View style={styles.actionButtonIcon}>
                <Ionicons name="person" size={20} color="#f23f07" />
              </View>
              <Text style={styles.actionButtonText}>Call Customer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleExternalNavigation}>
              <View style={styles.actionButtonIcon}>
                <FontAwesome name="external-link" size={20} color="#f23f07" />
              </View>
              <Text style={styles.actionButtonText}>External Nav</Text>
            </TouchableOpacity>
          </View>
          
          {/* Order Details */}
          <View style={styles.orderDetailsContainer}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <View style={styles.orderItem}>
              <Text style={styles.orderItemName}>1× BBQ Chicken Sandwich</Text>
              <Text style={styles.orderItemPrice}>$7.80</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.customerContainer}>
              <View style={styles.customerHeader}>
                <Text style={styles.customerTitle}>Customer</Text>
                <View style={styles.customerInfo}>
                  <MaterialIcons name="person-pin-circle" size={16} color="#666" />
                  <Text style={styles.customerAddress}>
                    {orderDetails.customerAddress || '123 Main St, Quincy, MA'}
                  </Text>
                </View>
              </View>
              <Text style={styles.customerName}>{orderDetails.customerName || 'John Smith'}</Text>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetBackground: {
    backgroundColor: "#fff",
  },
  handleIndicator: {
    backgroundColor: "#DDDDDD",
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  navigationStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#888',
    marginRight: 8,
  },
  activeIndicator: {
    backgroundColor: '#00a651',
  },
  navigationStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  restaurantContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  estimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
  },
  orderDetailsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  customerContainer: {
    marginTop: 4,
  },
  customerHeader: {
    marginBottom: 8,
  },
  customerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  customerAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    color: '#333',
  },
});

export default OrderDetailsBottomSheet;