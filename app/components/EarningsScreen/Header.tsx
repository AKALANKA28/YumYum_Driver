import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const Container = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: ${(props) => props.theme.spacing.md}px;
  padding: ${(props) => props.theme.spacing.md}px
    ${(props) => props.theme.spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.primary};
`;

const LeftContainer = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const BackButton = styled(TouchableOpacity)`
  padding: ${(props) => props.theme.spacing.sm}px;
`;

const HeaderTitle = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.large}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: white;
  margin-left: ${(props) => props.theme.spacing.md}px;
`;

const ActionButton = styled(TouchableOpacity)`
  padding: ${(props) => props.theme.spacing.sm}px;
`;

interface HeaderProps {
  title: string;
  onBackPress: () => void;
  onInfoPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBackPress, onInfoPress }) => {
  return (
    <Container>
      <LeftContainer>
        <BackButton onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </BackButton>
        <HeaderTitle>{title}</HeaderTitle>
      </LeftContainer>

      {onInfoPress && (
        <ActionButton onPress={onInfoPress}>
          <Ionicons name="help-circle-outline" size={24} color="white" />
        </ActionButton>
      )}
    </Container>
  );
};

export default Header;
