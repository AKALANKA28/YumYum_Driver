import React from 'react';
import { Animated } from 'react-native';
import { useDriverContext } from '../../context/DriverContext';
import { ExpandableButtonContainer } from './styles';
import FindingOrdersButton from './FindingOrderButton';
import GoOnlineButton from './GoOnlineButton';
import OrderDetails from './OrderDetails';

const OrderButton = () => {
  const { 
    isFindingOrders, 
    showingOrderDetails,
    buttonWidth, 
    buttonHeight, 
    buttonLeft, 
    buttonBottom,
    buttonBorderRadius,
    contentOpacity,
    orderDetailsOpacity 
  } = useDriverContext();

  return (
    <ExpandableButtonContainer
      style={{
        width: buttonWidth,
        height: buttonHeight,
        // left: buttonLeft,
        bottom: buttonBottom,
        borderRadius: buttonBorderRadius,
      }}
    >
      {/* Button Content */}
      <Animated.View style={{ opacity: contentOpacity, width: "100%" }}>
        {isFindingOrders ? (
          <FindingOrdersButton />
        ) : !showingOrderDetails ? (
          <GoOnlineButton />
        ) : null}
      </Animated.View>

      {/* Order Details Content (conditionally rendered) */}
      {showingOrderDetails && (
        <OrderDetails opacity={orderDetailsOpacity} />
      )}
    </ExpandableButtonContainer>
  );
};

export default OrderButton;