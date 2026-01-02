import React from "react";
import MapView from "react-native-maps";
import { Marker } from "react-native-maps";

import PlacesMarkers from "./PlacesMarkers";

export default function MapCanvas({
  mapRef,
  mapType,
  region,
  places,
  latD,
  longD,
  setLat,
  setLong,
  setDisplay,
  setTheName,
  setTheId,
  onMapPress,
  onLongPress,
  stopMyLiveLocation,
}) {
  // Extracted from App.js map JSX; props/handlers intentionally unchanged.
  return (
    <MapView
      ref={mapRef}
      zoomEnabled={true}
      mapType={mapType}
      style={{
        marginTop: -40,
        height: "68%",
        width: "100%",
        backgroundColor: "black",
      }}
      showsUserLocation={true}
      onMapReady={() => console.log("MapView is ready!")}
      onMapLoaded={() => console.log("Map tiles loaded!")}
      onError={(error) => console.log("MapView error:", error)}
      loadingEnabled={false}
      onPress={(e) => {
        // Always allow map press, even near markers
        onMapPress(e);
        stopMyLiveLocation();
      }}
      onLongPress={(e) => {
        onLongPress(e);
        stopMyLiveLocation();
      }}
      onPoiClick={(e) => {
        // When POI is clicked, treat it as a map press instead
        console.log("POI clicked, treating as map press");
        onMapPress(e);
        stopMyLiveLocation();
      }}
      region={region || undefined}
    >
      <Marker coordinate={region} image={require("../../images/pin.png")}></Marker>
      <PlacesMarkers
        places={places}
        latD={latD}
        longD={longD}
        setLat={setLat}
        setLong={setLong}
        setDisplay={setDisplay}
        setTheName={setTheName}
        setTheId={setTheId}
      />
    </MapView>
  );
}


