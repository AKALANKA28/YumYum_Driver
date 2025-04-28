export interface Restaurant {
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

export interface RestaurantLocationsProps {
  restaurants: Restaurant[];
  isOnline: boolean;
  onMarkerPress?: (restaurant: Restaurant) => void;
}
