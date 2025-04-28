import axios from 'axios';
import { API_BASE_URL } from '../context/types/api';

interface Restaurant {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category?: string;
  isOpen?: boolean;
  rating?: number;
}

// Mock restaurant data for testing
// The coordinates will be slightly offset from the driver's location
const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Burger King",
    coordinates: {
      latitude: 0,  // Will be dynamically set
      longitude: 0, // Will be dynamically set
    },
    category: "Fast Food",
    isOpen: true,
    rating: 4.2,
  },
  {
    id: "2",
    name: "Pizza Hut",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    category: "Italian",
    isOpen: true,
    rating: 4.0,
  },
  {
    id: "3",
    name: "Subway",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    category: "Sandwiches",
    isOpen: true,
    rating: 3.8,
  },
  {
    id: "4",
    name: "Taco Bell",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    category: "Mexican",
    isOpen: false,
    rating: 3.5,
  },
  {
    id: "5",
    name: "Starbucks",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    category: "Coffee",
    isOpen: true,
    rating: 4.5,
  },
  {
    id: "6",
    name: "McDonald's",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    category: "Fast Food",
    isOpen: true,
    rating: 3.9,
  },
  {
    id: "7",
    name: "KFC",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    category: "Chicken",
    isOpen: true,
    rating: 3.7,
  },
];

/**
 * Fetch nearby restaurants based on driver location
 * @param latitude Driver's current latitude
 * @param longitude Driver's current longitude
 * @param radius Search radius in meters
 * @returns Array of nearby restaurants
 */
export const fetchNearbyRestaurants = async (
  latitude: number, 
  longitude: number,
  radius: number = 5000
): Promise<Restaurant[]> => {
  try {
    // Try to fetch from real API
    const response = await axios.get(`${API_BASE_URL}/restaurants/nearby`, {
      params: {
        latitude,
        longitude,
        radius
      }
    });
    
    return response.data.restaurants;
  } catch (error) {
    console.log('Using mock restaurant data for testing');
    
    // Generate mock restaurants with coordinates near the driver's location
    const mockData = MOCK_RESTAURANTS.map((restaurant, index) => {
      // Generate a random offset between -0.01 and 0.01 (roughly ~1km)
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lngOffset = (Math.random() - 0.5) * 0.02;
      
      return {
        ...restaurant,
        coordinates: {
          latitude: latitude + latOffset,
          longitude: longitude + lngOffset,
        }
      };
    });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return mockData;
  }
};

/**
 * Get restaurant details
 * @param restaurantId Restaurant ID
 * @returns Restaurant details
 */
export const getRestaurantDetails = async (restaurantId: string): Promise<Restaurant> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/restaurants/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.log('Using mock restaurant details for testing');
    
    // Find the restaurant in mock data or create a default one
    const mockRestaurant = MOCK_RESTAURANTS.find(r => r.id === restaurantId) || {
      id: restaurantId,
      name: `Restaurant ${restaurantId}`,
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
      category: "Restaurant",
      isOpen: true,
      rating: 4.0,
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockRestaurant;
  }
};

// Add these convenient functions for testing

/**
 * Get a random selection of mock restaurants
 * @param count Number of restaurants to return
 * @returns Array of mock restaurants
 */
export const getRandomMockRestaurants = (count: number = 5): Restaurant[] => {
  // Shuffle the array and take the requested number of items
  return [...MOCK_RESTAURANTS]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, MOCK_RESTAURANTS.length));
};

/**
 * Generate mock restaurants around a specific location
 * @param latitude Center latitude
 * @param longitude Center longitude
 * @param count Number of restaurants to generate
 * @param maxDistance Maximum distance in kilometers
 * @returns Array of mock restaurants
 */
export const generateMockRestaurantsNearLocation = (
  latitude: number,
  longitude: number,
  count: number = 5,
  maxDistance: number = 2
): Restaurant[] => {
  const restaurants: Restaurant[] = [];
  
  for (let i = 0; i < count; i++) {
    // Convert maxDistance km to rough degrees (very approximate)
    const degreeOffset = maxDistance / 111;
    
    // Generate random offset within the maxDistance
    const latOffset = (Math.random() - 0.5) * 2 * degreeOffset;
    const lngOffset = (Math.random() - 0.5) * 2 * degreeOffset;
    
    // Use one of our mock restaurants as a template
    const template = MOCK_RESTAURANTS[i % MOCK_RESTAURANTS.length];
    
    restaurants.push({
      ...template,
      id: `generated-${i}`,
      coordinates: {
        latitude: latitude + latOffset,
        longitude: longitude + lngOffset,
      }
    });
  }
  
  return restaurants;
};