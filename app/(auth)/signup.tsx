import React from 'react';
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
import PhoneInput from 'react-native-phone-number-input';

import { useAuth } from '../src/context/AuthContext';
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

const LogoContainer = styled(View)`
  align-items: center;
  margin-vertical: ${props => props.theme.spacing.xl}px;
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

const PhoneInputWrapper = styled(View)`
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const PhoneInputLabel = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs}px;
`;

const PhoneInputContainer = styled(View)`
  margin-bottom: ${props => props.theme.spacing.xs}px;
`;

const ErrorText = styled(Text)`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.fontSizes.small}px;
  margin-top: ${props => props.theme.spacing.xs}px;
`;

const LoginContainer = styled(View)`
  flex-direction: row;
  justify-content: center;
  margin-top: ${props => props.theme.spacing.xl}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const LoginText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.lightText};
`;

const LoginLink = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin-left: 5px;
`;

const TermsContainer = styled(View)`
  margin-top: ${props => props.theme.spacing.md}px;
  margin-bottom: ${props => props.theme.spacing.lg}px;
`;

const TermsText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.lightText};
  text-align: center;
`;

const TermsLink = styled(Text)`
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
`;

// Form validation schema
const PhoneSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(/^\+[1-9]\d{10,14}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
});

export default function SignupScreen() {
  const { signup, authState, clearError } = useAuth();
  const phoneInput = React.useRef(null);

  const handleSignup = async (values: { phoneNumber: string }) => {
    try {
      // Clear any previous errors
      if (authState.error) {
        clearError();
      }
      
      const verificationId = await signup(values.phoneNumber);
      
      router.push({
        pathname: '/(auth)/otp',
        params: { phoneNumber: values.phoneNumber, verificationId }
      });
    } catch (error: any) {
      // Display error to user if not already handled by auth context
      if (!authState.error) {
        Alert.alert(
          "Signup Error",
          error.message || "Failed to send verification code. Please try again."
        );
      }
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <HeaderContainer>
          <BackButton onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </BackButton>
          <HeaderTitle>Create Account</HeaderTitle>
        </HeaderContainer>
        
        <LogoContainer>
          <Logo source={{ uri: 'https://via.placeholder.com/180x100?text=Uber+Eats' }} />
        </LogoContainer>
        
        <Title>Get Started</Title>
        <Subtitle>Sign up to start delivering with Uber Eats</Subtitle>
        
        {authState.error && <ErrorText>{authState.error}</ErrorText>}
        
        <Formik
          initialValues={{ phoneNumber: '' }}
          validationSchema={PhoneSchema}
          onSubmit={handleSignup}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
            isValid,
            dirty,
          }) => (
            <>
              <PhoneInputWrapper>
                <PhoneInputLabel>Phone Number</PhoneInputLabel>
                <PhoneInputContainer>
                  <PhoneInput
                    ref={phoneInput}
                    defaultValue={values.phoneNumber}
                    defaultCode="LK"
                    layout="first"
                    onChangeFormattedText={(text) => {
                      setFieldValue('phoneNumber', text);
                    }}
                    containerStyle={{
                      width: '100%',
                      borderRadius: 8,
                      backgroundColor: '#F5F5F5',
                      borderWidth: 1,
                      borderColor: touched.phoneNumber && errors.phoneNumber ? '#E50914' : '#E0E0E0',
                    }}
                    textContainerStyle={{
                      backgroundColor: '#F5F5F5',
                      borderRadius: 8,
                    }}
                    withDarkTheme={false}
                    withShadow={false}
                    autoFocus
                  />
                </PhoneInputContainer>
                {touched.phoneNumber && errors.phoneNumber && (
                  <ErrorText>{errors.phoneNumber}</ErrorText>
                )}
              </PhoneInputWrapper>
              
              <TermsContainer>
                <TermsText>
                  By continuing, you agree to our{' '}
                  <TermsLink>Terms of Service</TermsLink> and{' '}
                  <TermsLink>Privacy Policy</TermsLink>
                </TermsText>
              </TermsContainer>
              
              <Button
                title="Continue"
                onPress={handleSubmit}
                disabled={!(isValid && dirty)}
                loading={authState.isLoading}
                fullWidth
              />
            </>
          )}
        </Formik>
        
        <LoginContainer>
          <LoginText>Already have an account?</LoginText>
          <TouchableOpacity onPress={navigateToLogin}>
            <LoginLink>Login</LoginLink>
          </TouchableOpacity>
        </LoginContainer>
      </ScrollContainer>
    </Container>
  );
}