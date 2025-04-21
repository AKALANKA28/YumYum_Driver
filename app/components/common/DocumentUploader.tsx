import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styled from 'styled-components/native';

// Styled components
const Container = styled(View)`
  margin-bottom: ${props => props.theme.spacing.lg}px;
`;

const Title = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs}px;
`;

const Description = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.lightText};
  margin-bottom: ${props => props.theme.spacing.sm}px;
`;

const UploadButton = styled(TouchableOpacity)`
  border-width: 1px;
  border-color: ${props => props.theme.colors.border};
  border-style: dashed;
  border-radius: 8px;
  padding: ${props => props.theme.spacing.lg}px;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.cardBackground};
  height: 150px;
`;

const UploadText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.primary};
  margin-top: ${props => props.theme.spacing.sm}px;
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const ImagePreview = styled(Image)`
  width: 100%;
  height: 150px;
  border-radius: 8px;
`;

const ErrorText = styled(Text)`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.fontSizes.small}px;
  margin-top: ${props => props.theme.spacing.xs}px;
`;

const OptionsContainer = styled(View)`
  flex-direction: row;
  justify-content: space-around;
  margin-top: ${props => props.theme.spacing.sm}px;
`;

const OptionButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: ${props => props.theme.spacing.sm}px;
`;

const OptionText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.primary};
  margin-left: ${props => props.theme.spacing.xs}px;
`;

interface DocumentUploaderProps {
  title: string;
  description: string;
  onImageSelected: (uri: string) => void;
  imageUri: string;
  error?: string;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  title,
  description,
  onImageSelected,
  imageUri,
  error,
}) => {
  const [uploading, setUploading] = useState(false);

  // Request permission function
  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to make this work!',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    }
    return true;
  };

  // Take a photo using camera
  const takePhoto = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'We need camera permissions to take photos',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setUploading(true);
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      setUploading(false);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setUploading(false);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Pick an image from library
  const pickImage = async () => {
    try {
      const hasPermission = await requestPermission();
      
      if (!hasPermission) return;
      
      setUploading(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      setUploading(false);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setUploading(false);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Show options dialog for camera/gallery
  const handleUpload = () => {
    if (imageUri) {
      // If image already selected, show options to replace
      Alert.alert(
        'Replace Image',
        'Would you like to replace the current image?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Gallery', onPress: pickImage },
        ]
      );
    } else {
      // If no image selected, show options to select
      Alert.alert(
        'Upload Document',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Gallery', onPress: pickImage },
        ]
      );
    }
  };

  return (
    <Container>
      <Title>{title}</Title>
      <Description>{description}</Description>
      
      {imageUri ? (
        <TouchableOpacity onPress={handleUpload}>
          <ImagePreview source={{ uri: imageUri }} resizeMode="cover" />
          
          <OptionsContainer>
            <OptionButton onPress={takePhoto}>
              <Ionicons name="camera" size={18} color="#0066CC" />
              <OptionText>Replace with Camera</OptionText>
            </OptionButton>
            
            <OptionButton onPress={pickImage}>
              <Ionicons name="images" size={18} color="#0066CC" />
              <OptionText>Replace from Gallery</OptionText>
            </OptionButton>
          </OptionsContainer>
        </TouchableOpacity>
      ) : (
        <UploadButton onPress={handleUpload} disabled={uploading}>
          <Ionicons name="cloud-upload" size={36} color="#0066CC" />
          <UploadText>
            {uploading ? 'Uploading...' : 'Tap to upload document'}
          </UploadText>
        </UploadButton>
      )}
      
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};

export default DocumentUploader;