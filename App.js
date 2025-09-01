import 'react-native-get-random-values';
import React, { useState, useEffect, useRef } from "react";
import MapView from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dimensions } from 'react-native';
import { Marker } from "react-native-maps";
import { v4 as uuidv4 } from 'uuid';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";
import Constants from 'expo-constants';
import FtueScreen from "./components/ftue";
import Modality from "./components/modal";
import PlacesModal from "./components/placesModal";
import prompt from "react-native-prompt-android";
import axios from "axios";

// Minimal XMLHttpRequest timeout fix - only for Google Places API, not map tiles
if (global.XMLHttpRequest) {
  const originalSend = global.XMLHttpRequest.prototype.send;
  
  global.XMLHttpRequest.prototype.send = function(body) {
    // Only fix timeout for Google Places API calls, leave map tiles alone
    if (this.responseURL && this.responseURL.includes('googleapis.com/maps/api/place')) {
      if (this.timeout === undefined || this.timeout === null || this.timeout === 0) {
        this.timeout = 15000;
      }
    }
    
    return originalSend.call(this, body);
  };
}


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// Get Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || 'YOUR_API_KEY_HERE';
console.log("Google Maps API Key loaded:", GOOGLE_MAPS_API_KEY ? "✓ Key found" : "✗ NO KEY");

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  PermissionsAndroid,
} from "react-native";

// import mapstyle from "./mapstyle.json";
// import { StatusBar } from "expo-status-bar";
// console.log(mapstyle);

