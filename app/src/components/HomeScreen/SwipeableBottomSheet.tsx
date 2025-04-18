import React, { useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import OrderButton from "./OrdersButton";

const SwipeableBottomSheet = () => {
  // Bottom sheet reference
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Define snap points with extra space for the button
  const snapPoints = useMemo(() => ["25%", "60%"], []);

  // Use version 5 specific animation configs
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        handleIndicatorStyle={styles.handleIndicator}
        enablePanDownToClose={false}
        animationConfigs={animationConfigs}
        backgroundStyle={styles.bottomSheetBackground}
        style={styles.bottomSheet}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Order button positioned at the top of the sheet */}
          <View style={styles.orderButtonContainer}>
            <OrderButton />
          </View>

          {/* Quick stats below the button */}
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStatItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.quickStatText}>4h 32m</Text>
              <Text style={styles.quickStatLabel}>Online</Text>
            </View>
            <View style={styles.quickStatItem}>
              <FontAwesome5 name="route" size={18} color="#666" />
              <Text style={styles.quickStatText}>24.5 km</Text>
              <Text style={styles.quickStatLabel}>Distance</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Ionicons name="speedometer-outline" size={20} color="#666" />
              <Text style={styles.quickStatText}>8</Text>
              <Text style={styles.quickStatLabel}>Orders</Text>
            </View>
          </View>

          {/* Additional content */}
          <View style={styles.expandedContentContainer}>
            <Text style={styles.sectionTitle}>Today's Summary</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>LKR 2,850</Text>
                <Text style={styles.statLabel}>Earnings</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>4.9</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

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
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  orderButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20, // Space between button and stats
    paddingTop: 60,
    paddingBottom: 15,
    zIndex: 10,
  },
  bottomSheetBackground: {
    backgroundColor: "#fff",
  },
  handleIndicator: {
    backgroundColor: "#DDDDDD",
    width: 40,
  },
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  quickStatItem: {
    alignItems: "center",
  },
  quickStatText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginTop: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  expandedContentContainer: {
    marginTop: 30,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#222",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
});

export default SwipeableBottomSheet;