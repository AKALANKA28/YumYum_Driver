import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import styled from "styled-components/native";
import DropDownPicker from "react-native-dropdown-picker";

import { useAuth } from "../context/AuthContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import VehicleSelector from "../components/auth/VehicleSelector";
import FormStorage from "../utils/FormStorage";

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
  margin-left: ${(props) => props.theme.spacing.xs}px;
  margin-right: ${(props) => props.theme.spacing.xs}px;
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

const SectionLabel = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.medium};
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.xs}px;
`;

const SectionContainer = styled(View)`
  margin-bottom: ${(props) => props.theme.spacing.lg}px;
`;


const ErrorText = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.small}px;
  color: ${(props) => props.theme.colors.error};
  margin-top: ${(props) => props.theme.spacing.xs}px;
`;

const RowContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;

const HalfWidthContainer = styled(View)`
  width: 48%; 
`;
// Form validation schema
const VehicleInfoSchema = Yup.object().shape({
  vehicleType: Yup.string().required("Vehicle type is required"),
  licensePlate: Yup.string().required("License plate is required"),
  vehicleMake: Yup.string().required("Vehicle make is required"),
  vehicleModel: Yup.string().required("Vehicle model is required"),
  vehicleYear: Yup.string()
    .matches(/^\d{4}$/, "Must be a valid year")
    .required("Vehicle year is required"),
});

export default function VehicleInfoScreen() {
  const params = useLocalSearchParams();
  const personalInfoString = params.personalInfo as string;
  const personalInfo = JSON.parse(personalInfoString);
  const { authState } = useAuth();
  const [initialValues, setInitialValues] = useState({
    vehicleType: "",
    licensePlate: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
  });

  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await FormStorage.getVehicleInfo();
      if (savedData) {
        setInitialValues(savedData);
      }
    };

    loadSavedData();
  }, []);

  const handleSubmitVehicleInfo = async (values: any) => {
    try {
      // Save form data
      await FormStorage.saveVehicleInfo(values);

      // Create vehicle details object
      const vehicleDetails = {
        brand: values.vehicleMake,
        model: values.vehicleModel,
        year: parseInt(values.vehicleYear),
        licensePlate: values.licensePlate,
        color: "White", // Default or add color field to form
        vehicleType: values.vehicleType,
      };

      // Navigate to document upload
      router.push({
        pathname: "/(auth)/document-upload",
        params: {
          vehicleInfo: JSON.stringify(vehicleDetails),
          personalInfo: personalInfoString,
        },
      });
    } catch (error) {
      console.error("Error processing vehicle info:", error);
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
        <ProgressStep active={true}>
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
          <HeaderTitle>Vehicle Information</HeaderTitle>
        </HeaderContainer>

        {renderProgressBar()}

        <Title>Tell us about your vehicle</Title>
        <Subtitle>
          We need information about the vehicle you'll use for deliveries
        </Subtitle>

        <Formik
          initialValues={initialValues}
          validationSchema={VehicleInfoSchema}
          onSubmit={handleSubmitVehicleInfo}
          enableReinitialize={true}
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
            setFieldValue,
          }) => (
            <>
              <SectionContainer>
                <SectionLabel>Vehicle Type</SectionLabel>
                <VehicleSelector
                  value={values.vehicleType}
                  onChange={(value) => setFieldValue("vehicleType", value)}
                  error={
                    touched.vehicleType && errors.vehicleType
                      ? errors.vehicleType
                      : undefined
                  }
                />
              </SectionContainer>

              <RowContainer>
                <HalfWidthContainer>
                  <Input
                    label="License Plate Number"
                    placeholder="Enter plate"
                    value={values.licensePlate}
                    onChangeText={handleChange("licensePlate")}
                    error={
                      touched.licensePlate && errors.licensePlate
                        ? errors.licensePlate
                        : undefined
                    }
                    autoCapitalize="characters"
                  />
                </HalfWidthContainer>

                <HalfWidthContainer>
                  <Input
                    label="Vehicle Year"
                    placeholder="E.g., 2020"
                    value={values.vehicleYear}
                    onChangeText={handleChange("vehicleYear")}
                    error={
                      touched.vehicleYear && errors.vehicleYear
                        ? errors.vehicleYear
                        : undefined
                    }
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </HalfWidthContainer>
              </RowContainer>

              <Input
                label="Vehicle Make"
                placeholder="E.g., Toyota, Honda"
                value={values.vehicleMake}
                onChangeText={handleChange("vehicleMake")}
                error={
                  touched.vehicleMake && errors.vehicleMake
                    ? errors.vehicleMake
                    : undefined
                }
                autoCapitalize="words"
              />

              <Input
                label="Vehicle Model"
                placeholder="E.g., Corolla, Civic"
                value={values.vehicleModel}
                onChangeText={handleChange("vehicleModel")}
                error={
                  touched.vehicleModel && errors.vehicleModel
                    ? errors.vehicleModel
                    : undefined
                }
                autoCapitalize="words"
              />

          

              <Button
                title="Next"
                onPress={handleSubmit}
                disabled={!(isValid && dirty)}
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
