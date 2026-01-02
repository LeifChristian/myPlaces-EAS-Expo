import * as Location from "expo-location";

export async function reverseGeocodeCurrent({ lat, long, setPlaceId, setGeocoder }) {
  try {
    const result = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: long,
    });

    if (result.length > 0) {
      const json = {
        results: [
          {
            formatted_address: `${result[0].street} ${result[0].city}, ${result[0].region}`,
            place_id: "dummy_id",
          },
        ],
      };

      // Preserve original (odd) logging behavior
      console.log(json.results[1].formatted_address);
      console.log(json.results[2].formatted_address);
      console.log(json.results[3].formatted_address);

      console.log("place id:", json.results[0].place_id);
      const place_id_results = json.results[0]?.place_id;

      setPlaceId(place_id_results);
      let geocoderResponse = json.results;
      setGeocoder(geocoderResponse);
    }
  } catch (error) {
    console.log("Geocoding error:", error);
  }
}

export async function getCurrentLocationAndSet({
  setTheName,
  setTheId,
  setLat,
  setLong,
  setLongD,
  setLatD,
  setDisplay,
}) {
  let location = await Location.getCurrentPositionAsync({});
  console.log(location, "here is the location data");
  setTheName("");
  setTheId("");
  setLat(location.coords.latitude);
  setLong(location.coords.longitude);
  setLongD((prevState) => prevState);
  setLatD((prevState) => prevState);
  setDisplay(`lat: ${location.coords.latitude}, long: ${location.coords.longitude}`);
}

export function handleMapPress({
  e,
  setTheName,
  setLocations,
  setLat,
  setLong,
  setDisplay,
}) {
  setTheName("");
  console.log(
    e.nativeEvent.coordinate.latitude,
    e.nativeEvent.coordinate.longitude,
    "native coordinates"
  );

  console.log(typeof e.nativeEvent.coordinate.latitude);

  let slimLat = e.nativeEvent.coordinate.latitude.toFixed(7);
  let slimLong = e.nativeEvent.coordinate.longitude.toFixed(7);

  console.log(slimLat, slimLong, "trimmed response");

  setLocations([]);
  setLocations([{ lat: slimLat, long: slimLong }]);

  setLat(e.nativeEvent.coordinate.latitude);
  setLong(e.nativeEvent.coordinate.longitude);
  setDisplay(`lat: ${slimLat}, long: ${slimLong}`);
}

export async function handleLongPress({
  e,
  GOOGLE_MAPS_API_KEY,
  setDisplay,
  setModalVisible,
  setPlaceModalVisible,
  showPlace, // callback
  setPlaceId,
  placeId,
  axios,
}) {
  console.log(
    e.nativeEvent.coordinate.latitude,
    e.nativeEvent.coordinate.longitude,
    "native coordinates LONGGG"
  );

  setDisplay(
    `lat: ${e.nativeEvent.coordinate.latitude.toFixed(
      7
    )}, long: ${e.nativeEvent.coordinate.longitude.toFixed(7)}`
  );

  try {
    const result = await Location.reverseGeocodeAsync({
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    });

    if (result.length > 0) {
      const address = `${result[0].street} ${result[0].city}, ${result[0].region}`;
      console.log("Long press - searching for place_id for address:", address);

      let json;
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
            address
          )}&inputtype=textquery&fields=place_id,formatted_address&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
          json = {
            results: [
              {
                formatted_address: data.candidates[0].formatted_address || address,
                place_id: data.candidates[0].place_id,
              },
            ],
          };
          console.log("Long press - found real place_id:", data.candidates[0].place_id);
        } else {
          json = { results: [{ formatted_address: address, place_id: "dummy_id" }] };
          console.log("Long press - no place found, using dummy_id");
        }
      } catch (error) {
        console.log("Long press - error getting place_id:", error);
        json = { results: [{ formatted_address: address, place_id: "dummy_id" }] };
      }

      console.log(json.results[0].formatted_address);
      console.log("place id:", json.results[0].place_id);
      setModalVisible(false);
      setPlaceModalVisible(true);
      showPlace();
      const place_id_results = json.results[0]?.place_id;

      setPlaceId(place_id_results);

      console.log(placeId, "place id passed");

      var config2 = {
        method: "get",
        url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`,
        headers: {},
      };

      axios(config2)
        .then(function (response) {
          console.log(JSON.stringify(response.data));

          const { result } = response.data;
          console.log(result?.address_components, "--result");
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  } catch (error) {
    console.log("Geocoding error:", error);
  }
}


