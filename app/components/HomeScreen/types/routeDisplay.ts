import { ViewStyle, StyleProp } from "react-native";

/**
 * Basic coordinate interface used throughout the app
 */
export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Mapbox specific coordinate format [longitude, latitude]
 */
export type MapboxCoordinate = [number, number];

/**
 * Props for the OrderRouteDisplay component
 */
export interface OrderRouteDisplayProps {
  orderRoute: Coordinate[];
  apiKey?: string;
  showOptimizedRoute?: boolean;
  lineColor?: string;
  lineWidth?: number;
}

/**
 * Response structure from Mapbox Optimization API
 */
export interface OptimizedRouteResponse {
  code: string;
  uuid: string;
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: MapboxCoordinate[];
      type: string;
    };
    weight: number;
    weight_name: string;
    legs: Array<{
      distance: number;
      duration: number;
      steps: any[];
      summary: string;
    }>;
  }>;
  waypoints: Array<{
    distance: number;
    name: string;
    location: MapboxCoordinate;
  }>;
}

/**
 * Response structure from Mapbox Directions API
 */
export interface DirectionsRouteResponse {
  routes: Array<{
    geometry: {
      coordinates: MapboxCoordinate[];
      type: string;
    };
    duration: number;
    distance: number;
    legs: Array<{
      steps: Array<{
        maneuver: {
          instruction: string;
          location: MapboxCoordinate;
          type: string;
          bearing_before: number;
          bearing_after: number;
        };
        distance: number;
        duration: number;
      }>;
      summary: string;
      distance: number;
      duration: number;
    }>;
  }>;
  waypoints: Array<{
    name: string;
    location: MapboxCoordinate;
  }>;
  code: string;
}

/**
 * Progress event emitted during navigation
 */
export interface NavigationProgressEvent {
  distanceRemaining: number;
  distanceTraveled: number;
  durationRemaining: number;
  fractionTraveled: number;
  currentLocation?: Coordinate;
  currentSpeed?: number;
  routeProgressState?: 'tracking' | 'offRoute' | 'rerouting' | 'complete';
}

/**
 * Route metadata with information about the trip
 */
export interface RouteMetadata {
  distance: number;      // Total distance in meters
  duration: number;      // Total duration in seconds
  averageSpeed?: number; // Average speed in meters per second
  trafficLevel?: 'low' | 'moderate' | 'heavy' | 'severe';
}

/**
 * Props for map controls that can be passed to MapDisplay
 */
export interface MapControlsProps {
  showTraffic?: boolean;
  showCompass?: boolean;
  showScale?: boolean;
  showUserLocation?: boolean;
  showHeadingIndicator?: boolean;
  allowTilt?: boolean;
  allowRotate?: boolean;
  allowZoom?: boolean;
  initialZoomLevel?: number;
  mapStyle?: string;
  logoPadding?: { x: number; y: number };
  compassPadding?: { x: number; y: number };
}

/**
 * Config options for route rendering
 */
export interface RouteRenderingOptions {
  lineColor?: string;
  lineWidth?: number;
  lineOpacity?: number;
  lineDashPattern?: number[];
  showArrows?: boolean;
  arrowColor?: string;
  arrowSize?: number;
  arrowSpacing?: number;
}

/**
 * Marker options for customizing waypoint markers
 */
export interface MarkerOptions {
  pickupIcon?: string;
  deliveryIcon?: string;
  waypointIcon?: string;
  markerSize?: number;
  markerColor?: string;
  showLabels?: boolean;
  labelFontSize?: number;
  labelColor?: string;
}