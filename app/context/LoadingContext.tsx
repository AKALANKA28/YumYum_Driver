import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  logLoadingState: (source: string, state: boolean) => void;
  loadingStates: Record<string, boolean>; // Add this line
};

// Create a global status tracker outside the component
const loadingSources: Record<string, boolean> = {
  auth: true,
  map: true,
  home: true,
};

const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  setIsLoading: () => {},
  logLoadingState: () => {},
  loadingStates: loadingSources, // Add this line
});

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const updatingRef = useRef(false);
  
  // Check and update global loading state
  const updateLoadingState = () => {
    if (updatingRef.current) return;
    
    updatingRef.current = true;
    
    // App is only considered loaded when ALL sources are done loading
    const anyLoading = Object.values(loadingSources).some(v => v === true);
    console.log("LoadingContext: Loading sources status:", loadingSources);
    console.log("LoadingContext: Any loading:", anyLoading);
    
    // Only update if the state needs to change
    if (isLoading !== anyLoading) {
      console.log("LoadingContext: Updating global loading state to", anyLoading);
      setIsLoading(anyLoading);
    }
    
    updatingRef.current = false;
  };
  
  // Log loading state changes for debugging
  const logLoadingState = (source: string, state: boolean) => {
    // Only log if the state actually changes
    if (loadingSources[source] !== state) {
      loadingSources[source] = state;
      updateLoadingState();
    }
  };
  
  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setIsLoading, 
      logLoadingState,
      loadingStates: loadingSources // Add this line
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};