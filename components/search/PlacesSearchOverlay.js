import React from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function PlacesSearchOverlay({
  visible,
  GOOGLE_MAPS_API_KEY,
  stopMyLiveLocation,
  setLat,
  setLong,
  setLongD,
  setDisplay,
  setLocations,
  showGoogleInput,
}) {
  // Extracted from App.js GooglePlacesAutocomplete block; behavior intentionally unchanged.
  if (!visible) return null;

  return (
    <GooglePlacesAutocomplete
      placeholder="Search"
      fetchDetails={true}
      enablePoweredByContainer={false}
      listViewDisplayed="auto"
      returnKeyType="search"
      minLength={2}
      debounce={300}
      keepResultsAfterBlur={true}
      keyboardShouldPersistTaps="always"
      predefinedPlaces={[]}
      predefinedPlacesAlwaysVisible={false}
      GooglePlacesDetailsQuery={{
        fields: "geometry,name,formatted_address,place_id,types",
      }}
      styles={{
        container: {
          flex: 0,
          position: "absolute",
          width: "100%",
          zIndex: 1000,
          elevation: 10,
          top: 170,
        },
        textInput: {
          marginLeft: 17,
          marginRight: 17,
          height: 50,
          color: "black",
          fontSize: 16,
          backgroundColor: "white",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          paddingHorizontal: 12,
        },
        listView: {
          backgroundColor: "white",
          marginLeft: 17,
          marginRight: 17,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          borderRadius: 8,
          marginTop: 2,
          maxHeight: 300,
          borderWidth: 1,
          borderColor: "#ddd",
        },
        row: {
          backgroundColor: "#FFFFFF",
          padding: 13,
          height: 44,
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
        },
      }}
      onPress={(data, details = null) => {
        console.log("=== SEARCH RESULT CLICKED ===");
        console.log("Data:", JSON.stringify(data, null, 2));
        console.log("Details:", JSON.stringify(details, null, 2));

        // Try multiple possible data structures
        let lat, lng;

        // Original structure
        if (details && details.geometry && details.geometry.location) {
          lat = details.geometry.location.lat;
          lng = details.geometry.location.lng;
          console.log("Found coords in details.geometry.location:", lat, lng);
        }
        // Alternative structure
        else if (data && data.geometry && data.geometry.location) {
          lat = data.geometry.location.lat;
          lng = data.geometry.location.lng;
          console.log("Found coords in data.geometry.location:", lat, lng);
        }
        // Another possible structure
        else if (details && details.lat && details.lng) {
          lat = details.lat;
          lng = details.lng;
          console.log("Found coords in details directly:", lat, lng);
        } else {
          console.log("NO COORDINATES FOUND - check the data structure above");
        }

        if (lat && lng) {
          console.log("Navigating to:", lat, lng);
          stopMyLiveLocation();
          setLat(lat);
          setLong(lng);
          setLongD(0.00867);
          setDisplay(`lat: ${lat.toFixed(7)}, long: ${lng.toFixed(7)}`);
          setLocations([{ lat, long: lng }]);
        }

        showGoogleInput(false);
      }}
      onFail={(error) => {
        console.log("Google Places API FAILED:", error);
        console.log(
          "API Key being used:",
          GOOGLE_MAPS_API_KEY ? "Key exists" : "NO API KEY"
        );
      }}
      onNotFound={() => {
        console.log("Google Places: No results found");
      }}
      query={{
        key: GOOGLE_MAPS_API_KEY,
        language: "en",
        // Remove types restriction to search everything: businesses, landmarks, addresses, etc.
      }}
      timeout={20000}
      textInputProps={{
        onBlur: () => showGoogleInput(false),
        autoFocus: true,
      }}
    />
  );
}


