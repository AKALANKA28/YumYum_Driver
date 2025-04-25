import React, { forwardRef, ReactNode } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
} from 'react-native';
import styled from 'styled-components/native';

// Combine both interfaces to have the complete set of props
interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Root container for the entire input component
const Container = styled(View)`
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

// Label for the input
const Label = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs}px;
`;

// Container for the input field and icons
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

// The styled text input
const StyledInput = styled(TextInput)`
  flex: 1;
  height: 50px;
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.text};
`;

// Error message text
const ErrorText = styled(Text)`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.fontSizes.small}px;
  margin-top: ${props => props.theme.spacing.xs}px;
`;

// Left icon container
const IconContainer = styled(View)`
  margin-right: ${props => props.theme.spacing.sm}px;
`;

// Right icon container
const RightIconContainer = styled(View)`
  margin-left: ${props => props.theme.spacing.sm}px;
`;

const Input = forwardRef<TextInput, InputProps>(
  (props, ref) => {
    const {
      label,
      error,
      leftIcon,
      rightIcon,
      ...textInputProps
    } = props;
    
    return (
      <Container>
        <Label>{label}</Label>
        <InputContainer hasError={!!error}>
          {leftIcon && <IconContainer>{leftIcon}</IconContainer>}
          <StyledInput
            ref={ref}
            placeholderTextColor="#999"
            {...textInputProps}
          />
          {rightIcon && <RightIconContainer>{rightIcon}</RightIconContainer>}
        </InputContainer>
        {error && <ErrorText>{error}</ErrorText>}
      </Container>
    );
  }
);

// Name the component for better debugging
Input.displayName = 'Input';

export default Input;