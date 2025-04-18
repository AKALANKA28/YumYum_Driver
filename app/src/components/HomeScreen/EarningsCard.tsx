import React from 'react';
import { useDriverContext } from '../../context/DriverContext';
import { 
  EarningsCard, 
  CurrencyText, 
  EarningsText, 
  SmallText 
} from './styles';

const EarningsCardComponent = () => {
  const { currency, earnings } = useDriverContext();
  
  return (
    <EarningsCard>
      <CurrencyText>{currency}</CurrencyText>
      <EarningsText>{earnings}</EarningsText>
      <SmallText> today</SmallText>
    </EarningsCard>
  );
};

export default EarningsCardComponent;