import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Container } from './styles';

interface ErrorViewProps {
  error: string;
}

const ErrorView = ({ error }: ErrorViewProps) => {
  return (
    <Container>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Ionicons name="alert-circle" size={60} color="#E50914" />
        <Text style={{ marginTop: 20, fontSize: 18, textAlign: "center" }}>
          {error}
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: "#E50914",
            padding: 15,
            borderRadius: 8,
            minWidth: 150,
            alignItems: "center",
          }}
          onPress={() => router.replace("/(app)/home")}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
};

export default ErrorView;