import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import styled from "styled-components/native";
import { BarChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

const Container = styled(View)`
  margin-horizontal: 6px;
  margin-bottom: ${(props) => props.theme.spacing.lg}px;
  background-color: white;
  border-radius: ${(props) => props.theme.borderRadius.medium}px;
  overflow: hidden;
`;

const TabsRow = styled(View)`
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.colors.border};
`;

const TabButton = styled(TouchableOpacity)<{ active: boolean }>`
  padding: ${(props) => props.theme.spacing.md}px;
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${(props) =>
    props.active ? props.theme.colors.background : "white"};
  border-bottom-width: 2px;
  border-bottom-color: ${(props) =>
    props.active ? props.theme.colors.primary : "transparent"};
`;

const TabText = styled(Text)<{ active: boolean }>`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => (props.active ? "600" : "400")};
  color: ${(props) =>
    props.active ? props.theme.colors.primary : props.theme.colors.lightText};
`;

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity?: number) => string;
    strokeWidth?: number;
  }[];
  legend?: string[];
}

interface EarningsChartProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  weeklyData: ChartData;
  monthlyData: ChartData;
}

const EarningsChart: React.FC<EarningsChartProps> = ({
  activeTab,
  onTabChange,
  weeklyData,
  monthlyData,
}) => {
  // Animation value for fade-in effect
  const [fadeAnim] = useState(new Animated.Value(1));

  // Handle tab change with animation
  const handleTabChange = (tab: string) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Change tab
      onTabChange(tab);

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  // Simple chart configuration for the bar chart
  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    barPercentage: 0.6,
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "#f0f0f0", // Very light grid lines
    },
    formatYLabel: (value: string) => `${parseInt(value)}`,
  };

  return (
    <Container>
      <TabsRow>
        <TabButton
          active={activeTab === "weekly"}
          onPress={() => handleTabChange("weekly")}
        >
          <TabText active={activeTab === "weekly"}>This Week</TabText>
        </TabButton>

        <TabButton
          active={activeTab === "monthly"}
          onPress={() => handleTabChange("monthly")}
        >
          <TabText active={activeTab === "monthly"}>This Month</TabText>
        </TabButton>
      </TabsRow>

      <Animated.View
        style={{
          padding: 16,
          opacity: fadeAnim,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#333",
            }}
          >
            {activeTab === "weekly"
              ? "Earnings This Week"
              : "Earnings This Month"}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#4285F4",
                borderRadius: 6,
                marginRight: 4,
              }}
            />
            <Text style={{ fontSize: 12, color: "#666" }}>
              {activeTab === "weekly" ? "Daily Earnings" : "Weekly Earnings"}
            </Text>
          </View>
        </View>

        <View style={{ position: "relative" }}>
          <BarChart
            data={activeTab === "weekly" ? weeklyData : monthlyData}
            width={width - 30}
            height={220}
            yAxisLabel="$"
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            withInnerLines={false}
            showValuesOnTopOfBars={false}
            fromZero
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: "#eee",
          }}
        >
          <View>
            <Text style={{ fontSize: 12, color: "#666" }}>
              {activeTab === "weekly" ? "HIGHEST DAY" : "HIGHEST WEEK"}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
              {activeTab === "weekly" ? "$145.50" : "$560.50"}
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 12, color: "#666" }}>
              {activeTab === "weekly" ? "AVERAGE/DAY" : "AVERAGE/WEEK"}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
              {activeTab === "weekly" ? "$100.45" : "$494.35"}
            </Text>
          </View>

          <View>
            <Text style={{ fontSize: 12, color: "#666" }}>TOTAL</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
              {activeTab === "weekly" ? "$703.15" : "$1,977.40"}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Container>
  );
};

export default EarningsChart;
