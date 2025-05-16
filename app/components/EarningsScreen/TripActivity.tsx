import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const Container = styled(View)`
  flex: 1;
  background-color: white;
`;

const DateView = styled(View)`
  padding: ${(props) => props.theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.colors.border};
`;

const DateText = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) => props.theme.colors.darkText};
`;

const TripList = styled(ScrollView)`
  flex: 1;
`;

const TripItem = styled(TouchableOpacity)`
  padding: ${(props) => props.theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.colors.border};
  flex-direction: row;
  justify-content: space-between;
`;

const TripInfo = styled(View)`
  flex: 1;
`;

const TripTitle = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.medium};
  margin-bottom: 4px;
  color: ${(props) => props.theme.colors.darkText};
`;

const TripDetail = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.small}px;
  color: ${(props) => props.theme.colors.lightText};
`;

const TripAmount = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) => props.theme.colors.darkText};
`;

const EmptyState = styled(View)`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.xl}px;
`;

const EmptyStateText = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  color: ${(props) => props.theme.colors.lightText};
  text-align: center;
  margin-top: ${(props) => props.theme.spacing.md}px;
`;

interface Trip {
  id: string;
  title: string;
  detail: string;
  time: string;
  amount: string;
}

interface TripActivityProps {
  date: string;
  trips: Trip[];
  onTripPress: (trip: Trip) => void;
}

const TripActivity: React.FC<TripActivityProps> = ({
  date,
  trips,
  onTripPress,
}) => {
  return (
    <Container>
      <DateView>
        <DateText>{date}</DateText>
      </DateView>

      {trips.length > 0 ? (
        <TripList showsVerticalScrollIndicator={false}>
          {trips.map((trip) => (
            <TripItem key={trip.id} onPress={() => onTripPress(trip)}>
              <TripInfo>
                <TripTitle>{trip.title}</TripTitle>
                <TripDetail>
                  {trip.detail} • {trip.time}
                </TripDetail>
              </TripInfo>
              <TripAmount>{trip.amount}</TripAmount>
            </TripItem>
          ))}
        </TripList>
      ) : (
        <EmptyState>
          <Ionicons name="car-outline" size={60} color="#ccc" />
          <EmptyStateText>No trips found for this day</EmptyStateText>
        </EmptyState>
      )}
    </Container>
  );
};

export default TripActivity;
