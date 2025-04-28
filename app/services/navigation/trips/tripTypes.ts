/**
 * Types that match the MongoDB schema structures
 */

// Location data structure (matches Location schema)
export interface LocationData {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    altitude?: number;
    timestamp: number;
    batteryLevel?: number;
    status?: 'AVAILABLE' | 'PICKING_UP' | 'DELIVERING' | 'COMPLETED';
  }
  
  // Trip waypoint structure (matches WaypointSchema)
  export interface TripWaypoint {
    type: 'PICKUP' | 'DROPOFF' | 'WAYPOINT';
    latitude: number;
    longitude: number;
    address: string;
    arrivalTime?: string;
    departureTime?: string;
    status?: 'PENDING' | 'ARRIVED' | 'COMPLETED';
  }
  
  // Server waypoint format (matches your MongoDB schema)
  export interface ServerWaypointFormat {
    type: 'PICKUP' | 'DROPOFF' | 'WAYPOINT';
    location: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
    };
    address: string;
    arrivalTime?: string;
    departureTime?: string;
    status?: 'PENDING' | 'ARRIVED' | 'COMPLETED';
  }
  
  // Trip creation data structure
  export interface TripCreateDto {
    orderId: string;
    driverId: string;
    customerId: string;
    waypoints: TripWaypoint[];
    estimatedDistance: number;
    estimatedDuration: number;
  }
  
  // Trip status data structure (matches TripSchema)
  export interface TripStatusDto {
    orderId: string;
    driverId: string;
    customerId: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    startTime?: string;
    endTime?: string;
    estimatedArrivalTime?: string;
    waypoints: ServerWaypointFormat[];
    route?: {
      type: 'LineString';
      coordinates: [number, number][];
    };
    distance: number;
    duration: number;
    currentEta: number;
    createdAt?: string;
    updatedAt?: string;
    driverLocation?: LocationData;
  }
  
  // Type for converting between client and server formats
  export const convertWaypointForApi = (waypoint: TripWaypoint): ServerWaypointFormat => ({
    type: waypoint.type,
    location: {
      type: 'Point',
      coordinates: [waypoint.longitude, waypoint.latitude] // Server expects [longitude, latitude]
    },
    address: waypoint.address,
    status: waypoint.status || 'PENDING'
  });
  
  // Helper function to convert waypoints array to server format
  export const formatWaypointsForApi = (waypoints: TripWaypoint[]): ServerWaypointFormat[] => {
    return waypoints.map(convertWaypointForApi);
  };
  
  // Helper function to convert server waypoints to client format
  export const convertServerWaypoint = (waypoint: ServerWaypointFormat): TripWaypoint => ({
    type: waypoint.type,
    latitude: waypoint.location.coordinates[1],
    longitude: waypoint.location.coordinates[0],
    address: waypoint.address,
    arrivalTime: waypoint.arrivalTime,
    departureTime: waypoint.departureTime,
    status: waypoint.status
  });