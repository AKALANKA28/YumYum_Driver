import api from "../../../context/types/api";
import {
  TripCreateDto,
  formatWaypointsForApi,
  TripStatusDto,
  convertServerWaypoint,
} from "./tripTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create a trip record
export const createTripRecord = async (
  tripData: TripCreateDto
): Promise<any> => {
  try {
    // Format waypoints according to the server's expected format
    const formattedTripData = {
      ...tripData,
      waypoints: formatWaypointsForApi(tripData.waypoints),
    };

    console.log(
      "Creating trip with formatted data:",
      JSON.stringify(formattedTripData)
    );

    const response = await api.tracking.createTrip(formattedTripData);
    return response.data;
  } catch (error) {
    // Store for retry later
    await storeFailedTripCreation(tripData);
    throw error;
  }
};

// Get trip status by order ID
export const getTripStatus = async (
  orderId: string
): Promise<TripStatusDto> => {
  try {
    const response = await api.tracking.getTripStatus(orderId);
    return response.data;
  } catch (error) {
    console.error(`Failed to get trip status for order ${orderId}:`, error);
    throw error;
  }
};

// Update trip status (pickup, delivered)
export const updateTripStatus = async (
  orderId: string,
  status: "pickup" | "delivered"
): Promise<void> => {
  try {
    if (status === "pickup") {
      await api.orders.pickup(orderId);
    } else {
      await api.orders.complete(orderId);
    }
  } catch (error) {
    console.error(`Error updating trip status to ${status}:`, error);
    throw error;
  }
};

// Store failed trip creation for retry
const storeFailedTripCreation = async (
  tripData: TripCreateDto
): Promise<void> => {
  try {
    const key = "failed_trip_creations";
    const storedDataJson = await AsyncStorage.getItem(key);
    const storedData = storedDataJson ? JSON.parse(storedDataJson) : [];

    storedData.push({
      tripData,
      timestamp: new Date().toISOString(),
    });

    // Keep only the most recent 10 trip creation attempts
    const trimmedData = storedData.slice(-10);

    await AsyncStorage.setItem(key, JSON.stringify(trimmedData));
    console.log("Trip creation stored for later retry");
  } catch (error) {
    console.error("Error storing trip creation:", error);
  }
};

// Retry failed trip creations
export const retryFailedTripCreations = async (): Promise<{
  success: number;
  failed: number;
}> => {
  try {
    const key = "failed_trip_creations";
    const storedDataJson = await AsyncStorage.getItem(key);

    if (!storedDataJson) {
      return { success: 0, failed: 0 };
    }

    const storedData = JSON.parse(storedDataJson);

    if (storedData.length === 0) {
      return { success: 0, failed: 0 };
    }

    let successCount = 0;
    let failedCount = 0;
    const remainingData = [];

    for (const item of storedData) {
      try {
        await createTripRecord(item.tripData);
        successCount++;
      } catch (error) {
        failedCount++;

        // Keep attempts that are less than 24 hours old
        const creationTime = new Date(item.timestamp).getTime();
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

        if (creationTime > oneDayAgo) {
          remainingData.push(item);
        }
      }
    }

    await AsyncStorage.setItem(key, JSON.stringify(remainingData));

    return {
      success: successCount,
      failed: failedCount,
    };
  } catch (error) {
    console.error("Error retrying trip creations:", error);
    return { success: 0, failed: 0 };
  }
};
