import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDriverContext } from '../../context/DriverContext';
import { OnlineStatusBadge, StatusText } from './styles';

const OnlineStatusBadgeComponent = () => {
  const { isOnline } = useDriverContext();
  
  return (
    <OnlineStatusBadge isOnline={isOnline}>
      <Ionicons name="radio-button-on" size={12} color="white" />
      {/* <StatusText>Online</StatusText> */}
    </OnlineStatusBadge>
  );
};

export default OnlineStatusBadgeComponent;