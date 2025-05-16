import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const Card = styled(View)`
  background-color: white;
  margin: ${(props) => props.theme.spacing.md}px;
  border-radius: ${(props) => props.theme.borderRadius.medium}px;
  padding: ${(props) => props.theme.spacing.lg}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) => props.theme.colors.darkText};
`;

const InfoButton = styled(TouchableOpacity)`
  padding: ${(props) => props.theme.spacing.sm}px;
`;

const Amount = styled(Text)`
  font-size: 36px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
  margin-top: ${(props) => props.theme.spacing.md}px;
  margin-bottom: ${(props) => props.theme.spacing.md}px;
`;

const StatsContainer = styled(View)`
  flex-direction: row;
  margin-top: ${(props) => props.theme.spacing.md}px;
  padding-top: ${(props) => props.theme.spacing.md}px;
  border-top-width: 1px;
  border-top-color: ${(props) => props.theme.colors.border};
`;

const StatItem = styled(View)`
  flex: 1;
`;

const StatValue = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) => props.theme.colors.darkText};
`;

const StatLabel = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.small}px;
  color: ${(props) => props.theme.colors.lightText};
  margin-top: 2px;
`;

interface EarningsSummaryCardProps {
  periodTitle: string;
  totalAmount: string;
  trips: string;
  hours: string;
  perHour: string;
  onInfoPress?: () => void;
}

const EarningsSummaryCard: React.FC<EarningsSummaryCardProps> = ({
  periodTitle,
  totalAmount,
  trips,
  hours,
  perHour,
  onInfoPress,
}) => {
  return (
    <Card>
      <Header>
        <Title>{periodTitle}</Title>
        <InfoButton onPress={onInfoPress}>
          <Ionicons name="help-circle-outline" size={24} color="#666" />
        </InfoButton>
      </Header>

      <Amount>{totalAmount}</Amount>

      <StatsContainer>
        <StatItem>
          <StatValue>{trips}</StatValue>
          <StatLabel>Trips</StatLabel>
        </StatItem>

        <StatItem>
          <StatValue>{hours}</StatValue>
          <StatLabel>Hours</StatLabel>
        </StatItem>

        <StatItem>
          <StatValue>{perHour}</StatValue>
          <StatLabel>Per Hour</StatLabel>
        </StatItem>
      </StatsContainer>
    </Card>
  );
};

export default EarningsSummaryCard;
