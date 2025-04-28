import { MAPBOX_ACCESS_TOKEN } from '../../constants/mapbox';

// Format coordinates for Mapbox Navigation
export const mapCoordinatesForNavigation = (
  origin: any, 
  destination: any,
  originName: string = "Origin",
  destinationName: string = "Destination"
) => {
  return [
    {
      name: originName,
      latitude: origin.latitude,
      longitude: origin.longitude,
    },
    {
      name: destinationName,
      latitude: destination.latitude,
      longitude: destination.longitude,
    }
  ];
};

// Fetch route from Mapbox Directions API
export const fetchRoute = async (
  origin: [number, number],
  destination: [number, number]
) => {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?alternatives=false&geometries=geojson&overview=full&steps=false&annotations=distance,duration&access_token=${MAPBOX_ACCESS_TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      return {
        coordinates: data.routes[0].geometry.coordinates,
        distance: data.routes[0].distance,
        duration: data.routes[0].duration
      };
    }
    
    throw new Error('No routes found');
  } catch (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
};

// Format distance for display
export const formatDistance = (meters: number): string => {
  if (!meters) return 'N/A';
  
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
};

// Format duration for display
export const formatDuration = (seconds: number): string => {
  if (!seconds) return 'N/A';
  
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)} min`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};