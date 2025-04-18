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
  left: 15px;
  background-color: ${(props) => props.theme.colors.primary || `#000`};
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
  color: ${(props) => props.theme.colors.background};
  margin-left: 8px;
`;

export const SmallText = styled(Text)`
  font-size: 12px;
  color: #fff;
`;

// Profile button in top right
export const ProfileButton = styled(TouchableOpacity)`
  position: absolute;
  top: ${Platform.OS === "ios" ? "50px" : "40px"};
  right: 15px;
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

export const ProfileImage = styled(Image)`
  width: 50px;
  height: 50px;
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
  background-color: ${(props) => props.theme.colors.primary || "#000"};
  border-radius: 30px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.3;
  shadow-radius: 5px;
  elevation: 6;
  overflow: hidden;
  align-items: center;
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
  align-items: center;
  justify-content: center;
  padding: 15px;
`;

export const OrderTimeDistance = styled(Text)`
  color: white;
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
  color: white;
  font-size: 16px;
  text-align: center;
`;

export const OrderAddressSubText = styled(Text)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  text-align: center;
`;

export const AcceptOrderButton = styled(TouchableOpacity)`
  background-color: ${(props) => props.theme.colors.secondary || "#f23f07"};
  margin: 15px;
  padding: 15px;
  border-radius: 8px;
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
  color: white;
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