import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StatusBar, 
  ScrollView, Dimensions, FlatList 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
// import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const Container = styled(View)`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const Header = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: ${props => props.theme.spacing.lg}px;
  background-color: ${props => props.theme.colors.primary};
`;

const BackButton = styled(TouchableOpacity)`
  padding: ${props => props.theme.spacing.sm}px;
`;

const HeaderTitle = styled(Text)`
  color: white;
  font-size: ${props => props.theme.fontSizes.large}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-left: ${props => props.theme.spacing.md}px;
`;

const TabsContainer = styled(View)`
  flex-direction: row;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const TabButton = styled(TouchableOpacity)<{ active: boolean }>`
  padding-vertical: ${props => props.theme.spacing.md}px;
  padding-horizontal: ${props => props.theme.spacing.lg}px;
  border-bottom-width: 2px;
  border-bottom-color: ${props => 
    props.active ? props.theme.colors.primary : 'transparent'
  };
  flex: 1;
  align-items: center;
`;

const TabText = styled(Text)<{ active: boolean }>`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => 
    props.active ? props.theme.fontWeights.bold : props.theme.fontWeights.medium
  };
  color: ${props => 
    props.active ? props.theme.colors.primary : props.theme.colors.lightText
  };
`;

const SummaryCard = styled(View)`
  background-color: white;
  margin: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.medium}px;
  padding: ${props => props.theme.spacing.lg}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const SummaryHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const SummaryTitle = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
`;

const SummaryAmount = styled(Text)`
  font-size: ${props => props.theme.fontSizes.xlarge}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin-top: ${props => props.theme.spacing.sm}px;
`;

const StatsContainer = styled(View)`
  flex-direction: row;
  margin-top: ${props => props.theme.spacing.md}px;
  padding-top: ${props => props.theme.spacing.md}px;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border};
`;

const StatItem = styled(View)`
  flex: 1;
`;

const StatValue = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
`;

const StatLabel = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.lightText};
  margin-top: 2px;
`;

const ChartContainer = styled(View)`
  background-color: white;
  margin: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.medium}px;
  padding: ${props => props.theme.spacing.md}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

const ChartTitle = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const SectionTitle = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  margin: ${props => props.theme.spacing.lg}px ${props => props.theme.spacing.md}px;
`;

const TransactionCard = styled(View)`
  background-color: white;
  margin-horizontal: ${props => props.theme.spacing.md}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.medium}px;
  padding: ${props => props.theme.spacing.md}px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  elevation: 2;
`;

const TransactionHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm}px;
`;

const TransactionTitle = styled(Text)`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const TransactionAmount = styled(Text)<{ isPositive: boolean }>`
  font-size: ${props => props.theme.fontSizes.medium}px;
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.isPositive ? props.theme.colors.success : props.theme.colors.error};
`;

const TransactionDetails = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const TransactionTime = styled(Text)`
  font-size: ${props => props.theme.fontSizes.small}px;
  color: ${props => props.theme.colors.lightText};
`;

// Mock data for earnings
const weeklyData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      data: [65.50, 89.25, 72.80, 94.10, 120.75, 145.50, 115.25],
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      strokeWidth: 2
    }
  ]
};

const monthlyData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      data: [420.75, 515.90, 480.25, 560.50],
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      strokeWidth: 2
    }
  ]
};

