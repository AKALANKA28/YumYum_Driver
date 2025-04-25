import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import styled from "styled-components/native";
import OTPTextInput from "react-native-otp-textinput";

import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import FormStorage from "../utils/FormStorage";

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
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

const Title = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.xxlarge}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.md}px;
`;

const Subtitle = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  color: ${(props) => props.theme.colors.lightText};
  margin-bottom: ${(props) => props.theme.spacing.xl}px;
`;

const PhoneNumber = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.md}px;
`;

const OTPContainer = styled(View)`
  margin-bottom: ${(props) => props.theme.spacing.xl}px;
  align-items: center;
`;

const ResendContainer = styled(View)`
  flex-direction: row;
  justify-content: center;
  margin-top: ${(props) => props.theme.spacing.md}px;
  margin-bottom: ${(props) => props.theme.spacing.lg}px;
`;

const ResendText = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  color: ${(props) => props.theme.colors.lightText};
`;

const ResendLink = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) => props.theme.colors.primary};
  margin-left: 5px;
`;

const TimerText = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  color: ${(props) => props.theme.colors.lightText};
  margin-left: 5px;
`;

const ErrorText = styled(Text)`
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.fontSizes.small}px;
  margin-top: ${(props) => props.theme.spacing.xs}px;
  margin-bottom: ${(props) => props.theme.spacing.sm}px;
`;

// Form validation schema
const OTPSchema = Yup.object().shape({
  otp: Yup.string()
    .length(6, "OTP must be exactly 6 digits")
    .required("OTP is required"),
});

export default function OTPScreen() {
  const params = useLocalSearchParams<{
    phoneNumber: string;
  }>();

  const { phoneNumber } = params;
  const { verifyOTP, signup, authState, clearError } = useAuth();

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpError, setOtpError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const otpRef = useRef(null);

  // Reset loading state when component mounts
  useEffect(() => {
    // Clear any previous auth errors when mounting this screen
    if (authState.error) {
      clearError();
    }

    setIsSubmitting(false);
    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // If phone is already verified, navigate to next screen
    if (
      authState.isPhoneVerified &&
      authState.verifiedPhoneNumber === phoneNumber
    ) {
      router.replace({
        pathname: "/(auth)/personal-info",
        params: {
          phoneNumber: phoneNumber,
          verificationId: "verified",
        },
      });
    }
  }, [authState.isPhoneVerified, authState.verifiedPhoneNumber, phoneNumber]);

  const startTimer = () => {
    setTimer(60);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleVerifyOTP = async (values: { otp: string }) => {
    if (isSubmitting) return;

    setOtpError("");
    setIsSubmitting(true);

    try {
      // Clear any previous errors
      if (authState.error) {
        clearError();
      }

      console.log("Verifying OTP:", {
        phoneNumber,
        code: values.otp,
      });

      // Use code instead of otp to match your API
      const result = await verifyOTP({
        phoneNumber,
        code: values.otp, // Make sure to use 'code', not 'otp'
      });

      console.log("Verification successful, result:", result);

      // Store verification data locally with timestamp
      await FormStorage.saveVerificationData({
        phoneNumber,
        verificationId: result,
        timestamp: Date.now(),
      });

      // Navigate to personal info screen with a slight delay to ensure UI updates
      setTimeout(() => {
        router.push({
          pathname: "/(auth)/personal-info",
          params: { verificationId: result || "verification-success" },
        });
      }, 100);
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      setOtpError(error.message || "Failed to verify OTP. Please try again.");

      // Also show an alert for more visibility
      Alert.alert(
        "Verification Error",
        error.message || "Failed to verify OTP. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || isSubmitting) return;

    try {
      // Clear any previous errors
      if (authState.error) {
        clearError();
      }

      setOtpError("");

      await signup(phoneNumber);
      startTimer();

      Alert.alert("Success", "OTP has been resent to your phone number.");
    } catch (error: any) {
      setOtpError(error.message || "Failed to resend OTP. Please try again.");

      Alert.alert(
        "Resend Error",
        error.message || "Failed to resend OTP. Please try again."
      );
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <Container behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <HeaderContainer>
        <BackButton onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </BackButton>
        <HeaderTitle>Verification</HeaderTitle>
      </HeaderContainer>

      <Title>Enter Verification Code</Title>
      <Subtitle>We've sent a verification code to</Subtitle>
      <PhoneNumber>{phoneNumber}</PhoneNumber>

      {(authState.error || otpError) && (
        <ErrorText>{authState.error || otpError}</ErrorText>
      )}

      <Formik
        initialValues={{ otp: "" }}
        validationSchema={OTPSchema}
        onSubmit={handleVerifyOTP}
      >
        {({
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
          isValid,
        }) => (
          <>
            <OTPContainer>
              <OTPTextInput
                ref={otpRef}
                textInputStyle={{
                  borderWidth: 1,
                  borderRadius: 8,
                  borderColor:
                    errors.otp && touched.otp ? "#E50914" : "#E0E0E0",
                  // color: '#000',
                  width: 45,
                  height: 45,
                }}
                inputCount={6}
                handleTextChange={(text) => {
                  setFieldValue("otp", text);
                }}
                keyboardType="numeric"
              />
            </OTPContainer>

            {touched.otp && errors.otp && <ErrorText>{errors.otp}</ErrorText>}

            <Button
              title={isSubmitting ? "Verifying..." : "Verify"}
              onPress={handleSubmit}
              disabled={!isValid || values.otp.length !== 6 || isSubmitting}
              loading={isSubmitting}
              fullWidth
            />
          </>
        )}
      </Formik>

      <ResendContainer>
        <ResendText>Didn't receive a code?</ResendText>
        {canResend ? (
          <TouchableOpacity onPress={handleResendOTP} disabled={isSubmitting}>
            <ResendLink>Resend</ResendLink>
          </TouchableOpacity>
        ) : (
          <TimerText>Resend in {formatTime(timer)}</TimerText>
        )}
      </ResendContainer>
    </Container>
  );
}
