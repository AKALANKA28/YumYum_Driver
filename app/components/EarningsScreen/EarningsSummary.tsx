import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const Container = styled(View)`
  background-color: white;
  margin-horizontal: ${(props) => props.theme.spacing.md}px;
  margin-bottom: ${(props) => props.theme.spacing.lg}px;
  border-radius: ${(props) => props.theme.borderRadius.medium}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
  overflow: hidden;
`;

const PeriodSelector = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  padding: ${(props) => props.theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.colors.border};
`;

const PeriodText = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) => props.theme.colors.darkText};
`;

const ArrowContainer = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const ArrowButton = styled(TouchableOpacity)`
  padding-horizontal: ${(props) => props.theme.spacing.sm}px;
`;

const Stats = styled(View)`
  padding: ${(props) => props.theme.spacing.lg}px;
`;

const TotalAmount = styled(Text)`
  font-size: 32px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: ${(props) => props.theme.spacing.md}px;
`;

const StatsRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${(props) => props.theme.spacing.md}px;
`;

const StatBlock = styled(View)`
  flex: 1;
`;

const StatLabel = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.small}px;
  color: ${(props) => props.theme.colors.lightText};
  margin-bottom: 4px;
`;

const StatValue = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) => props.theme.colors.darkText};
`;

interface EarningsSummaryProps {
  period: string;
  amount: string;
  onNextPeriod: () => void;
  onPrevPeriod: () => void;
  stats: {
    trips: string;
    hours: string;
    perHour: string;
    distance: string;
  };
}

const EarningsSummary: React.FC<EarningsSummaryProps> = ({
  period,
  amount,
  onNextPeriod,
  onPrevPeriod,
  stats,
}) => {
  return (
    <Container>
      <PeriodSelector>
        <PeriodText>{period}</PeriodText>
        <ArrowContainer>
          <ArrowButton onPress={onPrevPeriod}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </ArrowButton>
          <ArrowButton onPress={onNextPeriod}>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </ArrowButton>
        </ArrowContainer>
      </PeriodSelector>

      <Stats>
        <TotalAmount>{amount}</TotalAmount>

        <StatsRow>
          <StatBlock>
            <StatLabel>Trips</StatLabel>
            <StatValue>{stats.trips}</StatValue>
          </StatBlock>

          <StatBlock>
            <StatLabel>Hours</StatLabel>
            <StatValue>{stats.hours}</StatValue>
          </StatBlock>
        </StatsRow>

        <StatsRow>
          <StatBlock>
            <StatLabel>Per Hour</StatLabel>
            <StatValue>{stats.perHour}</StatValue>
          </StatBlock>

          <StatBlock>
            <StatLabel>Distance</StatLabel>
            <StatValue>{stats.distance}</StatValue>
          </StatBlock>
        </StatsRow>
      </Stats>
    </Container>
  );
};

export default EarningsSummary;
