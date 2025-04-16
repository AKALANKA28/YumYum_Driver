import React from 'react';
import { ActivityIndicator, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import styled from 'styled-components/native';
import theme from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const ButtonContainer = styled(TouchableOpacity)<{
  variant: string;
  size: string;
  disabled: boolean;
  fullWidth: boolean;
}>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.medium}px;
  padding: ${props => {
    switch (props.size) {
      case 'small':
        return '8px 16px';
      case 'large':
        return '16px 32px';
      default:
        return '12px 24px';
    }
  }};
  background-color: ${props => {
    if (props.disabled) return props.theme.colors.lightText;
    
    switch (props.variant) {
      case 'secondary':
        return props.theme.colors.secondary;
      case 'outline':
      case 'text':
        return 'transparent';
      default:
        return props.theme.colors.primary;
    }
  }};
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  border-width: ${props => (props.variant === 'outline' ? '1px' : '0')};
  border-color: ${props => {
    if (props.disabled) return props.theme.colors.lightText;
    return props.variant === 'outline' ? props.theme.colors.primary : 'transparent';
  }};
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

const ButtonText = styled(Text)<{ variant: string; disabled: boolean }>`
  font-size: ${props => props.theme.fontSizes.regular}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => {
    if (props.disabled) return '#FFFFFF';
    
    switch (props.variant) {
      case 'outline':
      case 'text':
        return props.theme.colors.primary;
      default:
        return '#FFFFFF';
    }
  }};
  text-align: center;
`;

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  return (
    <ButtonContainer
      variant={variant}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      onPress={onPress}
      style={style}
      activeOpacity={0.8}
    >
      {leftIcon && !loading && <>{leftIcon}</>}
      
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'text' ? theme.colors.primary : '#FFFFFF'}
          style={{ marginRight: 8 }}
        />
      ) : null}
      
      <ButtonText variant={variant} disabled={disabled} style={textStyle}>
        {title}
      </ButtonText>
      
      {rightIcon && !loading && <>{rightIcon}</>}
    </ButtonContainer>
  );
};

export default Button;