import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { Alert } from "react-native";
import { OrderAssignmentNotification } from "../context/types/driver";
import NetInfo from "@react-native-community/netinfo";

export const createStompClient = (
  baseUrl: string, 
  driverId: string | number,
  onMessageReceived: (data: OrderAssignmentNotification) => void
) => {
  console.log(`Creating WebSocket connection to ${baseUrl}/ws for driver ${driverId}`);
  
  // Track connection state
  let isConnecting = false;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  let clientActive = false;
  
  // Create STOMP client with improved configuration
  const client: Client = new Client({
    // Use a factory function to create a new socket each time
    webSocketFactory: () => {
      console.log("Creating new SockJS instance");
      return new SockJS(`${baseUrl}/ws`, null, {
        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
        timeout: 30000,
      });
    },
    
    connectHeaders: {
      "accept-version": "1.2,1.1,1.0",
      "heart-beat": "10000,10000"
    },
    // debug: (msg) => console.log(`WebSocket: ${msg}`),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });

  // Configure client behavior
  client.onConnect = () => {
    console.log("STOMP client connected successfully!");
    clientActive = true;
    isConnecting = false;
    reconnectAttempts = 0;
    
    // Subscribe to the driver-specific topic
    const subscription = client.subscribe(
      `/queue/driver.${driverId}.assignments`,
      (message) => {
        console.log(`Received message: ${message.body}`);
        try {
          const orderData: OrderAssignmentNotification = JSON.parse(message.body);
          console.log("Parsed order assignment:", orderData);
          onMessageReceived(orderData);
        } catch (error) {
          console.error("Error parsing message:", error);
          Alert.alert("Error", "Unable to process incoming order data");
        }
      },
      { id: `driver-${driverId}-assignments` }
    );
    
    console.log(`Subscribed to /queue/driver.${driverId}.assignments`);
  };
  
  client.onStompError = (frame) => {
    console.error("STOMP protocol error:", frame.headers.message);
  };
  
  client.onWebSocketClose = () => {
    console.log("WebSocket connection closed");
    clientActive = false;
    isConnecting = false;
    
    // Controlled reconnection
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Reconnect attempt ${reconnectAttempts} of ${MAX_RECONNECT_ATTEMPTS}`);
      setTimeout(() => {
        if (!client.active && !isConnecting) {
          console.log("Attempting to reconnect after delay...");
          connectClient();
        }
      }, 5000);
    } else {
      console.log("Max reconnect attempts reached");
      Alert.alert(
        "Connection Lost",
        "Cannot connect to the server. Please try going offline and then online again.",
        [{ text: "OK" }]
      );
    }
  };
  
  client.onWebSocketError = (event) => {
    console.error("WebSocket error:", event);
  };

  // Function to handle controlled connection
  const connectClient = () => {
    try {
      if (!client.active && !isConnecting) {
        isConnecting = true;
        console.log("Activating client...");
        client.activate();
      } else {
        console.log(`Client already ${client.active ? 'active' : 'connecting'}, skipping activation`);
      }
    } catch (error) {
      console.error("Error activating client:", error);
      isConnecting = false;
    }
  };
  
  // Function to disconnect client
  const disconnectClient = () => {
    try {
      if (client.active) {
        console.log("Deactivating client...");
        client.deactivate();
      }
      clientActive = false;
      isConnecting = false;
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };
  
  // Start the initial connection
  connectClient();
  
  // Setup network monitoring for reconnection
  const unsubscribeNetInfo = NetInfo.addEventListener(state => {
    console.log(`Network state changed: ${state.isConnected ? 'connected' : 'disconnected'}`);
    if (state.isConnected && !client.active && !isConnecting) {
      console.log("Network reconnected, attempting to reconnect WebSocket");
      connectClient();
    }
  });
  
  return {
    client,
    disconnect: () => {
      unsubscribeNetInfo();
      disconnectClient();
    },
    reconnect: connectClient,
    isConnected: () => clientActive
  };
};