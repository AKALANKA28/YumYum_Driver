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
} from 'react-native';
import { router } from 'expo-router'; // Use router instead of navigation
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

import { useAuth } from '../src/context/AuthContext';
import Input from '../src/components/common/Input';
import Button from '../src/components/common/Button'; // Fixed path from commons to common

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`; // Removed duplicate Container definition

const ScrollContainer = styled(ScrollView)`
  flex: 1;
  padding: ${props => props.theme.spacing.lg}px;
`;

const LogoContainer = styled(View)`
  align-items: center;
  margin-vertical: ${props => props.theme.spacing.xxl}px;
`;

const Logo = styled(Image)`
  width: 180px;
  height: 100px;
  resize-mode: contain;
`;

const Title = styled(Text)`
  font-size: ${props => props.theme.fontSizes.xxlarge}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.md}px;
  text-align: center;
`;

const Subtitle = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.lightText};
  margin-bottom: ${props => props.theme.spacing.xl}px;
  text-align: center;
`;

const ForgotPasswordLink = styled(TouchableOpacity)`
  align-self: flex-end;
  margin-bottom: ${props => props.theme.spacing.lg}px;
`;

const ForgotPasswordText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.primary};
`;

const SignupContainer = styled(View)`
  flex-direction: row;
  justify-content: center;
  margin-top: ${props => props.theme.spacing.xl}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const SignupText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.lightText};
`;

const SignupLink = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin-left: 5px;
`;

const ErrorContainer = styled(View)`
  background-color: #FFEBEE;
  padding: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.medium}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
`;

const ErrorText = styled(Text)`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.fontSizes.medium}px;
  margin-left: ${props => props.theme.spacing.sm}px;
  flex: 1;
`;

// Form validation schema
const loginSchema = Yup.object().shape({
  loginIdentifier: Yup.string()
    .required('Email, phone number or username is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
});

export default function LoginScreen() {
  const { login, authState, clearError } = useAuth();
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  useEffect(() => {
    if (authState.error) {
      setShowErrorMessage(true);
      const timer = setTimeout(() => {
        setShowErrorMessage(false);
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [authState.error]);

  const handleLogin = async (values: { loginIdentifier: string; password: string }) => {
    try {
      await login(values);
      // Successful login will trigger a redirect in the index.tsx page
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const navigateToSignup = () => {
    router.push('/(auth)/signup'); // Use router.push instead of navigation.navigate
  };

  const navigateToForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <LogoContainer>
          <Logo source={{ uri: 'https://via.placeholder.com/180x100?text=Uber+Eats' }} />
        </LogoContainer>
        
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to your driver account</Subtitle>
        
        {showErrorMessage && authState.error && (
          <ErrorContainer>
            <Ionicons name="alert-circle" size={24} color="#E50914" />
            <ErrorText>{authState.error}</ErrorText>
          </ErrorContainer>
        )}
        
        <Formik
          initialValues={{ loginIdentifier: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
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
                label="Email or Phone"
                value={values.loginIdentifier}
                onChangeText={handleChange('loginIdentifier')}
                onBlur={handleBlur('loginIdentifier')}
                error={touched.loginIdentifier ? errors.loginIdentifier : undefined}
                placeholder="Enter email or phone number"
                keyboardType="default"
                autoCapitalize="none"
              />

              
              <Input
                 label="Password"
                 value={values.password}
                 onChangeText={handleChange('password')}
                 onBlur={handleBlur('password')}
                 error={touched.password ? errors.password : undefined}
                 placeholder="Enter your password"
                 secureTextEntry={!passwordVisible}
                 rightIcon={
                   <TouchableOpacity onPress={togglePasswordVisibility}>
                     <Ionicons
                       name={passwordVisible ? 'eye-off' : 'eye'}
                       size={24}
                       color="#666"
                     />
                   </TouchableOpacity>
                 }
               />
              
              <ForgotPasswordLink onPress={navigateToForgotPassword}>
                <ForgotPasswordText>Forgot password?</ForgotPasswordText>
              </ForgotPasswordLink>
              
              <Button
                title="Log In"
                onPress={handleSubmit}
                disabled={!(isValid && dirty)}
                loading={authState.isLoading}
                fullWidth
              />
            </>
          )}
        </Formik>
        
        <SignupContainer>
          <SignupText>Don't have an account?</SignupText>
          <TouchableOpacity onPress={navigateToSignup}>
            <SignupLink>Sign up instead</SignupLink>
          </TouchableOpacity>
        </SignupContainer>
      </ScrollContainer>
    </Container>
  );
}