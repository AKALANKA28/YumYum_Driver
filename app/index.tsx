import { useEffect } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";
import styled from "styled-components/native";
import { useAuth } from "./context/AuthContext";

const LoadingContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.colors.background};
`;

export default function Index() {
  const { authState } = useAuth();

  // Debug info
  useEffect(() => {
    console.log("Root index auth state:", {
      isAuthenticated: authState.isAuthenticated,
      hasDriver: !!authState.driver,
      isLoading: authState.isLoading,
    });
  }, [authState]);

  // Show loading while checking auth status
  if (authState.isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#00CC66" />
        <Text>Loading...</Text>
      </LoadingContainer>
    );
  }

  // Redirect based on authentication status
  if (authState.isAuthenticated && authState.driver) {
    console.log("Redirecting to home");
    return <Redirect href="/(app)/home" />;
  } else {
    console.log("Redirecting to login");
    return <Redirect href="/(auth)/login" />;
  }
}
