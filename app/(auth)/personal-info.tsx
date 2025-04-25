import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  TextInput,
  Keyboard,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import styled from "styled-components/native";

import { useAuth } from "../context/AuthContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import FormStorage from '../utils/FormStorage';

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const ScrollContainer = styled(ScrollView)`
  flex: 1;
  padding: ${(props) => props.theme.spacing.lg}px;
`;

const HeaderContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-top: ${(props) => props.theme.spacing.lg}px;
  margin-bottom: ${(props) => props.theme.spacing.xl}px;
`;

const BackButton = styled(TouchableOpacity)`
  padding: ${(props) => props.theme.spacing.sm}px;
`;

const HeaderTitle = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.large}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  flex: 1;
  text-align: center;
  margin-right: ${(props) => props.theme.spacing.lg}px;
`;

const ProgressContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.lg}px;
`;

const ProgressBar = styled(View)`
  height: 4px;
  flex: 1;
  background-color: ${(props) => props.theme.colors.border};
  border-radius: 2px;
  margin-horizontal: ${(props) => props.theme.spacing.xs}px;
`;

const ProgressIndicator = styled(View)<{ active: boolean }>`
  height: 4px;
  flex: 1;
  background-color: ${(props) =>
    props.active ? props.theme.colors.secondary : props.theme.colors.border};
  border-radius: 2px;
`;

const ProgressStep = styled(View)<{ active: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: ${(props) =>
    props.active ? props.theme.colors.secondary : props.theme.colors.border};
  justify-content: center;
  align-items: center;
`;

const ProgressStepText = styled(Text)`
  color: white;
  font-size: ${(props) => props.theme.fontSizes.small}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
`;

const Title = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.xlarge}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.md}px;
`;

const Subtitle = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  color: ${(props) => props.theme.colors.lightText};
  margin-bottom: ${(props) => props.theme.spacing.xl}px;
`;

const ErrorText = styled(Text)`
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.fontSizes.small}px;
  margin-bottom: ${(props) => props.theme.spacing.md}px;
`;

// Form validation schema
const PersonalInfoSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    // .matches(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    //   'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    // )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

// Add these new styled components after your existing styled components
const HelperText = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.small}px;
  color: ${(props) => props.theme.colors.lightText};
  margin-top: ${(props) => props.theme.spacing.xs}px;
  margin-bottom: ${(props) => props.theme.spacing.sm}px;
  margin-left: ${(props) => props.theme.spacing.sm}px;
`;

const AgreementContainer = styled(View)`
  margin-top: ${(props) => props.theme.spacing.md}px;
  margin-bottom: ${(props) => props.theme.spacing.lg}px;
  padding-horizontal: ${(props) => props.theme.spacing.xs}px;
`;

const AgreementText = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.small}px;
  color: ${(props) => props.theme.colors.text};
  line-height: 18px;
`;

const LinkText = styled(Text)`
  color: ${(props) => props.theme.colors.primary};
  text-decoration-line: underline;
`;

