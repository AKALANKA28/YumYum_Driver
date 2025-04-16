import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

import { useAuth } from '../src/context/AuthContext';
import OTPInput from '../src/components/common/OTPInput';
import Button from '../src/components/common/Button';

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const ScrollContainer = styled(ScrollView)`
  flex: 1;
  padding: ${props => props.theme.spacing.lg}px;
`;

const HeaderContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-top: ${props => props.theme.spacing.lg}px;
  margin-bottom: ${props => props.theme.spacing.xl}px;
`;

const BackButton = styled(TouchableOpacity)`
  padding: ${props => props.theme.spacing.sm}px;
`;

const HeaderTitle = styled(Text)`
  font-size: ${props => props.theme.fontSizes.large}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  flex: 1;
  text-align: center;
  margin-right: ${props => props.theme.spacing.lg}px;
`;

const IllustrationContainer = styled(View)`
  align-items: center;
  margin-vertical: ${props => props.theme.spacing.xl}px;
`;

const Illustration = styled(Image)`
  width: 200px;
  height: 150px;
  resize-mode: contain;
`;

const Title = styled(Text)`
  font-size: ${props => props.theme.fontSizes.xlarge}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md}px;
  text-align: center;
`;

const PhoneText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg}px;
  text-align: center;
`;

const Subtitle = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.lightText};
  margin-bottom: ${props => props.theme.spacing.xl}px;
  text-align: center;
`;

const ResendContainer = styled(View)`
  flex-direction: row;
  justify-content: center;
  margin-top: ${props => props.theme.spacing.xl}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const ResendText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.lightText};
`;

const ResendLink = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin-left: 5px;
`;

const CountdownText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.primary};
  margin-left: 5px;
`;

export default function OTPVerificationScreen() {
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const verificationId = params.verificationId as string;
  
  const { verifyOTP, signup, authState } = useAuth();
  const [otp, setOTP] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const result = await verifyOTP({ phoneNumber, otp });
      router.push({
        pathname: '/(auth)/personal-info', 
        params: { phoneNumber, verificationId: result }
      });
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    try {
      await signup(phoneNumber);
      setCanResend(false);
      setCountdown(60);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your phone.');
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <HeaderContainer>
          <BackButton onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </BackButton>
          <HeaderTitle>OTP Verification</HeaderTitle>
        </HeaderContainer>
        
        <IllustrationContainer>
          <Illustration source={{ uri: 'https://via.placeholder.com/200x150?text=OTP+Verification' }} />
        </IllustrationContainer>
        
        <Title>Verification Code</Title>
        <PhoneText>{phoneNumber}</PhoneText>
        <Subtitle>
          We've sent a verification code to your phone number. Please enter it below.
        </Subtitle>
        
        <OTPInput
          length={6}
          value={otp}
          onChange={setOTP}
          error={error}
        />
        
        <Button
          title="Verify"
          onPress={handleVerifyOTP}
          disabled={otp.length !== 6}
          loading={authState.isLoading}
          fullWidth
          style={{ marginTop: 20 }}
        />
        
        <ResendContainer>
          <ResendText>Didn't receive the code?</ResendText>
          {canResend ? (
            <TouchableOpacity onPress={handleResendOTP}>
              <ResendLink>Resend OTP</ResendLink>
            </TouchableOpacity>
          ) : (
            <CountdownText>Resend in {countdown}s</CountdownText>
          )}
        </ResendContainer>
      </ScrollContainer>
    </Container>
  );
}