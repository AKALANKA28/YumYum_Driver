import React, { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { useLoading } from "./context/LoadingContext";

export default function Index() {
  const { authState } = useAuth();
  const { logLoadingState } = useLoading();

  // Track auth loading state
  useEffect(() => {
    logLoadingState('auth', authState.isLoading);
  }, [authState.isLoading, logLoadingState]);

  // Use router for navigation when auth state changes
  useEffect(() => {
    if (!authState.isLoading) {
      // Only navigate when auth loading is complete
      if (authState.isAuthenticated && authState.driver) {
        // Use setTimeout to ensure this happens in the next event loop cycle
        setTimeout(() => {
          router.replace("/(app)/home");
        }, 100);
      } else {
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 100);
      }
    }
  }, [authState.isLoading, authState.isAuthenticated, authState.driver]);

  // Return empty fragment - splash screen is managed by SplashManager
  return null;
}