export default function PersonalInfoScreen() {
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const verificationId = params.verificationId as string;

  const { authState, clearError } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [initialFormValues, setInitialFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
  });
  
  useEffect(() => {
    // Clear any previous errors when the screen loads
    if (authState.error) {
      clearError();
    }
  }, []);

   // Load saved form data when component mounts
   useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await FormStorage.getPersonalInfo();
      if (savedData) {
        setInitialFormValues(savedData);
      }
    };
    
    loadSavedData();
  }, []);


    const handleSubmitPersonalInfo = async (values: any) => {
    try {
      setSubmitting(true);
      
      // Save form data to storage
      await FormStorage.savePersonalInfo(values);
      
      // Create the personal info object
      const personalInfo = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phoneNumber: phoneNumber,
        verificationId: verificationId,
        city: values.city,
      };
      
      // Navigate to vehicle info screen
      router.push({
        pathname: "/(auth)/vehicle-info",
        params: { personalInfo: JSON.stringify(personalInfo) },
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message ||
          "Failed to save personal information. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleTermsPress = () => {
    // Open terms of use in a webview or navigate to terms screen
    // router.push("/terms-of-use");
  };

  const handlePrivacyPress = () => {
    // Open privacy policy in a webview or navigate to privacy screen
    // router.push("/privacy-policy");
  };

  const handleInputFocus = (inputY: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: inputY - 100, animated: true });
    }
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
    <Container behavior={Platform.OS === "ios" ? "padding" : "height"}>
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
           initialValues={initialFormValues}
           validationSchema={PersonalInfoSchema}
           onSubmit={handleSubmitPersonalInfo}
           enableReinitialize={true} // Important to use saved values
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
                onChangeText={handleChange("firstName")}
                onBlur={handleBlur("firstName")}
                error={
                  touched.firstName && errors.firstName
                    ? errors.firstName
                    : undefined
                }
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={(e) => {
                  // Access the y position of this input and scroll to it
                  e.target.measure((fx, fy, width, height, px, py) => {
                    handleInputFocus(py);
                  });
                }}
              />

              <Input
                ref={lastNameRef}
                label="Last Name"
                placeholder="Enter your last name"
                value={values.lastName}
                onChangeText={handleChange("lastName")}
                onBlur={handleBlur("lastName")}
                error={
                  touched.lastName && errors.lastName
                    ? errors.lastName
                    : undefined
                }
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={(e) => {
                  e.target.measure((fx, fy, width, height, px, py) => {
                    handleInputFocus(py);
                  });
                }}
              />

              <Input
                ref={emailRef}
                label="Email Address"
                placeholder="Enter your email address"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                error={touched.email && errors.email ? errors.email : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={(e) => {
                  e.target.measure((fx, fy, width, height, px, py) => {
                    handleInputFocus(py);
                  });
                }}
              />

              <Input
                // ref={cityRef}
                label="City"
                placeholder="Enter your city"
                // value={values.city}
                onChangeText={handleChange("city")}
                onBlur={handleBlur("city")}
                // error={touched.city && errors.city ? errors.city : undefined}
                // keyboardType="city"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={(e) => {
                  e.target.measure((fx, fy, width, height, px, py) => {
                    handleInputFocus(py);
                  });
                }}
              />

              <Input
                ref={passwordRef}
                label="Create Password"
                placeholder="Enter a strong password"
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                error={
                  touched.password && errors.password
                    ? errors.password
                    : undefined
                }
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
                onFocus={(e) => {
                  e.target.measure((fx, fy, width, height, px, py) => {
                    handleInputFocus(py);
                  });
                }}
              />

              <Input
                ref={confirmPasswordRef}
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                error={
                  touched.confirmPassword && errors.confirmPassword
                    ? errors.confirmPassword
                    : undefined
                }
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  if (isValid && dirty && !submitting) {
                    handleSubmit();
                  }
                }}
                onFocus={(e) => {
                  e.target.measure((fx, fy, width, height, px, py) => {
                    handleInputFocus(py);
                  });
                }}
              />

              <AgreementContainer>
                {/* <TouchableOpacity
                  onPress={() =>
                    setFieldValue("termsAccepted", !values.termsAccepted)
                  }
                  style={{ flexDirection: "row", alignItems: "flex-start" }}
                > */}
                  {/* <Ionicons
                    name={values.termsAccepted ? "checkbox" : "square-outline"}
                    size={20}
                    color={values.termsAccepted ? "#4CAF50" : "#999"}
                    style={{ marginRight: 8, marginTop: 2 }}
                  /> */}
                  <AgreementText>
                    By proceeding, I agree to YumYum's{" "}
                    <LinkText onPress={handleTermsPress}>Terms of Use</LinkText>{" "}
                    and acknowledge that I have read the{" "}
                    <LinkText onPress={handlePrivacyPress}>
                      Privacy Policy
                    </LinkText>
                    .
                  </AgreementText>
                {/* </TouchableOpacity> */}

                <View style={{ height: 12 }} />

                <AgreementText>
                  I also agree that YumYum or its representatives may contact me
                  by email, phone or SMS (including by automated means) at the
                  email address or number I provide, including for marketing
                  purposes.
                </AgreementText>

                {touched.termsAccepted && errors.termsAccepted && (
                  <ErrorText>{errors.termsAccepted}</ErrorText>
                )}
              </AgreementContainer>

              <Button
                title={submitting ? "Processing..." : "Continue"}
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
