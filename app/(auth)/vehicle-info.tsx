import React, { useState } from "react";
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

const DropdownLabel = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.medium}px;
  font-weight: ${(props) => props.theme.fontWeights.medium};
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.xs}px;
`;

const DropdownContainer = styled(View)`
  margin-bottom: ${(props) => props.theme.spacing.md}px;
  z-index: 1000;
`;

const ErrorText = styled(Text)`
  font-size: ${(props) => props.theme.fontSizes.small}px;
  color: ${(props) => props.theme.colors.error};
  margin-top: ${(props) => props.theme.spacing.xs}px;
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

const vehicleTypeOptions = [
  { label: "Car", value: "CAR" },
  { label: "Motorcycle", value: "MOTORCYCLE" },
  { label: "Scooter", value: "SCOOTER" },
  { label: "Bicycle", value: "BICYCLE" },
];

export default function VehicleInfoScreen() {
  const params = useLocalSearchParams();
  const personalInfoString = params.personalInfo as string;
  const personalInfo = JSON.parse(personalInfoString);

  const { authState } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSubmitVehicleInfo = async (values: any) => {
    try {
      // Create vehicle details object in the format expected by API
      const vehicleDetails = {
        brand: values.vehicleMake,
        model: values.vehicleModel,
        year: parseInt(values.vehicleYear),
        licensePlate: values.licensePlate,
        color: "White", // Default or add color field to form
        vehicleType: values.vehicleType,
      };

      // Navigate to document upload screen with both data pieces
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
          initialValues={{
            vehicleType: "",
            licensePlate: "",
            vehicleMake: "",
            vehicleModel: "",
            vehicleYear: "",
          }}
          validationSchema={VehicleInfoSchema}
          onSubmit={handleSubmitVehicleInfo}
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
              <DropdownContainer>
                <DropdownLabel>Vehicle Type</DropdownLabel>
                <DropDownPicker
                  open={open}
                  value={values.vehicleType}
                  items={vehicleTypeOptions}
                  setOpen={setOpen}
                  setValue={(value) => {
                    setFieldValue("vehicleType", value());
                  }}
                  style={{
                    borderColor:
                      touched.vehicleType && errors.vehicleType
                        ? "#E50914"
                        : "#E0E0E0",
                    borderRadius: 8,
                    backgroundColor: "#F5F5F5",
                  }}
                  dropDownContainerStyle={{
                    borderColor: "#E0E0E0",
                    borderRadius: 8,
                  }}
                  placeholder="Select your vehicle type"
                />
                {touched.vehicleType && errors.vehicleType && (
                  <ErrorText>{errors.vehicleType}</ErrorText>
                )}
              </DropdownContainer>

              <Input
                label="License Plate Number"
                placeholder="Enter license plate"
                value={values.licensePlate}
                onChangeText={handleChange("licensePlate")}
                error={
                  touched.licensePlate && errors.licensePlate
                    ? errors.licensePlate
                    : undefined
                }
                autoCapitalize="characters"
              />

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
