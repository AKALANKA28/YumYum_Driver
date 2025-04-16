import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  SafeAreaView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import styled from "styled-components/native";
import * as FileSystem from "expo-file-system";

import { useAuth } from "../src/context/AuthContext";
import Button from "../src/components/common/Button";
import DocumentUploader from "../src/components/common/DocumentUploader";
import {
  DocumentType,
  DocumentUploadMetadata,
  RegistrationRequest,
} from "../src/context/types/auth";

const SafeArea = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const ContentContainer = styled(View)`
  flex: 1;
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

const ButtonContainer = styled(View)`
  padding-horizontal: ${(props) => props.theme.spacing.lg}px;
  padding-bottom: ${(props) => props.theme.spacing.lg}px;
  padding-top: ${(props) => props.theme.spacing.md}px;
`;

// Form validation schema
const DocumentUploadSchema = Yup.object().shape({
  driversLicense: Yup.string().required("Driver's license photo is required"),
  vehicleRegistration: Yup.string().required(
    "Vehicle registration photo is required"
  ),
  profilePhoto: Yup.string().required("Profile photo is required"),
});

export default function DocumentUploadScreen() {
  const params = useLocalSearchParams();
  const vehicleInfoString = params.vehicleInfo as string;
  const personalInfoString = params.personalInfo as string;

  const vehicleInfo = JSON.parse(vehicleInfoString || "{}");
  const personalInfo = JSON.parse(personalInfoString || "{}");

  const { registerDriver, authState, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Store document values
  const [documentValues, setDocumentValues] = useState({
    driversLicense: "",
    vehicleRegistration: "",
    profilePhoto: "",
    vehicleInsurance: "", // Optional
  });

  // Function to convert image to base64
  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      console.log("Converting image to base64:", uri);

      // First check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error(`File does not exist: ${uri}`);
      }

      console.log(`File size: ${(fileInfo.size || 0) / 1024} KB`);

      // Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Verify we got actual data
      if (!base64 || base64.length < 100) {
        throw new Error(`Failed to get valid base64 data from: ${uri}`);
      }

      console.log(`Base64 data length: ${base64.length} characters`);

      return base64;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw error;
    }
  };

  const handleSubmitDocuments = async () => {
    try {
      // const checkImageSize = (uri: string, maxSizeMB: number = 5): Promise<boolean> => {
      //   return new Promise((resolve) => {
      //     FileSystem.getInfoAsync(uri)
      //       .then(fileInfo => {
      //         if (fileInfo.exists && fileInfo.size) {
      //           const sizeInMB = fileInfo.size / (1024 * 1024);
      //           console.log(`Image size: ${sizeInMB.toFixed(2)} MB`);
      //           if (sizeInMB > maxSizeMB) {
      //             console.warn(`Image too large: ${sizeInMB.toFixed(2)} MB (max: ${maxSizeMB} MB)`);
      //             resolve(false);
      //           } else {
      //             resolve(true);
      //           }
      //         } else {
      //           console.warn('File info not available');
      //           resolve(false);
      //         }
      //       })
      //       .catch(err => {
      //         console.error('Error getting file info:', err);
      //         resolve(false);
      //       });
      //   });
      // };

      // // Use this in your validation
      // const [profileSize, licenseSize, regSize, insuranceSize] = await Promise.all([
      //   checkImageSize(documentValues.profilePhoto, 1), // Max 1MB for profile
      //   checkImageSize(documentValues.driversLicense, 2), // Max 2MB for license
      //   checkImageSize(documentValues.vehicleRegistration, 2),
      //   checkImageSize(documentValues.vehicleInsurance, 2),
      // ]);

      // if (!profileSize || !licenseSize || !regSize || !insuranceSize) {
      //   setErrorMessage('One or more images are too large. Please use smaller images.');
      //   Alert.alert(
      //     "Image Size Issue",
      //     "One or more images are too large. Please resize your images to be smaller than 2MB each."
      //   );
      //   setIsSubmitting(false);
      //   return;
      // }

      // Validate required documents
      if (
        !documentValues.driversLicense ||
        !documentValues.vehicleRegistration ||
        !documentValues.profilePhoto ||
        !documentValues.vehicleInsurance
      ) {
        // Add vehicle insurance to required docs
        setErrorMessage("All document photos are required");
        Alert.alert(
          "Missing Documents",
          "Please upload all required documents including vehicle insurance"
        );
        return;
      }
      setIsSubmitting(true);
      setErrorMessage("");

      if (authState.error) {
        clearError();
      }

      console.log("Starting document upload with values:", documentValues);

      // Get current date for formatting timestamps
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setFullYear(futureDate.getFullYear() + 4); // License valid for 4 years

      // Format date as yyyy-MM-ddTHH:mm:ss for LocalDateTime
      const formatDate = (date: Date): string => {
        // Format to match Java's LocalDateTime
        const isoString = date.toISOString();
        return isoString.slice(0, 19); // Remove milliseconds and timezone
      };

      const expiryDateString = formatDate(futureDate);
      console.log("License expiry date:", expiryDateString);

      // Convert images to base64
      const [
        profilePhotoBase64,
        driversLicenseBase64,
        vehicleRegistrationBase64,
        vehicleInsuranceBase64,
      ] = await Promise.all([
        convertImageToBase64(documentValues.profilePhoto),
        convertImageToBase64(documentValues.driversLicense),
        convertImageToBase64(documentValues.vehicleRegistration),
        convertImageToBase64(documentValues.vehicleInsurance),
      ]);

      console.log("Successfully converted images to base64");

      // Check base64 lengths to verify they are actual data and not placeholders
      console.log("Profile photo base64 length:", profilePhotoBase64.length);
      console.log("License base64 length:", driversLicenseBase64.length);
      console.log(
        "Registration base64 length:",
        vehicleRegistrationBase64.length
      );
      console.log("Insurance base64 length:", vehicleInsuranceBase64.length);

      // IMPORTANT: Create documents object with proper format - NO data URL prefix
      const documents: { [key in DocumentType]?: DocumentUploadMetadata } = {
        [DocumentType.PROFILE_PHOTO]: {
          base64Image: profilePhotoBase64,
          fileName: "profile-photo.jpg",
          contentType: "image/jpeg",
        },
        [DocumentType.DRIVING_LICENSE]: {
          base64Image: driversLicenseBase64,
          fileName: "driving-license.jpg",
          contentType: "image/jpeg",
          expiryDate: expiryDateString,
        },
        [DocumentType.VEHICLE_REGISTRATION]: {
          base64Image: vehicleRegistrationBase64,
          fileName: "vehicle-registration.jpg",
          contentType: "image/jpeg",
        },
        [DocumentType.VEHICLE_INSURANCE]: {
          base64Image: vehicleInsuranceBase64,
          fileName: "vehicle-insurance.jpg",
          contentType: "image/jpeg",
          expiryDate: expiryDateString,
        },
      };

      // Create registration request with real document data
      const registrationRequest: RegistrationRequest = {
        username:
          personalInfo.firstName.toLowerCase() +
          personalInfo.lastName.toLowerCase(),
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        password: personalInfo.password,
        phoneNumber: personalInfo.phoneNumber,
        licenseNumber:
          personalInfo.licenseNumber ||
          `DL-${Math.floor(Math.random() * 1000000)}`,
        vehicleType: vehicleInfo.vehicleType,
        vehicleBrand: vehicleInfo.brand,
        vehicleModel: vehicleInfo.model,
        vehicleYear: vehicleInfo.year,
        licensePlate: vehicleInfo.licensePlate,
        vehicleColor: vehicleInfo.color,
        documents: documents, // Use the documents object with real base64 data
      };

      // SEPARATE logging payload - Create a deep copy first to avoid modifying the original
      const loggingPayload = JSON.parse(JSON.stringify(registrationRequest));

      // Replace base64 strings with placeholders IN THE COPY
      Object.keys(loggingPayload.documents).forEach((key) => {
        const docType = key as DocumentType;
        if (loggingPayload.documents[docType]) {
          loggingPayload.documents[docType].base64Image = "[BASE64_STRING]";
        }
      });

      console.log("Submitting registration with payload:");
      console.log(JSON.stringify(loggingPayload, null, 2));

      // Send the ORIGINAL registrationRequest with real base64 data
      await registerDriver(registrationRequest);

      console.log("Registration successful!");

      // If successful, navigate to success screen or dashboard
      router.replace("/login");
    } catch (error: any) {
      console.error("Registration error:", error);

      // Try to get more error details
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }

      setErrorMessage(
        error.message ||
          "There was an error submitting your documents. Please try again."
      );

      Alert.alert(
        "Registration Error",
        error.message ||
          "There was an error submitting your documents. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
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
        <ProgressStep active={true}>
          <ProgressStepText>2</ProgressStepText>
        </ProgressStep>
        <ProgressBar>
          <ProgressIndicator active={true} />
        </ProgressBar>
        <ProgressStep active={true}>
          <ProgressStepText>3</ProgressStepText>
        </ProgressStep>
      </ProgressContainer>
    );
  };

  return (
    <SafeArea>
      <Container
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ContentContainer>
          <ScrollContainer
            ref={scrollViewRef}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <HeaderContainer>
              <BackButton onPress={handleGoBack}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </BackButton>
              <HeaderTitle>Upload Documents</HeaderTitle>
            </HeaderContainer>

            {renderProgressBar()}

            <Title>Upload your documents</Title>
            <Subtitle>
              We need a few photos to verify your identity and vehicle
            </Subtitle>

            {(authState.error || errorMessage) && (
              <ErrorText>{authState.error || errorMessage}</ErrorText>
            )}

            {/* Using a simplified form approach instead of Formik for document uploaders */}
            <DocumentUploader
              title="Driver's License"
              description="Upload a clear photo of your driver's license (front side)"
              onImageSelected={(uri) => {
                setDocumentValues((prev) => ({ ...prev, driversLicense: uri }));
                // Scroll to next field after selecting an image
                setTimeout(scrollToBottom, 300);
              }}
              imageUri={documentValues.driversLicense}
              error={
                !documentValues.driversLicense && errorMessage
                  ? "Driver's license photo is required"
                  : undefined
              }
            />

            <DocumentUploader
              title="Vehicle Registration"
              description="Upload a clear photo of your vehicle registration document"
              onImageSelected={(uri) => {
                setDocumentValues((prev) => ({
                  ...prev,
                  vehicleRegistration: uri,
                }));
                // Scroll to next field after selecting an image
                setTimeout(scrollToBottom, 300);
              }}
              imageUri={documentValues.vehicleRegistration}
              error={
                !documentValues.vehicleRegistration && errorMessage
                  ? "Vehicle registration photo is required"
                  : undefined
              }
            />

            <DocumentUploader
              title="Vehicle Insurance"
              description="Upload a clear photo of your valid vehicle insurance document"
              onImageSelected={(uri) => {
                setDocumentValues((prev) => ({
                  ...prev,
                  vehicleInsurance: uri,
                }));
                setTimeout(scrollToBottom, 300);
              }}
              imageUri={documentValues.vehicleInsurance}
              error={
                !documentValues.vehicleInsurance && errorMessage
                  ? "Vehicle insurance is required"
                  : undefined
              }
            />

            <DocumentUploader
              title="Profile Photo"
              description="Upload a clear photo of yourself (will be shown to customers)"
              onImageSelected={(uri) => {
                setDocumentValues((prev) => ({ ...prev, profilePhoto: uri }));
                // Scroll to button after selecting an image
                setTimeout(scrollToBottom, 300);
              }}
              imageUri={documentValues.profilePhoto}
              error={
                !documentValues.profilePhoto && errorMessage
                  ? "Profile photo is required"
                  : undefined
              }
            />

            <View style={{ height: 80 }} />
          </ScrollContainer>

          <ButtonContainer>
            <Button
              title={isSubmitting ? "Submitting..." : "Submit for Approval"}
              onPress={handleSubmitDocuments}
              disabled={
                !(
                  (
                    documentValues.driversLicense &&
                    documentValues.vehicleRegistration &&
                    documentValues.profilePhoto &&
                    documentValues.vehicleInsurance
                  ) // Add this check
                ) || isSubmitting
              }
              loading={isSubmitting}
              fullWidth
            />
          </ButtonContainer>
        </ContentContainer>
      </Container>
    </SafeArea>
  );
}
