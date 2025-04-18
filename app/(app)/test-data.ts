import * as Location from "expo-location";

export interface TestOrder {
  id: string;
  pickupAddress: {
    location: {
      latitude: number;
      longitude: number;
    };
    addressName: string;
    addressDetails: string;
  };
  deliveryAddress: {
    location: {
      latitude: number;
      longitude: number;
    };
    addressName: string;
    addressDetails: string;
  };
  estimatedTime: string; // in minutes
  distance: string;      // in kilometers
  amount: string;        // order amount
  restaurantName: string;
}

/**
 * Generates test orders around a given location
 * @param currentLocation - The driver's current location
 * @param count - Number of test orders to generate
 * @returns Array of test orders
 */
export const generateTestOrders = (
  currentLocation: Location.LocationObject,
  count: number = 3
): TestOrder[] => {
  const orders: TestOrder[] = [];
  
  // Restaurant names in Middeniya/Southern Province area
  const restaurants = [
    "ආහාර කඩේ",
    "නිව් ෆුඩ් සිටි",
    "මේරියන් රෙස්ටුරන්ට්",
    "ප්‍රීති රෙස්ටුරන්ට්",
    "ගමේ කඩේ",
    "තංගල්ල බේකරි",
    "කටුවන රෙස්ටුරන්ට්",
    "කුමාර හෝටලය",
    "සුමිත් කැන්ටින්",
    "සුරංග ඩේල් ෆුඩ්"
  ];
  
  // Common street names and areas in Middeniya/Walipitiya area
  const streetNames = [
    "මිද්දෙනිය පාර",
    "තංගල්ල පාර",
    "වාලපිටිය පාර",
    "හම්බන්තොට පාර",
    "නොනාගම පාර",
    "අම්බලන්තොට පාර",
    "මැදමුලන පාර",
    "කටුවන පාර",
    "මාතර පාර",
    "ගාල්ල පාර"
  ];
  
  // Common areas in the Middeniya region
  const areas = [
    "මිද්දෙනිය",
    "වාලපිටිය",
    "අම්බලන්තොට",
    "කටුවන",
    "තිස්සමහාරාම",
    "අඟුණකොළපැලැස්ස",
    "සූරියවැව",
    "අම්බලන්තොට",
    "තංගල්ල",
    "හබරාදූව"
  ];

  for (let i = 0; i < count; i++) {
    // Generate random offset for pickup (restaurant) location
    // This will place the restaurant within ~1-2km of driver's position
    const pickupLatOffset = (Math.random() * 0.01) * (Math.random() > 0.5 ? 1 : -1);
    const pickupLngOffset = (Math.random() * 0.01) * (Math.random() > 0.5 ? 1 : -1);
    
    // Generate random offset for delivery location
    // This places delivery location ~0.5-1.5km from restaurant
    const deliveryLatOffset = (Math.random() * 0.008) * (Math.random() > 0.5 ? 1 : -1);
    const deliveryLngOffset = (Math.random() * 0.008) * (Math.random() > 0.5 ? 1 : -1);
    
    // Calculate locations
    const pickupLocation = {
      latitude: currentLocation.coords.latitude + pickupLatOffset,
      longitude: currentLocation.coords.longitude + pickupLngOffset
    };
    
    const deliveryLocation = {
      latitude: pickupLocation.latitude + deliveryLatOffset,
      longitude: pickupLocation.longitude + deliveryLngOffset
    };
    
    // Calculate distance
    const distance = calculateDistance(
      pickupLocation.latitude, 
      pickupLocation.longitude,
      deliveryLocation.latitude,
      deliveryLocation.longitude
    );
    
    // Calculate time (approximately 1km = 3-4 mins)
    const time = Math.round(distance * (3 + Math.random()));
    
    // Generate order amount (LKR 200-800 more typical for rural areas)
    const amount = Math.floor(200 + Math.random() * 600);
    
    // Create order object
    const order: TestOrder = {
      id: `ORDER-${Date.now()}-${i}`,
      pickupAddress: {
        location: pickupLocation,
        addressName: restaurants[Math.floor(Math.random() * restaurants.length)],
        addressDetails: `${Math.floor(Math.random() * 100) + 1}, ${streetNames[Math.floor(Math.random() * streetNames.length)]}`
      },
      deliveryAddress: {
        location: deliveryLocation,
        addressName: `${Math.floor(Math.random() * 100) + 1}, ${streetNames[Math.floor(Math.random() * streetNames.length)]}`,
        addressDetails: areas[Math.floor(Math.random() * areas.length)]
      },
      estimatedTime: `${time} mins`,
      distance: `${distance.toFixed(1)} km`,
      amount: `LKR ${amount}`,
      restaurantName: restaurants[Math.floor(Math.random() * restaurants.length)]
    };
    
    orders.push(order);
  }
  
  return orders;
};

