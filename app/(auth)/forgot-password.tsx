import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

import { useAuth } from '../src/context/AuthContext';
import Input from '../src/components/common/Input';
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

const Subtitle = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.lightText};
  margin-bottom: ${props => props.theme.spacing.xl}px;
  text-align: center;
`;

// Form validation schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

export default function ForgotPasswordScreen() {
  const { resetPassword, authState } = useAuth();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetPassword = async (values: { email: string }) => {
    try {
      await resetPassword(values.email);
      setResetSuccess(true);
      
      // Show success message
      Alert.alert(
        'Reset Link Sent',
        'A password reset link has been sent to your email address. Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(auth)/login'),
          },
        ]
      );
    } catch (error) {
      // Error is handled by auth context
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
          <HeaderTitle>Reset Password</HeaderTitle>
        </HeaderContainer>
        
        <IllustrationContainer>
          <Illustration source={{ uri: 'https://via.placeholder.com/200x150?text=Reset+Password' }} />
        </IllustrationContainer>
        
        <Title>Forgot your password?</Title>
        <Subtitle>
          Enter your email address below and we'll send you a link to reset your password
        </Subtitle>
        
        <Formik
          initialValues={{ email: '' }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleResetPassword}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isValid,
            dirty,
          }) => (
            <>
              <Input
                label="Email Address"
                placeholder="Enter your email address"
                value={values.email}
                onChangeText={handleChange('email')}
                error={touched.email && errors.email ? errors.email : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Ionicons name="mail-outline" size={20} color="#666" />}
              />
              
              <Button
                title="Send Reset Link"
                onPress={handleSubmit}
                disabled={!(isValid && dirty) || resetSuccess}
                loading={authState.isLoading}
                fullWidth
              />
            </>
          )}
        </Formik>
      </ScrollContainer>
    </Container>
  );
}