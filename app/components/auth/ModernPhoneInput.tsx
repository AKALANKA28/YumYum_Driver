import React, { forwardRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { LogBox } from 'react-native';

// Define props interface for our wrapper
interface ModernPhoneInputProps {
  value?: string;
  defaultValue?: string;
  defaultCode?: string;
  layout?: 'first' | 'second';
  onChangeText?: (text: string) => void;
  onChangeFormattedText?: (text: string) => void;
  withDarkTheme?: boolean;
  withShadow?: boolean;
  autoFocus?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textContainerStyle?: StyleProp<ViewStyle>;
  textInputStyle?: StyleProp<ViewStyle>;
  codeTextStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
  disabled?: boolean;
}

// Create a forwarded ref component that wraps the original PhoneInput
const ModernPhoneInput = forwardRef<PhoneInput, ModernPhoneInputProps>(
  ({
    value = '',
    defaultValue = '',
    defaultCode = 'LK',
    layout = 'first',
    onChangeText = () => {},
    onChangeFormattedText = () => {},
    withDarkTheme = false,
    withShadow = false,
    autoFocus = false,
    containerStyle = {},
    textContainerStyle = {},
    textInputStyle = {},
    codeTextStyle = {},
    placeholder = 'Phone Number',
    disabled = false
  }, ref) => {
    return (
      <PhoneInput
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        defaultCode={defaultCode}
        layout={layout}
        onChangeText={onChangeText}
        onChangeFormattedText={onChangeFormattedText}
        withDarkTheme={withDarkTheme}
        withShadow={withShadow}
        autoFocus={autoFocus}
        containerStyle={containerStyle}
        textContainerStyle={textContainerStyle}
        textInputStyle={textInputStyle}
        codeTextStyle={codeTextStyle}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }
);

export default ModernPhoneInput;