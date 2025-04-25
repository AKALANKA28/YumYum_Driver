import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from "react-native";
import styled from "styled-components/native";
import { Theme } from "../../theme"; // Assuming you have a theme type defined

// Define proper TypeScript interfaces
interface VehicleOptionContainerProps {
  isSelected: boolean;
}

// Define proper vehicle option type
interface VehicleOption {
  label: string;
  value: string;
  description: string;
  image: any; // Consider using a more specific type if possible
  imageStyle: ImageStyle;
}

interface VehicleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// Simplify styled components by leveraging TypeScript's type inference
const VehicleOptionContainer = styled(TouchableOpacity)<VehicleOptionContainerProps>`
  flex-direction: row;
  align-items: center;
  padding: ${props => props.theme.spacing.md}px;
  background-color: ${props => 
    props.isSelected ? props.theme.colors.secondaryLight : props.theme.colors.cardBackground};
  border-radius: 12px;
  margin-bottom: ${props => props.theme.spacing.md}px;
  border-width: 1px;
  border-color: ${props => 
    props.isSelected ? props.theme.colors.secondary : props.theme.colors.border};
  height: 100px;
  overflow: hidden;
`;

const VehicleInfo = styled(View)`
  flex: 1;
  margin-right: ${props => props.theme.spacing.md}px;
`;

const VehicleTitle = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs}px;
`;

const VehicleDescription = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.lightText};
`;

const ImageContainer = styled(View)`
  width: 110px;
  height: 80px;
  justify-content: center;
  align-items: center; /* Center alignment as a default */
  position: relative;
`;

const ErrorText = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.error};
  margin-top: ${props => props.theme.spacing.xs}px;
`;

// Define the vehicle options outside the component to avoid re-creation on each render
const vehicleOptions: VehicleOption[] = [
  {
    label: "Motorcycle",
    value: "MOTORCYCLE",
    description: "Great for medium-sized deliveries and faster navigation",
    image: require("../../../assets/images/motorcycle.png"),
    imageStyle: { width: 150, height: 130, transform: [{ translateY: 5 }, { translateX: 22 }] },
  },
  {
    label: "Scooter",
    value: "SCOOTER",
    description: "Ideal for city deliveries and easy parking",
    image: require("../../../assets/images/scooter.png"),
    imageStyle: { width: 150, height: 140 },
  },
  {
    label: "Bicycle",
    value: "BICYCLE",
    description: "Eco-friendly option for small deliveries in urban areas",
    image: require("../../../assets/images/bicycle.png"),
    imageStyle: { width: 150, height: 180, transform: [{ translateX: 19 }] },
  },
];

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  // Use explicit type for the memoized render function
  const renderVehicleOption = React.useCallback((option: VehicleOption) => {
    const isSelected = value === option.value;
    
    return (
      <VehicleOptionContainer
        key={option.value}
        isSelected={isSelected}
        onPress={() => onChange(option.value)}
        activeOpacity={0.7}
        accessibilityLabel={`Select ${option.label} as your vehicle type`}
        accessibilityState={{ checked: isSelected }}
      >
        <VehicleInfo>
          <VehicleTitle>{option.label}</VehicleTitle>
          <VehicleDescription>{option.description}</VehicleDescription>
        </VehicleInfo>
        <ImageContainer>
          <Image 
            source={option.image} 
            resizeMode="contain" 
            style={option.imageStyle} 
            accessibilityLabel={`${option.label} image`}
          />
        </ImageContainer>
      </VehicleOptionContainer>
    );
  }, [value, onChange]);

  return (
    <View>
      {vehicleOptions.map(renderVehicleOption)}
      {error ? <ErrorText>{error}</ErrorText> : null}
    </View>
  );
};

export default React.memo(VehicleSelector);