// For fixed locations around Middeniya when GPS is not available
export const getMiddeniyaLocations = () => {
  // Approximate center of Middeniya area
  const middeniyaCenter = {
    latitude: 6.2504,
    longitude: 80.7718
  };

  return [
    {
      id: "ORDER-FIXED-1",
      pickupAddress: {
        location: {
          latitude: 6.2524,  // Restaurant 1 - slightly north
          longitude: 80.7698
        },
        addressName: "නිව් ෆුඩ් සිටි",
        addressDetails: "45, මිද්දෙනිය පාර"
      },
      deliveryAddress: {
        location: {
          latitude: 6.2454,  // Delivery 1 - south
          longitude: 80.7738
        },
        addressName: "56, වාලපිටිය පාර",
        addressDetails: "වාලපිටිය"
      },
      estimatedTime: "8 mins",
      distance: "1.2 km",
      amount: "LKR 350",
      restaurantName: "නිව් ෆුඩ් සිටි"
    },
    {
      id: "ORDER-FIXED-2", 
      pickupAddress: {
        location: {
          latitude: 6.2484,  // Restaurant 2 - west
          longitude: 80.7658
        },
        addressName: "කුමාර හෝටලය",
        addressDetails: "23, තංගල්ල පාර"
      },
      deliveryAddress: {
        location: {
          latitude: 6.2554,  // Delivery 2 - northwest
          longitude: 80.7778
        },
        addressName: "89, නොනාගම පාර",
        addressDetails: "මිද්දෙනිය"
      },
      estimatedTime: "12 mins",
      distance: "1.8 km",
      amount: "LKR 550",
      restaurantName: "කුමාර හෝටලය" 
    },
    {
      id: "ORDER-FIXED-3",
      pickupAddress: {
        location: {
          latitude: 6.2574,  // Restaurant 3 - northeast
          longitude: 80.7778
        },
        addressName: "ප්‍රීති රෙස්ටුරන්ට්",
        addressDetails: "78, අම්බලන්තොට පාර"
      },
      deliveryAddress: {
        location: {
          latitude: 6.2494,  // Delivery 3 - east
          longitude: 80.7878
        },
        addressName: "34, කටුවන පාර",
        addressDetails: "කටුවන"
      },
      estimatedTime: "15 mins",
      distance: "2.2 km",
      amount: "LKR 475",
      restaurantName: "ප්‍රීති රෙස්ටුරන්ට්"
    }
  ];
};

/**
 * Generates route points between two locations
 * @param pickupLocation - Restaurant location
 * @param deliveryLocation - Delivery address location
 * @returns Array of coordinates forming a route
 */
export const generateRoutePoints = (
  pickupLocation: { latitude: number; longitude: number },
  deliveryLocation: { latitude: number; longitude: number }
) => {
  // Calculate how many points to generate based on distance
  const distance = calculateDistance(
    pickupLocation.latitude,
    pickupLocation.longitude,
    deliveryLocation.latitude,
    deliveryLocation.longitude
  );
  
  // At least 2 points, more for longer distances
  const pointsCount = Math.max(2, Math.min(Math.floor(distance * 3), 10));
  
  // Create array with pickup and delivery points
  const points = [pickupLocation];
  
  // Generate intermediate points for a natural route
  const latDiff = deliveryLocation.latitude - pickupLocation.latitude;
  const lngDiff = deliveryLocation.longitude - pickupLocation.longitude;
  
  for (let i = 1; i < pointsCount - 1; i++) {
    const fraction = i / pointsCount;
    
    // Add some randomness to make the route look more natural
    const randomLat = (Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1);
    const randomLng = (Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1);
    
    points.push({
      latitude: pickupLocation.latitude + (latDiff * fraction) + randomLat,
      longitude: pickupLocation.longitude + (lngDiff * fraction) + randomLng
    });
  }
  
  // Add the delivery point
  points.push(deliveryLocation);
  
  return points;
};

/**
 * Calculates distance between two coordinates in kilometers
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};

/**
 * Converts degrees to radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};