import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const Container = styled(View)`
  margin-horizontal: ${(props) => props.theme.spacing.md}px;
  margin-bottom: ${(props) => props.theme.spacing.md}px;
`;

const Card = styled(TouchableOpacity)`
  background-color: white;
  border-radius: ${(props) => props.theme.borderRadius.medium}px;
  padding: ${(props) => props.theme.spacing.md}px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  elevation: 2;
`;

const TransactionHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${(props) => props.theme.spacing.sm}px;
`;

const TransactionTitle = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.medium};
  color: ${(props) => props.theme.colors.darkText};
`;

const TransactionAmount = styled(Text)<{ isPositive: boolean }>`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) =>
    props.isPositive ? props.theme.colors.success : props.theme.colors.error};
`;

const TransactionDetails = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const TransactionTime = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.small}px;
  color: ${(props) => props.theme.colors.lightText};
`;

const SectionHeader = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  margin-bottom: ${(props) => props.theme.spacing.md}px;
  color: ${(props) => props.theme.colors.darkText};
`;

interface Transaction {
  id: string;
  title: string;
  description: string;
  amount: string;
  time: string;
  isPositive: boolean;
}

interface TransactionHistoryProps {
  title: string;
  transactions: Transaction[];
  onTransactionPress?: (transaction: Transaction) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  title,
  transactions,
  onTransactionPress,
}) => {
  return (
    <Container>
      <SectionHeader>{title}</SectionHeader>
      {transactions.map((transaction) => (
        <Card
          key={transaction.id}
          onPress={() => onTransactionPress && onTransactionPress(transaction)}
          activeOpacity={0.7}
        >
          <TransactionHeader>
            <TransactionTitle>{transaction.title}</TransactionTitle>
            <TransactionAmount isPositive={transaction.isPositive}>
              {transaction.amount}
            </TransactionAmount>
          </TransactionHeader>

          <TransactionDetails>
            <Ionicons
              name={
                transaction.isPositive
                  ? "arrow-up-circle-outline"
                  : "arrow-down-circle-outline"
              }
              size={16}
              color={transaction.isPositive ? "#00CC66" : "#E50914"}
              style={{ marginRight: 5 }}
            />
            <TransactionTime>
              {transaction.description} • {transaction.time}
            </TransactionTime>
          </TransactionDetails>
        </Card>
      ))}
    </Container>
  );
};

export default TransactionHistory;