// Mock data for transactions
const transactions = [
  {
    id: '1',
    title: 'Delivery Earnings',
    description: 'Order #UE-8471',
    amount: '+$12.50',
    time: 'Today, 10:45 AM',
    isPositive: true
  },
  {
    id: '2',
    title: 'Delivery Earnings',
    description: 'Order #UE-8465',
    amount: '+$18.75',
    time: 'Today, 9:30 AM',
    isPositive: true
  },
  {
    id: '3',
    title: 'Tip',
    description: 'Order #UE-8465',
    amount: '+$5.00',
    time: 'Today, 9:45 AM',
    isPositive: true
  },
  {
    id: '4',
    title: 'Weekly Bonus',
    description: 'Completed 20 deliveries',
    amount: '+$25.00',
    time: 'Yesterday, 11:59 PM',
    isPositive: true
  },
  {
    id: '5',
    title: 'Delivery Earnings',
    description: 'Order #UE-8450',
    amount: '+$15.25',
    time: 'Yesterday, 7:15 PM',
    isPositive: true
  },
  {
    id: '6',
    title: 'Instant Cashout Fee',
    description: 'Transfer to Bank ****4589',
    amount: '-$0.50',
    time: 'Yesterday, 8:30 PM',
    isPositive: false
  },
];

const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#000000'
    }
  };
  
  export default function EarningsScreen() {
    const [activeTab, setActiveTab] = useState('weekly');
    
    const handleBack = () => {
      router.back();
    };
    
    return (
      <Container>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        <Header>
          <BackButton onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </BackButton>
          <HeaderTitle>Earnings</HeaderTitle>
        </Header>
        
        <TabsContainer>
          <TabButton 
            active={activeTab === 'weekly'} 
            onPress={() => setActiveTab('weekly')}
          >
            <TabText active={activeTab === 'weekly'}>Weekly</TabText>
          </TabButton>
          
          <TabButton 
            active={activeTab === 'monthly'} 
            onPress={() => setActiveTab('monthly')}
          >
            <TabText active={activeTab === 'monthly'}>Monthly</TabText>
          </TabButton>
        </TabsContainer>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <SummaryCard>
            <SummaryHeader>
              <SummaryTitle>
                {activeTab === 'weekly' ? 'This Week' : 'This Month'}
              </SummaryTitle>
              <TouchableOpacity>
                <Ionicons name="help-circle-outline" size={24} color="#666" />
              </TouchableOpacity>
            </SummaryHeader>
            
            <SummaryAmount>
              {activeTab === 'weekly' ? '$703.15' : '$1,977.40'}
            </SummaryAmount>
            
            <StatsContainer>
              <StatItem>
                <StatValue>
                  {activeTab === 'weekly' ? '35' : '112'}
                </StatValue>
                <StatLabel>Trips</StatLabel>
              </StatItem>
              
              <StatItem>
                <StatValue>
                  {activeTab === 'weekly' ? '25.5' : '84.2'}
                </StatValue>
                <StatLabel>Hours</StatLabel>
              </StatItem>
              
              <StatItem>
                <StatValue>
                  {activeTab === 'weekly' ? '$27.57' : '$23.48'}
                </StatValue>
                <StatLabel>Per Hour</StatLabel>
              </StatItem>
            </StatsContainer>
          </SummaryCard>
          
          <ChartContainer>
            <ChartTitle>
              {activeTab === 'weekly' ? 'Daily Earnings' : 'Weekly Earnings'}
            </ChartTitle>
            
            {/* <LineChart
              data={activeTab === 'weekly' ? weeklyData : monthlyData}
              width={width - 50}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            /> */}
          </ChartContainer>
          
          <SectionTitle>Recent Transactions</SectionTitle>
          
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id}>
              <TransactionHeader>
                <TransactionTitle>{transaction.title}</TransactionTitle>
                <TransactionAmount isPositive={transaction.isPositive}>
                  {transaction.amount}
                </TransactionAmount>
              </TransactionHeader>
              
              <TransactionDetails>
                <Ionicons 
                  name={transaction.isPositive ? "arrow-up-circle-outline" : "arrow-down-circle-outline"} 
                  size={16} 
                  color={transaction.isPositive ? "#00CC66" : "#E50914"} 
                  style={{ marginRight: 5 }} 
                />
                <TransactionTime>{transaction.description} • {transaction.time}</TransactionTime>
              </TransactionDetails>
            </TransactionCard>
          ))}
        </ScrollView>
      </Container>
    );
  }