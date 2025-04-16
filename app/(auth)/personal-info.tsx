import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

const ProgressContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg}px;
`;

const ProgressBar = styled(View)`
  height: 4px;
  flex: 1;
  background-color: ${props => props.theme.colors.border};
  border-radius: 2px;
  margin-horizontal: ${props => props.theme.spacing.xs}px;
`;

const ProgressIndicator = styled(View)<{ active: boolean }>`
  height: 4px;
  flex: 1;
  background-color: ${props => 
    props.active ? props.theme.colors.secondary : props.theme.colors.border
  };
  border-radius: 2px;
`;

const ProgressStep = styled(View)<{ active: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: ${props => 
    props.active ? props.theme.colors.secondary : props.theme.colors.border
  };
  justify-content: center;
  align-items: center;
`;

const ProgressStepText = styled(Text)`
  color: white;
  font-size: ${props => props.theme.fontSizes.small}px;
  font-weight: ${props => props.theme.fontWeights.bold};
`;

const Title = styled(Text)`
  font-size: ${props => props.theme.fontSizes.xlarge}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const Subtitle = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  color: ${props => props.theme.colors.lightText};
  margin-bottom: ${props => props.theme.spacing.xl}px;
`;

const ErrorText = styled(Text)`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.fontSizes.small}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

// Form validation schema
const PersonalInfoSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Please enter a valid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    // .matches(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    //   'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    // )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function PersonalInfoScreen() {
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const verificationId = params.verificationId as string;
  
  const { authState, clearError } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    // Clear any previous errors when the screen loads
    if (authState.error) {
      clearError();
    }
  }, []);

  const handleSubmitPersonalInfo = async (values: any) => {
    try {
      setSubmitting(true);
      
      // Create the personal info object
      const personalInfo = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phoneNumber: phoneNumber,
        verificationId: verificationId,
      };
      
      console.log("Submitting personal info:", personalInfo);
      
      // Don't call registerDriver here - we need vehicle info first
      // Just navigate to the next screen with the personal info
      router.push({
        pathname: '/(auth)/vehicle-info',
        params: { personalInfo: JSON.stringify(personalInfo) }
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to save personal information. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderProgressBar = () => {
    return (
      <ProgressContainer>
        <ProgressStep active={true}>
          <ProgressStepText>1</ProgressStepText>
        </ProgressStep>
        <ProgressBar>
          <ProgressIndicator active={true} />
        </ProgressBar>
        <ProgressStep active={false}>
          <ProgressStepText>2</ProgressStepText>
        </ProgressStep>
        <ProgressBar>
          <ProgressIndicator active={false} />
        </ProgressBar>
        <ProgressStep active={false}>
          <ProgressStepText>3</ProgressStepText>
        </ProgressStep>
      </ProgressContainer>
    );
  };

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <HeaderContainer>
          <BackButton onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </BackButton>
          <HeaderTitle>Personal Information</HeaderTitle>
        </HeaderContainer>
        
        {renderProgressBar()}
        
        <Title>Tell us about yourself</Title>
        <Subtitle>We need a few details to set up your driver account</Subtitle>
        
        {authState.error && <ErrorText>{authState.error}</ErrorText>}
        
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={PersonalInfoSchema}
          onSubmit={handleSubmitPersonalInfo}
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
                label="First Name"
                placeholder="Enter your first name"
                value={values.firstName}
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                error={touched.firstName && errors.firstName ? errors.firstName : undefined}
                autoCapitalize="words"
              />
              
              <Input
                label="Last Name"
                placeholder="Enter your last name"
                value={values.lastName}
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                error={touched.lastName && errors.lastName ? errors.lastName : undefined}
                autoCapitalize="words"
              />
              
              <Input
                label="Email Address"
                placeholder="Enter your email address"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email ? errors.email : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <Input
                label="Create Password"
                placeholder="Enter a strong password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && errors.password ? errors.password : undefined}
                secureTextEntry
              />
              
              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={
                  touched.confirmPassword && errors.confirmPassword
                    ? errors.confirmPassword
                    : undefined
                }
                secureTextEntry
              />
              
              <Button
                title={submitting ? "Processing..." : "Next"}
                onPress={handleSubmit}
                disabled={!(isValid && dirty) || submitting}
                loading={submitting}
                fullWidth
              />
            </>
          )}
        </Formik>
      </ScrollContainer>
    </Container>
  );
}