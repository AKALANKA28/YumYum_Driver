import styled from 'styled-components/native';
import { Animated, View, Text, TouchableOpacity, Image, Platform } from 'react-native';

// Create animated versions of components
const AnimatedView = Animated.createAnimatedComponent(View);

// Container
export const Container = styled(View)`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

export const MapContainer = styled(View)`
  flex: 1;
`;

// Top floating card for earnings display
export const EarningsCard = styled(View)`
  position: absolute;
  top: ${Platform.OS === "ios" ? "50px" : "40px"};
  right: 15px;
  background-color: ${(props) => props.theme.colors.background || `#000`};
  padding: 12px 15px;
  border-radius: 20px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 5;
  flex-direction: row;
  align-items: center;
`;

export const CurrencyText = styled(Text)`
  font-size: 23px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.secondary};
  margin-left: 8px;
`;

export const EarningsText = styled(Text)`
  font-size: 23px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
  margin-left: 8px;
`;

export const SmallText = styled(Text)`
  font-size: 12px;
  color: ${(props) => props.theme.colors.text};
`;

// Profile container that holds the button and text
export const ProfileContainer = styled(View)`
  position: absolute;
  top: ${Platform.OS === "ios" ? "50px" : "40px"};
  left: 15px;
  flex-direction: row;
  align-items: center;
  z-index: 20;
`;

// Keep the existing ProfileButton but remove position absolute
export const ProfileButton = styled(TouchableOpacity)`
  background-color: white;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 5;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

// Keep the existing ProfileImage
export const ProfileImage = styled(Image)`
  width: 50px;
  height: 50px;
`;

// Add new styled components for the greeting text
export const GreetingText = styled(Text)`
  font-size:14px;
  color: ${props => props.theme.colors.lightText};
  font-weight: 600;
  margin-bottom: 5px;
  padding-horizontal: 12px;
`;

export const NameText = styled(Text)`
  font-size: 20px;
  color: ${props => props.theme.colors.text};
  font-weight: bold;
  padding-horizontal: 12px;
`;

// Online status indicator next to profile
export const OnlineStatusBadge = styled(View)<{ isOnline: boolean }>`
  position: absolute;
  top: ${Platform.OS === "ios" ? "80px" : "70px"};
  right: 12px;
  background-color: ${(props) => (props.isOnline ? "#00CC66" : "#E50914")};
  padding: 4px 4px;
  border-radius: 20px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 5;
  flex-direction: row;
  align-items: center;
`;

export const StatusText = styled(Text)`
  color: white;
  font-size: 12px;
  font-weight: bold;
  margin-left: 4px;
`;

// Button that expands to the order container
export const ExpandableButtonContainer = styled(AnimatedView)`
  position: absolute;
  background-color: ${(props) => props.theme.colors.background || "#000"};
  border-radius: 30px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.3;
  shadow-radius: 5px;
  elevation: 6;
  overflow: hidden;
  align-items: center;
  zIndex: 100
`;

// Fix the ButtonContent styled component
export const ButtonContent = styled(View)<{ isOnline: boolean }>`
  background-color: ${(props) =>
    props.isOnline
      ? props.theme.colors.primary || "#000"
      : props.theme.colors.secondary || "#f23f07"};
  width: 100%;
  height: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 15px;
`;

export const GoOnlineText = styled(Text)`
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-left: 8px;
`;

// Finding orders animation component
export const FindingOrdersContent = styled(View)`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.colors.primary || "#000"};
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  position: relative;
`;

export const ContentContainer = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const PulsingDot = styled(Animated.View)`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.colors.secondary || "#f23f07"};
  position: absolute;
  left: 15px;
  top: 50%;
  margin-top: -5px;
`;

export const FindingText = styled(Text)`
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

export const CloseButton = styled(TouchableOpacity)`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 15px;
  top: 50%;
  margin-top: -12px;
`;

// Order details components
export const OrderDetailsContent = styled(AnimatedView)`
  width: 100%;
  opacity: 0;
  overflow: hidden;
`;

export const OrderInfoRow = styled(View)`
  flex-direction: row;
  justify-content: flex-start;
`;

export const OrderTimeDistance = styled(Text)`
  color: black;
  font-size: 22px;
  font-weight: bold;
  text-align: center;
`;

export const OrderAddressContainer = styled(View)`
  padding: 10px 15px;
  border-top-width: 1px;
  border-top-color: rgba(255, 255, 255, 0.1);
`;

export const OrderAddressText = styled(Text)`
  color: black;
  font-size: 16px;
  text-align: center;
  font-weight: bold;
`;

export const OrderAddressSubText = styled(Text)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  text-align: center;
`;

export const AcceptOrderButton = styled(TouchableOpacity)`
  background-color: ${(props) => props.theme.colors.secondary || "#f23f07"};
  margin-vertical: 15px;
  padding: 18px;
  border-radius:20px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const AcceptOrderButtonText = styled(Text)`
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-left: 10px;
`;

// Timer components
export const TimerCircle = styled(TouchableOpacity)`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #333;
  align-items: center;
  justify-content: center;
  border: 2px solid ${(props) => props.theme.colors.secondary || "#f23f07"};
`;

export const TimerText = styled(Text)`
  color: black;
  font-size: 16px;
  font-weight: bold;
`;

// Loading container
export const LoadingContainer = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  justify-content: center;
  align-items: center;
`;