import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import styled from 'styled-components/native';
import { useAuth } from './src/context/AuthContext';

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${ (props: { theme: { colors: { background: string } } }) => props.theme.colors.background };
`;

export default function Index() {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#00CC66" />
      </LoadingContainer>
    );
  }

  if (authState.isAuthenticated) {
    return <Redirect href="/(app)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}