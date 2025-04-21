import React, { ReactNode } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  KeyboardTypeOptions,
  TextInputProps,
} from 'react-native';
import styled from 'styled-components/native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Container = styled(View)`
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const Label = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs}px;
`;

const InputContainer = styled(View)<{ hasError: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.theme.colors.inputBackground};
  border-width: 1px;
  border-color: ${props =>
    props.hasError ? props.theme.colors.error : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium}px;
  padding-horizontal: ${props => props.theme.spacing.md}px;
`;

const StyledInput = styled(TextInput)`
  flex: 1;
  height: 50px;
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.text};
`;

const ErrorText = styled(Text)`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.fontSizes.small}px;
  margin-top: ${props => props.theme.spacing.xs}px;
`;

const IconContainer = styled(View)`
  margin-right: ${props => props.theme.spacing.sm}px;
`;

const RightIconContainer = styled(View)`
  margin-left: ${props => props.theme.spacing.sm}px;
`;

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <Container>
      <Label>{label}</Label>
      <InputContainer hasError={!!error}>
        {leftIcon && <IconContainer>{leftIcon}</IconContainer>}
        <StyledInput
          placeholderTextColor="#999"
          {...props}
        />
        {rightIcon && <RightIconContainer>{rightIcon}</RightIconContainer>}
      </InputContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};

export default Input;