import React, { useState } from "react";
import {
  View,
  StatusBar,
  ScrollView,
  Dimensions,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { router } from "expo-router";
import styled from "styled-components/native";
// import { LineChart } from 'react-native-chart-kit';

// Import our component pieces
import Header from "../components/EarningsScreen/Header";
import EarningsSummary from "../components/EarningsScreen/EarningsSummary";
import EarningsChart from "../components/EarningsScreen/EarningsChart";
import TransactionHistory from "../components/EarningsScreen/TransactionHistory";
import TripActivity from "../components/EarningsScreen/TripActivity";

const { width } = Dimensions.get("window");

const Container = styled(View)`
  flex: 2;
  background-color: ${(props) => props.theme.colors.background};
`;

const TabContainer = styled(View)`
  flex-direction: row;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.colors.border};
`;

const TabButton = styled(TouchableOpacity)<{ active: boolean }>`
  padding: ${(props) => props.theme.spacing.md}px;
  flex: 1;
  align-items: center;
  border-bottom-width: 2px;
  border-bottom-color: ${(props) =>
    props.active ? props.theme.colors.primary : "transparent"};
`;

const TabText = styled(Text)<{ active: boolean }>`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => (props.active ? "600" : "400")};
  color: ${(props) =>
    props.active ? props.theme.colors.primary : props.theme.colors.darkText};
`;

// Mock data for earnings with enhanced styling
const weeklyData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      data: [65.5, 89.25, 72.8, 94.1, 120.75, 145.5, 115.25],
      color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
      strokeWidth: 3,
    },
  ],
  legend: ["Daily Earnings"],
};

const monthlyData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      data: [420.75, 515.9, 480.25, 560.5],
      color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
      strokeWidth: 3,
    },
  ],
  legend: ["Weekly Earnings"],
};

// Mock data for transactions
const transactions = [
  {
    id: "1",
    title: "Delivery Earnings",
    description: "Order #UE-8471",
    amount: "+$12.50",
    time: "Today, 10:45 AM",
    isPositive: true,
  },
  {
    id: "2",
    title: "Delivery Earnings",
    description: "Order #UE-8465",
    amount: "+$18.75",
    time: "Today, 9:30 AM",
    isPositive: true,
  },
  {
    id: "3",
    title: "Tip",
    description: "Order #UE-8465",
    amount: "+$5.00",
    time: "Today, 9:45 AM",
    isPositive: true,
  },
  {
    id: "4",
    title: "Weekly Bonus",
    description: "Completed 20 deliveries",
    amount: "+$25.00",
    time: "Yesterday, 11:59 PM",
    isPositive: true,
  },
  {
    id: "5",
    title: "Delivery Earnings",
    description: "Order #UE-8450",
    amount: "+$15.25",
    time: "Yesterday, 7:15 PM",
    isPositive: true,
  },
  {
    id: "6",
    title: "Instant Cashout Fee",
    description: "Transfer to Bank ****4589",
    amount: "-$0.50",
    time: "Yesterday, 8:30 PM",
    isPositive: false,
  },
];

// Mock trip data
const trips = [
  {
    id: "1",
    title: "KFC - Colombo 03",
    detail: "2.5 miles",
    time: "10:45 AM",
    amount: "$12.50",
  },
  {
    id: "2",
    title: "Pizza Hut - Rajagiriya",
    detail: "3.8 miles",
    time: "9:30 AM",
    amount: "$18.75",
  },
  {
    id: "3",
    title: "Burger King - Dehiwala",
    detail: "1.2 miles",
    time: "8:15 AM",
    amount: "$8.25",
  },
];

const chartConfig = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientTo: "#FFFFFF",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#000000",
  },
};

export default function EarningsScreen() {
  const [activeTab, setActiveTab] = useState("earnings"); // earnings or activity
  const [chartView, setChartView] = useState("weekly"); // weekly or monthly
  const [currentPeriod, setCurrentPeriod] = useState("May 7 - May 14");
  const [currentAmount, setCurrentAmount] = useState("$703.15");

  // Demo function to simulate period navigation
  const handlePeriodChange = (direction: "next" | "prev") => {
    if (direction === "next") {
      setCurrentPeriod("May 15 - May 22");
      setCurrentAmount("$768.25");
    } else {
      setCurrentPeriod("Apr 30 - May 6");
      setCurrentAmount("$645.90");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleInfoPress = () => {
    Alert.alert(
      "Earnings Information",
      "Your earnings include base pay, tips, and bonuses. Tap on any transaction for more details."
    );
  };

  const handleTripPress = (trip: any) => {
    // Navigate to trip details or show modal
    Alert.alert(
      "Trip Details",
      `You earned ${trip.amount} from this delivery.`
    );
  };

  const handleTransactionPress = (transaction: any) => {
    // Navigate to transaction details or show modal
    Alert.alert(
      "Transaction Details",
      `${transaction.title}: ${transaction.amount}`
    );
  };

  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <Header
        title="Earnings"
        onBackPress={handleBack}
        onInfoPress={handleInfoPress}
      />

      {/* <TabContainer>
        <TabButton
          active={activeTab === "earnings"}
          onPress={() => setActiveTab("earnings")}
        >
          <TabText active={activeTab === "earnings"}>Earnings</TabText>
        </TabButton>

        <TabButton
          active={activeTab === "activity"}
          onPress={() => setActiveTab("activity")}
        >
          <TabText active={activeTab === "activity"}>Activity</TabText>
        </TabButton>
      </TabContainer> */}

      {activeTab === "earnings" ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* <EarningsSummary
            period={currentPeriod}
            amount={currentAmount}
            onNextPeriod={() => handlePeriodChange("next")}
            onPrevPeriod={() => handlePeriodChange("prev")}
            stats={{
              trips: "35",
              hours: "25.5",
              perHour: "$27.57",
              distance: "186 km",
            }}
          /> */}


          <EarningsChart
            activeTab={chartView}
            onTabChange={setChartView}
            weeklyData={weeklyData}
            monthlyData={monthlyData}
          />

          <TransactionHistory
            title="Recent Transactions"
            transactions={transactions}
            onTransactionPress={handleTransactionPress}
          />
        </ScrollView>
      ) : (
        <TripActivity
          date="Today, May 14"
          trips={trips}
          onTripPress={handleTripPress}
        />
      )}
    </Container>
  );
}