export default function App() {
  const [editPrompt, setEditPrompt] = useState(false);
  const [placeId, setPlaceId] = useState(null);
  const [locations, setLocations] = useState(null);
  const [lat, setLat] = useState(40.758896);
  const [latD, setLatD] = useState(0.421);
  const [long, setLong] = useState(-73.985130);
  const [longD, setLongD] = useState(0.421);
  const [places, setPlaces] = useState([]);

  const [display, setDisplay] = useState("null");
  const mapRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);

  const [GoogleInput, showGoogleInput] = useState(false);
  const [mapType, setMapType] = useState("standard");
  const [isLiveLocationOn, setIsLiveLocationOn] = useState(true);
  const [watcher, setWatcher] = useState(null);

  const [theName, setTheName] = useState(null);
  const [theId, setTheId] = useState(null);
  const [PlaceModalVisible, setPlaceModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [ftueVisible, setFtueVisible] = useState(true);
  const [appReady, setAppReady] = useState(false);

  const [geocoder, setGeocoder] = useState("");
  const showControls = appReady && !ftueVisible;
  //set initial region as "home" location for new users
  let region = {
    latitude: lat,
    latitudeDelta: latD,
    longitude: long,
    longitudeDelta: longD,
  };

  //get location permission and set location watch. check for places in localstorage and display them.
  useEffect(() => {
    (async () => {
      // await AsyncStorage.removeItem('places'); // this line removes all places from storage for testing

      //FIRST: Load places from storage immediately
      try {
        const value = await AsyncStorage.getItem("places");
        console.log("Raw AsyncStorage value:", value);

        // if items exist in local storage, parse and set places
        if (value !== null && value !== undefined && value !== "null") {
          const parseley = JSON.parse(value);
          console.log(parseley, "places from AsyncStorage - LOADED FIRST");
          setPlaces(parseley);
        } else {
          console.log("No existing places found");
          setPlaces([]); // Set empty array initially
        }
      } catch (e) {
        console.log("Error loading places:", e);
        setPlaces([]);
      }

      //SECOND: Get location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      //THIRD: Get current location
      let location = await Location.getCurrentPositionAsync({});
      console.log(location, "current location");

      //FOURTH: Set initial display and location
      setLocations([
        { lat: location.coords.latitude, long: location.coords.longitude },
      ]);
      setDisplay(
        `lat: ${location.coords.latitude.toFixed(
          7
        )}, long: ${location.coords.longitude.toFixed(7)}`
      );
      setLat(location.coords.latitude);
      setLong(location.coords.longitude);

      //FIFTH: If no places existed, create default home with actual location
      const currentPlaces = await AsyncStorage.getItem("places");
      if (!currentPlaces || currentPlaces === "null" || JSON.parse(currentPlaces).length === 0) {
        console.log("Creating default home place with actual location");
        
        let defaultPlaceObject = {
          lat: location.coords.latitude,
          long: location.coords.longitude,
          id: uuidv4(),
          name: "home",
          dateAdded: Date.now(),
        };

        const defaultArray = [defaultPlaceObject];
        
        await AsyncStorage.setItem("places", JSON.stringify(defaultArray));
        console.log(defaultArray, "created default home place");
        setPlaces(defaultArray);
      }

      //SIXTH: Start location watching
      Location.watchPositionAsync(
        {
          enableHighAccuracy: true,
        },
        (location) => {
          console.log(
            location.coords.latitude,
            location.coords.longitude,
            "current location"
          );

          //set current location
          setLocations([
            { lat: location.coords.latitude, long: location.coords.longitude },
          ]);
          console.log(locations, "lo");

          //set displayed lat/long to current location
          setDisplay(
            `lat: ${location.coords.latitude.toFixed(
              7
            )}, long: ${location.coords.longitude.toFixed(7)}`
          );
          //set current coords
          setLat(location.coords.latitude);
          setLong(location.coords.longitude);
        }
      )
        .then((locationWatcher) => {
          setWatcher(locationWatcher);
        })
        .catch((err) => {
          console.log(err);
        });

      // App is ready - permissions granted, location loaded
      setAppReady(true);
    })();
  }, []);

  //refresh function to update places after edit, delete or add
  const refresh = async () => {
    try {
      const value = await AsyncStorage.getItem("places");
      if (value !== null) {
        let washedResponse = JSON.parse(value);
        setPlaces(washedResponse);

        // value previously stored
      }

      if ((value == null) | !value) {
        console.log("no items");
      }
    } catch (e) {
      // error reading value
    }
  };

  //add a place and save to localStorage
  const addPlace = async (text) => {
    console.log(locations, " locations");
    console.log(text, "text");

    try {
      //set object structure of new place

      const newPlace = {
        lat: parseFloat(locations[0].lat),
        long: parseFloat(locations[0].long),
        id: uuidv4(),
        name: text,
        dateAdded: Date.now(),
      };
      //assign previous places to array
      const prevPlaces = await AsyncStorage.getItem("places");
      console.log(prevPlaces, "prevPlaces");
      console.log(locations[0], "locations");
      console.log(newPlace, "--new place object");
      //set prevPlaces to parsed variable
      const parsedReturn = JSON.parse(prevPlaces);
      //add new place to prevPlaces with spread operator
      let newArrayOfPlaces = [...parsedReturn, newPlace];
      //set new places item
      await AsyncStorage.setItem("places", JSON.stringify(newArrayOfPlaces));
      //redundant variable, but helps to understand update to places object and console log.
      const updatedPlaces = await AsyncStorage.getItem("places");
      console.log(updatedPlaces, "items from local storage");
      //call refresh function to update views
      refresh();
    } catch (e) {
      console.log(e, "error");
      // saving error
      refresh();
    }
  };

  //confirm place to be deleted on delete button press
  const confirmDeletePlace = (id, lat, name) => {
    return (
      Alert.alert("Sure?", `Confirm delete ${name}`, [
        // The "Yes" button
        {
          text: "Yes",
          onPress: () => {
            deletePlace(id, lat, name);
          },
        },
        // Dismiss the dialog when tapped
        {
          text: "No",
        },
      ]),
      lat,
      id,
      name
    );
  };

  //delete a place upon confirmation
  const deletePlace = async (id, lat) => {
    //remove name and id of deleted place.
    setTheName("");
    setTheId("");
    //  alert(` Deleted:  ${id} | Lat: ${lat}`)
    // close modal
    setModalVisible(false);
    try {
      console.log(id, lat);

      //get places array before deleting item
      const prevPlaces = await AsyncStorage.getItem("places");
      //parse prevPlaces
      const parseley = JSON.parse(prevPlaces);
      console.log(parseley, "prevPlaces");
      console.log(locations[0], "locationsss");

      //filter places array and remove item to be deleted
      var placesAfterDelete = parseley.filter(function (el) {
        return el.id !== id;
      });

      console.log(placesAfterDelete, "places after delete item");
      //set places array to new filtered array
      await AsyncStorage.setItem("places", JSON.stringify(placesAfterDelete));
      //redundant variable to show newly updated places item
      const postDelete = await AsyncStorage.getItem("places");
      //parse and console log
      const parsed = JSON.parse(postDelete);
      console.log(parsed, "parsed");
      //call refresh function to update views and state
      refresh();

      return;

      // await AsyncStorage.removeItem('places')
    } catch (e) {
      // remove error
      console.log(e);
    }
    refresh();
  };

  //show individual places
  const showPlaces = () => {
    // stopMyLiveLocation();
    if ((places == null) | !places) {
      console.log("places are null");
      return;
    }

    return places.map((element) => {
      //capitalize the first letter of a place. unused but cool. lol
      const caps =
        element?.name.charAt(0).toUpperCase() + element?.name.slice(1);

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
  };

  //list of places on map as markers
  const list = () => {
    // console.log(places, 'places')

    if ((places == null) | !places) {
      console.log("places are null");
      return;
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
          // image={require("./pin.png")}
          // <Text style={{color: "red"}}>{element.name}</Text>
        ></Marker>
      );
    });
  };

  //move functionality for up, down, left, right, and zoom.
  //amount to be moved in any direction is determined as a ratio to zoom level

  const move = (direction) => {
    setTheName("");
    setTheId("");

    switch (direction) {
      case "up":
        stopMyLiveLocation();
        setLong((prevState) => prevState);
        setDisplay(
          `lat: ${(lat + latD / 7).toFixed(7)}, long: ${long.toFixed(7)}`
        );
        console.log(display);
        setLocations([{ lat: lat + latD / 3, long: long }]);

        setLat((prevState) => prevState + latD / 3);
        console.log(lat, long);
        break;

      case "down":
        stopMyLiveLocation();
        setLat((prevState) => prevState - latD / 3);
        setLong((prevState) => prevState);
        setDisplay(
          `lat: ${(lat - latD / 7).toFixed(7)}, long: ${long.toFixed(7)}`
        );
        setLocations([{ lat: lat - latD / 3, long: long }]);
        break;

      case "left":
        stopMyLiveLocation();
        setLong((prevState) => prevState - longD / 7);
        console.log(longD);
        setDisplay(
          `lat: ${lat.toFixed(7)}, long: ${(long - longD / 7).toFixed(7)}`
        );
        setLocations([{ lat: lat, long: long - longD / 7 }]);
        break;

      case "right":
        stopMyLiveLocation();
        console.log(longD);
        setLong((prevState) => prevState + longD / 7);
        setDisplay(
          `lat: ${lat.toFixed(7)}, long: ${(long + longD / 7).toFixed(7)}`
        );
        setLocations([{ lat: lat, long: long + longD / 7 }]);
        break;

      case "minus":
        setLongD((prevState) => prevState + prevState / 4);
        setLatD((prevState) => prevState + prevState / 4);
        console.log(longD);
        
        break;

      case "plus":
        setLongD((prevState) => prevState - prevState / 4);
        setLatD((prevState) => prevState - prevState / 4);
        console.log(longD);
        break;
    }
  };

  const showPlace = async () => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: long,
      });
      
      if (result.length > 0) {
        const json = { results: [{ formatted_address: `${result[0].street} ${result[0].city}, ${result[0].region}`, place_id: 'dummy_id' }] };
        
        // unused functionality to send list of places to backend routes i created on my self hosted AWS server

      // var config = {
      //   method: 'post',
      //   url: `http://54.183.11.135:3802/addPlace?password=b03ddf3ca2e714a6548e7495e2a03f5e824eaac9837cd7f159c67b90fb4b7342&lat=${lat}&long=${long}&name=${format}`,
      //   headers: { }
      // };

      // axios(config)
      // .then(function (response) {
      //   console.log(JSON.stringify(response.data));
      // })
      // .catch(function (error) {
      //   console.log(error);
      //   console.log('error achieved')
      // });

      // console.log(json.results[0].formatted_address)
      // const format = json.results[0].place_id;
      //  alert(json.results[0].place_id)
      console.log(json.results[1].formatted_address);
      console.log(json.results[2].formatted_address);
      console.log(json.results[3].formatted_address);

      console.log("place id:", json.results[0].place_id);
      // alert(`${json.results[0].formatted_address} `)
      const place_id_results = json.results[0]?.place_id;

      //set place id for subsequent geocoder API call
      setPlaceId(place_id_results);
      let geocoderResponse = json.results;
      //set geocoder response
      setGeocoder(geocoderResponse);
      }
    } catch (error) {
      console.log("Geocoding error:", error);
    }
  };

  //show current location
  const showMyLocation = async () => {
    let location = await Location.getCurrentPositionAsync({});
    console.log(location, "here is the location data");
    //remove current place name and id
    setTheName("");
    setTheId("");
    //set lat/long and displayed lat/long to current location
    setLat(location.coords.latitude);
    setLong(location.coords.longitude);
    setLongD((prevState) => prevState);
    setLatD((prevState) => prevState);
    setDisplay(
      `lat: ${location.coords.latitude}, long: ${location.coords.longitude}`
    );
  };

  //functionality to move marker on map press
  const onMapPress = (e) => {
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

    // console.log(locations[0].lat, locations[0].long, 'locations[0]')

    setLocations([]);

    setLocations([{ lat: slimLat, long: slimLong }]);

    setLat(e.nativeEvent.coordinate.latitude);
    setLong(e.nativeEvent.coordinate.longitude);

    setDisplay(`lat: ${slimLat}, long: ${slimLong}`);
  };

  //functionality to show more info on a place on longPress.
  //takes placeId and makes call to geocoding for place info

  const onLongPress = async (e) => {
    // console.log(e, "LONGPRESS!!!");
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
        // Use Google Places API to get real place_id instead of dummy
        const address = `${result[0].street} ${result[0].city}, ${result[0].region}`;
        console.log("Long press - searching for place_id for address:", address);
        
        let json;
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(address)}&inputtype=textquery&fields=place_id,formatted_address&key=${GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          
          if (data.candidates && data.candidates.length > 0) {
            json = { results: [{ 
              formatted_address: data.candidates[0].formatted_address || address, 
              place_id: data.candidates[0].place_id 
            }] };
            console.log("Long press - found real place_id:", data.candidates[0].place_id);
          } else {
            // Fallback to dummy if no place found
            json = { results: [{ formatted_address: address, place_id: 'dummy_id' }] };
            console.log("Long press - no place found, using dummy_id");
          }
        } catch (error) {
          console.log("Long press - error getting place_id:", error);
          // Fallback to dummy on error
          json = { results: [{ formatted_address: address, place_id: 'dummy_id' }] };
        }
        
      //below is test code to send a single location to a server

      // var config = {
      //   method: 'post',
      //   url: `http://54.183.11.135:3802/addPlace?password=b03ddf3ca2e714a6548e7495e2a03f5e824eaac9837cd7f159c67b90fb4b7342&lat=${lat}&long=${long}&name=${format}`,
      //   headers: { }
      // };

      // axios(config)
      // .then(function (response) {
      //   console.log(JSON.stringify(response.data));
      // })
      // .catch(function (error) {
      //   console.log(error);
      // });

      console.log(json.results[0].formatted_address);
      console.log("place id:", json.results[0].place_id);
      // alert(`${json.results[0].formatted_address} `)
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

          // var path = RNFS.DocumentDirectoryPath + '/test.txt';
          // RNFS.writeFile(path, 'ass.', 'utf8')
          //  .then(() => console.log('FILE WRITTEN!'))
          //  .catch((err) => console.log(err.message));

          // console.log(RNFS)
        })
        .catch(function (error) {
          console.log(error);
        });
      }
    } catch (error) {
      console.log("Geocoding error:", error);
    }
  };

  //turns off live location watch, or "car mode". when in motion especially fast, location keeps updating which can interfere with searches,
  //or navigation in general
  const stopMyLiveLocation = async () => {
    // Only stop if currently running
    if (!isLiveLocationOn) {
      return;
    }

    console.log("Stopping live location");
    
    if (watcher) {
      await watcher.remove();
      setWatcher(null);
    }
    
    // Explicitly set to OFF
    setIsLiveLocationOn(false);
  };

  //turn on live location watch.
  const startMyLiveLocation = async () => {
    // Only start if not already running
    if (isLiveLocationOn) {
      return;
    }

    console.log("Starting live location");

    try {
      const locationWatcher = await Location.watchPositionAsync(
        {
          enableHighAccuracy: true,
        },
        (location) => {
          console.log(
            location.coords.latitude,
            location.coords.longitude,
            "current location"
          );
          setLocations([
            { lat: location.coords.latitude, long: location.coords.longitude },
          ]);
          console.log(locations, "lo");
          setDisplay(
            `lat: ${location.coords.latitude.toFixed(
              7
            )}, long: ${location.coords.longitude.toFixed(7)}`
          );
          setLat(location.coords.latitude);
          setLong(location.coords.longitude);
        }
      );
      
      setWatcher(locationWatcher);
      // Explicitly set to ON
      setIsLiveLocationOn(true);
    } catch (err) {
      console.log("Error starting live location:", err);
    }
  };
  
  //core of app display.
  return (
    <View style={styles.container}>
      {showControls && (mapType == "standard" ? (
        <TouchableOpacity
          style={{ position: 'absolute', top: 30, alignSelf: 'center', zIndex: 3, elevation: 3 }}
          onPress={() => {
            //toggle map type, or street/satellite view
            setMapType("satellite");
          }}
        >
          <Text
            style={{
              color: "black",
              padding: 6,
              borderRadius: 9,
              backgroundColor: "rgba(161, 155, 155, 0.3)",
            }}
          >
            MAP TYPE
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{ position: 'absolute', top: 30, alignSelf: 'center', zIndex: 3, elevation: 3 }}
          onPress={() => {
            setMapType("standard");
          }}
        >
          <Text
            style={{
              color: "darkgrey",
              padding: 6,
              borderRadius: 9,
              backgroundColor: "rgba(161, 155, 155, 0.3)",
            }}
          >
            SATELLITE
          </Text>
        </TouchableOpacity>
      ))}

      {appReady ? (
        <FtueScreen
          pagekey={"uniquekey"}
          title={"categort title"}
          description={"topic description"}
          setFtueVisible={setFtueVisible}
        />
      ) : null}

      <MapView
        ref={mapRef}
        zoomEnabled={true}
        mapType={mapType}
        style={{ marginTop: -30, height: "68%", width: "100%", backgroundColor: "black" }}
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
          onLongPress(e); stopMyLiveLocation();
        }}
        onPoiClick={(e) => {
          // When POI is clicked, treat it as a map press instead
          console.log("POI clicked, treating as map press");
          onMapPress(e);
          stopMyLiveLocation();
        }}
        region={region || undefined}
      >
        {/* 
          { toggleWatchPosition ?
                  <Marker coordinate={region} image={require("./pin.png")}></Marker>
                : null
                }
          */}

        <Marker
          coordinate={region}
          image={require("./images/pin.png")}
        ></Marker>
        {list()}
      </MapView>  
   

      {/* <ScaleBar zoom={(longD/latD)} latitude={latD}>{console.log((latD, longD + 'nice'))}</ScaleBar> */}

      {showControls ? (
        <View style={{ backgroundColor: "black" }}></View>
      ) : null}

      {showControls ? (
        <Text
          style={{
            color: "black",
            fontSize: 16,
            marginTop: "-12%",
            fontWeight: "600",
            marginBottom: "2%",
            backgroundColor: "rgba(161, 155, 155, 0.3)",
            borderRadius: 11,
            padding: 6,
          }}
        >
          {display == "null" ? "" : display}
        </Text>
      ) : null}

      {showControls ? (
        isLiveLocationOn ? (
          <TouchableOpacity
            onPressIn={() => {
              stopMyLiveLocation();
            }}
          >
            <Text
              style={{
                marginTop: 24,
                marginLeft: 300,
                height: 80,
                marginBottom: -68,
              }}
            >
              <Image
                style={{
                  height: 33,
                  width: 20,
                  marginTop: 4,
                  marginRight: 2,
                  marginLeft: -2,
                }}
                source={require("./images/walking.png")}
              ></Image>
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPressIn={() => {
              startMyLiveLocation();
            }}
          >
            <Text
              style={{
                marginTop: 20,
                marginLeft: 300,
                height: 80,
                marginBottom: -78,
              }}
            >
              <Image
                style={{
                  height: 35,
                  width: 35,
                  marginTop: 4,
                  marginRight: 2,
                  marginLeft: -2,
                }}
                source={require("./images/car.png")}
              ></Image>
            </Text>
          </TouchableOpacity>
        )
      ) : null}

      {showControls ? (
        <TouchableOpacity
          style={styles.googleButton}
          onPressIn={() => {
            showGoogleInput((prevState) => !prevState);
            stopMyLiveLocation();
          }}
        >
          <Text style={styles.autoStyle}>
            <Image
              style={{
                height: 25,
                width: 25,
                marginRight: 2,
                marginLeft: -2,
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
              }}
              source={require("./images/search.png")}
            ></Image>
          </Text>
        </TouchableOpacity>
      ) : null}

      {showControls ? (
        <Text
          style={{
            color: "white",
            marginTop: 33,
            marginBottom: -40,
            fontSize: 22,
          }}
        >
          {theName}
        </Text>
      ) : null}

      {showControls ? (
        <View style={styles.controlsContainer}>
          {/* Top Row - Up Button */}
          <View style={styles.topRow}>
            <TouchableOpacity onPressIn={() => move("up")} style={styles.buttonContainer}>
              <Text style={styles.directionButton}>↑</Text>
            </TouchableOpacity>
          </View>

          {/* Middle Row - Zoom Out, Left, Center, Right, Zoom In */}
          <View style={styles.middleRow}>
            <TouchableOpacity onPressIn={() => move("minus")} style={[styles.buttonContainer, {marginRight: -10}]}>
              <Text style={styles.zoomButton}>--</Text>
            </TouchableOpacity>

            <TouchableOpacity onPressIn={() => move("left")} style={styles.buttonContainer}>
              <Text style={styles.directionButton}>←</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {showMyLocation(); startMyLiveLocation()}} style={styles.buttonContainer}>
              <Image
                style={styles.centerImage}
                source={require("./images/center.png")}
              />
            </TouchableOpacity>

            <TouchableOpacity onPressIn={() => move("right")} style={styles.buttonContainer}>
              <Text style={styles.directionButton}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity onPressIn={() => move("plus")} style={[styles.buttonContainer, {marginLeft: -15}]}>
              <Text style={styles.zoomButton}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Row - Down Button */}
          <View style={styles.bottomRow}>
            <TouchableOpacity onPressIn={() => move("down")} style={styles.buttonContainer}>
              <Text style={styles.directionButton}>↓</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              onPressIn={() => {
                prompt(
                  'Name Your Place',
                  '',
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {text: 'Save', onPress: (text) => addPlace(text || "untitled")},
                  ],
                  {
                    type: 'plain-text',
                    cancelable: true,
                    placeholder: '...'
                  }
                );
                isLiveLocationOn ? stopMyLiveLocation() : "";
              }}
              style={styles.buttonContainer}
            >
              <Text style={[styles.actionButton, GoogleInput ? {opacity: 0} : null]}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPressIn={() => {
                setModalVisible(true);
                stopMyLiveLocation();
              }}
              style={styles.buttonContainer}
            >
              <Text style={[styles.actionButton, GoogleInput ? {opacity: 0} : null]}>Places</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <PlacesModal
          places={places}
          theName={theName}
          setTheName={setTheName}
          theId={theId}
          geocoder={geocoder}
          editPrompt={editPrompt}
          refresh={refresh}
          setEditPrompt={setEditPrompt}
          setModalVisible={setModalVisible}
          lat={lat}
          long={long}
          showPlace={showPlace}
          setPlaceId={setPlaceId}
          placeId={placeId}
          stopMyLiveLocation={stopMyLiveLocation}
          modalVisible={modalVisible}
          PlaceModalVisible={PlaceModalVisible}
          setPlaceModalVisible={setPlaceModalVisible}
        />

      {GoogleInput ? (
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
              fields: "geometry,name,formatted_address,place_id,types"
            }}

            styles={{
              container: {
                flex: 0,
                position: 'absolute',
                width: '100%',
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
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                borderRadius: 8,
                marginTop: 2,
                maxHeight: 300,
                borderWidth: 1,
                borderColor: '#ddd',
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
              }
              else {
                console.log("NO COORDINATES FOUND - check the data structure above");
              }
              
              if (lat && lng) {
                console.log("Navigating to:", lat, lng);
                stopMyLiveLocation();
                setLat(lat);
                setLong(lng);
                setLongD(0.00867);
                setDisplay(
                  `lat: ${lat.toFixed(7)}, long: ${lng.toFixed(7)}`
                );
                setLocations([{ lat, long: lng }]);
              }
              
              showGoogleInput(false);
            }}
            onFail={(error) => {
              console.log("Google Places API FAILED:", error);
              console.log("API Key being used:", GOOGLE_MAPS_API_KEY ? "Key exists" : "NO API KEY");
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
        ) : null}

      <Modality
          places={places}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          setTheName={setTheName}
          theName={theName}
          showPlaces={showPlaces}
          stopMyLiveLocation={stopMyLiveLocation}
                      startMyLiveLocation={startMyLiveLocation}
          googleInput={false}
          mapRef={mapRef}
          refresh={refresh}
          importModalVisible={importModalVisible}
          setImportModalVisible={setImportModalVisible}
          setLat={setLat}
          setLong={setLong}
          setTheId={setTheId}
          setDisplay={setDisplay}
          confirmDeletePlace={confirmDeletePlace}
          setPlaceModalVisible={setPlaceModalVisible}
                    showGoogleInput={showGoogleInput}
        />

      {/* Import Button - Absolutely positioned to screen bottom-right */}
      {showControls && !GoogleInput && !modalVisible && !PlaceModalVisible && !importModalVisible ? (
        <TouchableOpacity
          style={styles.importButton}
          onPress={() => setImportModalVisible(true)}
        >
          <Text style={styles.importButtonText}>⬇</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  controlsContainer: {
    marginTop: 28,
    alignItems: "center",
  },
  topRow: {
    alignItems: "center",
    marginBottom: -15,
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -12,
  },
  bottomRow: {
    alignItems: "center",

  },
  buttonContainer: {
    margin: 5,
  },

  directionButton: {
    color: "white",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 32,
    width: 52,
    height: 52,
    borderRadius: 12,
    padding: 8,
    backgroundColor: "black",
    textAlignVertical: "center",
  },
  zoomButton: {
    color: "white",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 32,
    width: 52,
    height: 52,
    borderRadius: 12,
    padding: 8,
    backgroundColor: "black",
    textAlignVertical: "center",
    marginTop: 10,
  },
  centerImage: {
    height: 41,
    width: 41,
    marginTop: 19,

  },
  actionButtonsRow: {
    flexDirection: "row",
    
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
    width: "100%",
  },
  actionButton: {
    color: "white",
    textAlign: "center",
    fontSize: 22,
    paddingBottom: 35,
    fontWeight: "bold",
    borderRadius: 12,
    paddingVertical: 1,
  
    backgroundColor: "black",
    minWidth: 90,
  },
 
  autoStyle: {
    marginLeft: "auto",
    marginBottom: "-40%",
    color: "white",
    textAlign: "center",
    fontSize: 39,
    borderRadius: 12,
    padding: 6,
    backgroundColor: "black",
    marginTop: -1,
  },

  buttonStyle: {
    marginBottom: "5%",
    marginRight: "2%",
    marginBottom: "1%",
    color: "white",
    textAlign: "center",
    fontSize: 24,
    borderRadius: 12,
    padding: 6,
    backgroundColor: "black",
    marginTop: 2,
  },

  modalItemStyle: { fontSize: 16, textAlign: "center", color: "white" },
  modalHeaderStyle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  importButton: {
    position: 'absolute',
    right: 10,
    bottom: 30,
    backgroundColor: 'black',
    width: 30,
    height: 30,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 9999,
  },
  importButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
