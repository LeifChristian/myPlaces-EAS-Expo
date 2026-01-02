import React from "react";
import { Marker } from "react-native-maps";

export default function PlacesMarkers({
  places,
  latD,
  longD,
  setLat,
  setLong,
  setDisplay,
  setTheName,
  setTheId,
}) {
  // Extracted from App.js `list()`; behavior intentionally unchanged.
  if ((places == null) | !places) {
    console.log("places are null");
    return null;
  }

  return places.map((element) => {
    return (
      <Marker
        onPress={() => {
          setLat(element.lat);
          setLong(element.long);
          setDisplay(
            `lat: ${element.lat.toFixed(7)}, long: ${element.long.toFixed(7)}`
          );
          setTheName(element.name);
          setTheId(element.id);
        }}
        key={element.id}
        coordinate={{
          latitude: element.lat,
          latitudeDelta: latD,
          longitude: element.long,
          longitudeDelta: longD,
        }}
        tracksViewChanges={false}
        anchor={{ x: 0.5, y: 1.0 }}
        centerOffset={{ x: 0, y: 0 }}
      ></Marker>
    );
  });
}


