import React, { forwardRef, useMemo, useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  PanResponder,
  Animated,
  Dimensions
} from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_WIDTH = SCREEN_WIDTH - 48; // Accounting for horizontal padding
const THUMB_WIDTH = 60;
const SLIDE_THRESHOLD = BUTTON_WIDTH * 0.7; // User needs to slide 70% to confirm

interface DestinationBottomSheetProps {
  navigationMode: "pickup" | "delivery";
  onConfirm: () => void;
  onCancel: () => void;
  orderDetails?: {
    price?: string;
    pickup?: {
      time?: string;
      items?: string[];
    };
    customer?: {
      name?: string;
      image?: string;
      code?: string;
    };
  };
}

const DestinationBottomSheet = forwardRef<
  BottomSheet,
  DestinationBottomSheetProps
>(({ navigationMode, onConfirm, orderDetails = {} }, ref) => {
  // Two snap points - one for header only, one for full content
  const snapPoints = useMemo(() => ["10%", "55%"], []);
  const isPickupMode = navigationMode === "pickup";
  
  // Add state for checkbox
  const [isChecked, setIsChecked] = useState(false);
  
  // Animation values
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const [isSliding, setIsSliding] = useState(false);
  const [slideComplete, setSlideComplete] = useState(false);

  // Reset animation when mode changes or checkbox state changes
  useEffect(() => {
    slideAnimation.setValue(0);
    setSlideComplete(false);
  }, [navigationMode, isChecked]);
  
  // Set up PanResponder for slide gesture
  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      // Track the sliding movement
      onPanResponderGrant: () => {
        if (isPickupMode && !isChecked) return; // Don't allow sliding if checkbox not checked
        setIsSliding(true);
      },
      
      // Update position while sliding
      onPanResponderMove: (_, gestureState) => {
        if (isPickupMode && !isChecked) return; // Don't allow sliding if checkbox not checked
        
        // Calculate how far the user has dragged
        const dx = Math.max(0, Math.min(gestureState.dx, BUTTON_WIDTH - THUMB_WIDTH));
        slideAnimation.setValue(dx);
      },
      
      // Handle release of the slider
      onPanResponderRelease: (_, gestureState) => {
        if (isPickupMode && !isChecked) return; // Don't allow sliding if checkbox not checked
        
        setIsSliding(false);
        
        // If slid past threshold, trigger success
        if (gestureState.dx >= SLIDE_THRESHOLD) {
          Animated.timing(slideAnimation, {
            toValue: BUTTON_WIDTH - THUMB_WIDTH,
            duration: 100,
            useNativeDriver: false,
          }).start(() => {
            setSlideComplete(true);
            onConfirm();
          });
        } else {
          // Otherwise, spring back to start
          Animated.spring(slideAnimation, {
            toValue: 0,
            friction: 5,
            tension: 40,
            useNativeDriver: false,
          }).start();
        }
      }
    });
  }, [slideAnimation, isChecked, isPickupMode, onConfirm]);

  // Mock data based on the image
  const mockOrderDetails = {
    price: orderDetails.price || "$ 15.00",
    pickup: {
      time: orderDetails.pickup?.time || "10:10 Pm",
      items: orderDetails.pickup?.items || [
        "Margherita pizza",
        "Pepperoni Pizza",
        "Hawaiian Pizza",
        "Cheese Pizza",
      ],
    },
    customer: {
      name: orderDetails.customer?.name || "Lisa C. Torrez",
      image: orderDetails.customer?.image,
      code: orderDetails.customer?.code || "YUM-4582", // Special code for verification
    },
  };
  
  // Toggle checkbox state
  const handleCheckboxToggle = () => {
    setIsChecked(!isChecked);
  };

  // Calculate derived styles for slide button
  const thumbLeft = slideAnimation;
  const progressWidth = slideAnimation;
  const isDisabled = isPickupMode && !isChecked;

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
      {/* Header is directly in the BottomSheet, making it always visible */}
      <View style={styles.headerContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text
            style={[
              styles.headerTitle,
              !isPickupMode ? styles.headerTitleWithPrice : null,
            ]}
          >
            {isPickupMode
              ? `Pick up by ${mockOrderDetails.pickup.time}`
              : "Deliver order"}
          </Text>
          {!isPickupMode && (
            <Text style={styles.headerPrice}>{mockOrderDetails.price}</Text>
          )}
        </View>

        <View style={styles.subheader}>
          <Text style={styles.subheaderText}>
            {`${mockOrderDetails.pickup.items.length} Items • 15 Min total`}
          </Text>
          <Text style={styles.subheaderRightText}>This dash</Text>
        </View>
      </View>

      {/* Divider to separate header from content */}
      <View style={styles.mainDivider} />

      {/* Content without scroll view */}
      <BottomSheetView style={styles.contentContainer}>
        {/* Customer Section - Show in both modes */}
        <View style={styles.customerContainer}>
          <View style={styles.customerInfo}>
            <View style={styles.customerImageContainer}>
              <Ionicons name="person-circle" size={50} color="#ccc" />
            </View>
            <View>
              <Text style={styles.customerLabel}>Customer</Text>
              <Text style={styles.customerName}>
                {mockOrderDetails.customer.name}
              </Text>
              <Text style={styles.customerCode}>
                {mockOrderDetails.customer.code}
              </Text>
            </View>
          </View>

          {/* Show different buttons based on mode */}
          {isPickupMode ? (
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={handleCheckboxToggle}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkboxCircle, 
                isChecked ? styles.checkboxChecked : styles.checkboxUnchecked
              ]}>
                {isChecked && (
                  <Ionicons name="checkmark" size={24} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.phoneButton}>
              <MaterialIcons name="phone" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.divider} />

        {/* Items Section */}
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsHeader}>
            {isPickupMode
              ? `Pick up ${mockOrderDetails.pickup.items.length} Items`
              : "Deliver Items"}
          </Text>

          {mockOrderDetails.pickup.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Slide-to-confirm button */}
        <View 
          style={[
            styles.slideButtonContainer,
            isDisabled ? styles.slideButtonDisabled : null
          ]}
        >
          {/* Progress bar that fills as you slide */}
          <Animated.View 
            style={[
              styles.slideProgress, 
              { width: progressWidth }
            ]} 
          />
          
          {/* Text instructions */}
          <Text style={[
            styles.slideText,
            isDisabled ? styles.slideTextDisabled : null
          ]}>
            {isPickupMode ? "Slide After Pickup" : "Slide to Confirm Delivery"}
          </Text>
          
          {/* Thumb you drag */}
          <Animated.View 
            {...(isDisabled ? {} : panResponder.panHandlers)}
            style={[
              styles.slideThumb,
              { left: thumbLeft },
              isDisabled ? styles.slideThumbDisabled : null
            ]}
          >
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color={isDisabled ? "#ccc" : "#fff"} 
            />
          </Animated.View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: "#DDD",
    width: 40,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 5,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  headerTitleWithPrice: {
    maxWidth: '70%', 
  },
  headerPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF5722",
  },
  subheader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  subheaderText: {
    fontSize: 16,
    color: "#757575",
  },
  subheaderRightText: {
    fontSize: 16,
    color: "#757575",
  },
  mainDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 5,
    width: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 16,
  },
  customerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerImageContainer: {
    marginRight: 16,
  },
  customerLabel: {
    fontSize: 14,
    color: "#757575",
  },
  customerName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  customerCode: {
    fontSize: 14,
    color: "#FF5722",
    fontWeight: "500",
    marginTop: 2,
  },
  phoneButton: {
    backgroundColor: "#4CAF50",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
  },
  checkboxUnchecked: {
    backgroundColor: "#E0E0E0",
    borderWidth: 1,
    borderColor: "#BDBDBD",
  },
  itemsContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  itemsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF5722",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    color: "#757575",
  },

  slideButtonContainer: {
    position: 'relative',
    height: 55,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#f5f5f5",
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideButtonDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  slideProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 86, 34, 0.36)', // Light orange background
  },
  slideText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
    textAlign: 'center',
    width: '100%',
  },
  slideTextDisabled: {
    color: "#BDBDBD",
  },
  slideThumb: {
    position: 'absolute',
    left: 0,
    top:1,
    width: 50,
    height: 50,
    borderRadius: 20,
    backgroundColor: "#FF5722",
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  slideThumbDisabled: {
    backgroundColor: "#E0E0E0",
  },

});

export default DestinationBottomSheet;