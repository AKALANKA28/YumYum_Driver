import api, { Restaurant } from "../context/types/api";

/**
 * Fetch all verified restaurants
 * @returns Array of restaurants
 */
export const fetchNearbyRestaurants = async (): Promise<Restaurant[]> => {
  return await api.restaurants.getNearby();
};

/**
 * Get restaurant details
 * @param restaurantId Restaurant ID
 * @returns Restaurant details
 */
export const getRestaurantDetails = async (
  restaurantId: string
): Promise<Restaurant> => {
  return await api.restaurants.getDetails(restaurantId);
};
