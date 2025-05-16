import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import styled from "styled-components/native";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

const Container = styled(View)`
  margin-horizontal:6px;
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

  // State for tooltip
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Animation for tooltip
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

  // Get chart data based on active tab
  const chartData = activeTab === "weekly" ? weeklyData : monthlyData;

  // Handle tooltip show/hide
  const showTooltip = (index: number, x: number, y: number) => {
    setTooltipIndex(index);
    setTooltipPos({ x, y });
    setTooltipVisible(true);
    Animated.timing(tooltipOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideTooltip = () => {
    Animated.timing(tooltipOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTooltipVisible(false);
    });
  };

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
      // Hide tooltip if visible
      if (tooltipVisible) {
        hideTooltip();
      }

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
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
                backgroundColor: activeTab === "weekly" ? "#1976d2" : "#009688",
                borderRadius: 6,
                marginRight: 4,
              }}
            />
            <Text style={{ fontSize: 12, color: "#666" }}>
              {activeTab === "weekly" ? "Daily Earnings" : "Weekly Earnings"}
            </Text>
          </View>
        </View>

        <View style={{ position: "relative", marginLeft: -37 }}>
          <LineChart
            data={activeTab === "weekly" ? weeklyData : monthlyData}
            width={width}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) =>
                activeTab === "weekly"
                  ? `rgba(54, 162, 235, ${opacity})`
                  : `rgba(75, 192, 192, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: activeTab === "weekly" ? "#1976d2" : "#009688",
              },
              propsForBackgroundLines: {
                strokeWidth: 1,
                stroke: "#e0e0e0",
                strokeDasharray: "5, 5",
              },
              formatYLabel: (value) => `$${parseFloat(value).toFixed(0)}`,
              formatXLabel: (value) => value,
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            withInnerLines={true}
            withOuterLines={false}
            withShadow={false}
            xAxisLabel=""
            
            yAxisSuffix=""
            yAxisInterval={1}
            fromZero={true}
            segments={5}
            // This onDataPointClick handler shows tooltip on tap
            onDataPointClick={({ value, index, x, y }) => {
              showTooltip(index, x, y - 40);
            }}
            decorator={() => {
              if (!tooltipVisible) return null;

              const currentData =
                activeTab === "weekly"
                  ? weeklyData.datasets[0].data[tooltipIndex]
                  : monthlyData.datasets[0].data[tooltipIndex];

              const formattedValue = `$${currentData.toFixed(2)}`;
              const currentLabel =
                activeTab === "weekly"
                  ? weeklyData.labels[tooltipIndex]
                  : monthlyData.labels[tooltipIndex];

              return (
                <Animated.View
                  style={{
                    position: "absolute",
                    left: tooltipPos.x - 40,
                    top: tooltipPos.y,
                    backgroundColor: "rgba(0,0,0,0.8)",
                    padding: 8,
                    borderRadius: 4,
                    opacity: tooltipOpacity,
                    width: 80,
                    alignItems: "center",
                    zIndex: 999,
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                  >
                    {formattedValue}
                  </Text>
                  <Text style={{ color: "white", fontSize: 10 }}>
                    {currentLabel}
                  </Text>
                </Animated.View>
              );
            }}
          />
        </View>

        {/* Chart stats */}
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
