import React from "react";
import { View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useDriverContext } from "../../src/context/DriverContext";
import { MapContainer } from "./styles";

const MapDisplay = () => {
  const { initialRegion, mapRef, orderRoute } = useDriverContext();

  if (!initialRegion) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <MapContainer>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        followsUserLocation
      >
        {orderRoute && <OrderRouteDisplay orderRoute={orderRoute} />}
      </MapView>
    </MapContainer>
  );
};

const OrderRouteDisplay = ({ orderRoute }: { orderRoute: any[] }) => {
  return (
    <>
      {/* Starting point */}
      <Marker coordinate={orderRoute[0]} title="Pickup Location">
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 15,
            padding: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 5,
          }}
        >
          <FontAwesome5 name="store" size={20} color="#f23f07" />
        </View>
      </Marker>

      {/* Destination */}
      <Marker
        coordinate={orderRoute[orderRoute.length - 1]}
        title="Delivery Location"
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 15,
            padding: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
            elevation: 5,
          }}
        >
          <Ionicons name="location" size={20} color="#f23f07" />
        </View>
      </Marker>

      {/* Route polyline */}
      <Polyline
        coordinates={orderRoute}
        strokeColor="#f23f07"
        strokeWidth={4}
        lineDashPattern={[0]}
      />
    </>
  );
};

export default MapDisplay;
