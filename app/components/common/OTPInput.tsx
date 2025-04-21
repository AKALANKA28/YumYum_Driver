import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Text,
} from 'react-native';
import styled from 'styled-components/native';

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
}

const Container = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-vertical: ${props => props.theme.spacing.md}px;
`;

const InputField = styled(TextInput)<{ isFilled: boolean; isActive: boolean; hasError: boolean }>`
  height: 50px;
  width: 45px;
  border-width: 1px;
  border-radius: ${props => props.theme.borderRadius.medium}px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  background-color: ${props => props.theme.colors.inputBackground};
  border-color: ${props => {
    if (props.hasError) return props.theme.colors.error;
    if (props.isActive) return props.theme.colors.primary;
    if (props.isFilled) return props.theme.colors.secondary;
    return props.theme.colors.border;
  }};
`;

const ErrorText = styled(Text)`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.fontSizes.small}px;
  margin-top: ${props => props.theme.spacing.xs}px;
`;

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  keyboardType = 'number-pad',
  error,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [activeInput, setActiveInput] = useState(0);

  useEffect(() => {
    // Prefill refs array
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    // Focus the first input initially
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  const handleChange = (index: number, text: string) => {
    // Validate input is a single digit
    if (text.length > 1) {
      text = text.charAt(0);
    }

    // Update OTP value
    const newValue = value.split('');
    newValue[index] = text;
    onChange(newValue.join(''));

    // Auto-focus next input if we have a value
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handleKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    const key = e.nativeEvent.key;
    
    // Handle backspace
    if (key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current input is empty, focus previous and clear it
        const newValue = value.split('');
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        
        inputRefs.current[index - 1]?.focus();
        setActiveInput(index - 1);
      }
    }
  };

  const handleFocus = (index: number) => {
    setActiveInput(index);
  };

  return (
    <View>
      <Container>
        {Array.from({ length }, (_, index) => (
          <InputField
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            value={value[index] || ''}
            onChangeText={text => handleChange(index, text)}
            onKeyPress={e => handleKeyPress(index, e)}
            onFocus={() => handleFocus(index)}
            keyboardType={keyboardType}
            maxLength={1}
            isFilled={!!value[index]}
            isActive={activeInput === index}
            hasError={!!error}
            selectTextOnFocus
            autoComplete="one-time-code"
          />
        ))}
      </Container>
      {error && <ErrorText>{error}</ErrorText>}
    </View>
  );
};

export default OTPInput;