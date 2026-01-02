import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function PlacesList({
  places,
  mapRef,
  setLat,
  setLong,
  setTheName,
  setTheId,
  setDisplay,
  setModalVisible,
  stopMyLiveLocation,
  setPlaceModalVisible,
  confirmDeletePlace,
}) {
  // Extracted from App.js `showPlaces()`; behavior intentionally unchanged.
  if ((places == null) | !places) {
    console.log("places are null");
    return null;
  }

  return places.map((element) => {
    //capitalize the first letter of a place. unused but cool. lol
    const caps = element?.name.charAt(0).toUpperCase() + element?.name.slice(1);

    //go to a place on press
    const gotoPlace = (lat, long) => {
      mapRef.current.animateToRegion(
        {
          latitude: lat,
          longitude: long,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        3 * 1000
      );

      //set current lat, long, display, and id
      setLat(lat);
      setLong(long);
      setTheName(element.name);
      setTheId(element.id);
      //fixed length on lat/long returns for display purposes
      setDisplay(`lat: ${lat.toFixed(7)}, long: ${long.toFixed(7)}`);
    };

    //show place and edit, delete buttons
    return (
      <View key={element.id}>
        <TouchableOpacity
          onPress={() => {
            gotoPlace(element.lat, element.long, element.name);
            setLat(element.lat);
            setLong(element.long);
            setModalVisible(false);
            stopMyLiveLocation();
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              textAlign: "center",
              color: "white",
            }}
          >
            {element.name} {/*   {caps} */}{" "}
          </Text>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            marginLeft: 60,
            marginRight: 40,
            width: 100,
            marginBottom: 18,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              confirmDeletePlace(element.id, element.lat, element.name);
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontSize: 23,
                marginLeft: "24%",
                marginTop: -2,
              }}
            >
              X
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              gotoPlace(element.lat, element.long, element.name);
              setPlaceModalVisible(true);
              setTheId(element.id);

              //  showPlace()
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontSize: 23,
                marginTop: -8,
              }}
            >
              ...
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  });
}


