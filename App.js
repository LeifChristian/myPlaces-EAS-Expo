import { React, useState, useEffect, useRef } from "react";
import MapView from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dimensions } from 'react-native';
import { Marker } from "react-native-maps";
import uuid from "react-native-uuid";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Geocoder from "react-native-geocoding";
import * as Location from "expo-location";
import FtueScreen from "./components/ftue";
import Modality from "./components/modal";
import PlacesModal from "./components/placesModal";
import Prompt from "react-native-input-prompt";
import axios from "axios";
import ScaleBar from "react-native-map-scale-bar";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

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
  const [addPrompt, setaddPrompt] = useState(false);

  const [GoogleInput, showGoogleInput] = useState(false);
  const [mapType, setMapType] = useState("standard");
  const [isLiveLocationOn, setIsLiveLocationOn] = useState(true);
  const [watcher, setWatcher] = useState(null);

  const [theName, setTheName] = useState(null);
  const [theId, setTheId] = useState(null);
  const [PlaceModalVisible, setPlaceModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);

  const [geocoder, setGeocoder] = useState("");
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

      //Get location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      console.log(location, "current location");

      // watch current position
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

      console.log(locations, "locations");

      //get places from localstorage

      try {
        const value = await AsyncStorage.getItem("places");

        let placeObject = {
          lat: lat,
          long: long,
          id: uuid.v4(),
          name: "home",
        };

        const myArray = [placeObject];

        // if items exist in local storage, parse and set places
        if (value !== null) {
          const myreturn = await AsyncStorage.getItem("places");
          const parseley = JSON.parse(myreturn);
          console.log(parseley, "places from AsyncStorage");
          setPlaces(parseley);
        }

        // if no items, set one sample item called home
        if (value == null || !value) {
          console.log("no items");

          await AsyncStorage.setItem("places", JSON.stringify(myArray));

          const myreturn = await AsyncStorage.getItem("places");

          const parseley = JSON.parse(myreturn);
          console.log(parseley, "parsed returned");
          setPlaces(parseley);
        }
      } catch (e) {
        // error reading value
      }
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
    //toggle add place prompt
    setaddPrompt(true);
    console.log(locations, " locations");
    console.log(text, "text");

    try {
      //set object structure of new place

      const newPlace = {
        lat: parseFloat(locations[0].lat),
        long: parseFloat(locations[0].long),
        id: uuid.v4(),
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
          anchor={{ x: 0.5, y: 0.5 }}
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

  const showPlace = () => {
    Geocoder.init("AIzaSyDgf-kFLAr50LunR7vDOwvWG6ZgDc9OQHQ", {
      language: "en",
    });

    Geocoder.from(lat, long).then((json) => {
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
    });
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

    Geocoder.init("AIzaSyDgf-kFLAr50LunR7vDOwvWG6ZgDc9OQHQ", {
      language: "en",
    });

    Geocoder.from(
      e.nativeEvent.coordinate.latitude,
      e.nativeEvent.coordinate.longitude
    ).then((json) => {
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
        url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=AIzaSyDgf-kFLAr50LunR7vDOwvWG6ZgDc9OQHQ`,
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
    });
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
      {mapType == "standard" ? (
        <TouchableOpacity
          style={{ marginTop: 40, marginBottom: -135, zIndex: 2 }}
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
          style={{ marginTop: 40, marginBottom: -135, zIndex: 2 }}
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
      )}

      <FtueScreen
        pagekey={"uniquekey"}
        title={"categort title"}
        description={"topic description"}
      />

      <MapView
        userInterfaceStyle={"dark"}
        ref={mapRef}
        zoomEnabled={true}
        mapType={mapType}
        style={{ marginTop: "12%", height: "68%", width: "100%" }}
        showsUserLocation={true}
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
        region={region}
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

      <View style={{ backgroundColor: "black" }}></View>

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

      {isLiveLocationOn ? (
        <TouchableOpacity
          onPressIn={() => {
            stopMyLiveLocation();
          }}
        >
          <Text
            style={{
              marginTop: 4,
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
              marginTop: 4,
              marginLeft: 300,
              height: 80,
              marginBottom: -68,
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
      )}

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

      <Prompt
        style={{ backgroundColor: "black" }}
        visible={addPrompt}
        title="Name Your Place"
        placeholder="..."
        submitText={"Save"}
        cancelText={"Cancel"}
        titleStyle={{ color: "black" }}
        onCancel={() => {
          setaddPrompt(false);
        }}
        onSubmit={(text) => {
          text.length == 0 ? (text = "untitled") : "";
          addPlace(text);
          setaddPrompt(false);
        }}
      />
<View style={{marginTop: 28}}>
      <View style={[styles.group, styles.top]}>
        <TouchableOpacity
          onPressIn={() => {
            move("up");
          }}
        >
          <Text style={[styles.up, ]}>↑</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.group }>
        <TouchableOpacity
          onPressIn={() => {
            move("minus");
          }}
        >
          <Text style={[styles.minus, { marginTop:-2.5, width: 'auto', marginLeft: -7}]}>--</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPressIn={() => {
            move("left");
          }}
        >
          <Text style={[styles.leftRight, ]}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {showMyLocation(); startMyLiveLocation()}}>
          <Image
            style={{
              height: 41,
              width: 41,
              marginTop: 6.5,
              left:1,
              marginBottom: -200,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
            source={require("./images/center.png")}
          ></Image>
        </TouchableOpacity>

        <TouchableOpacity
          onPressIn={() => {
            move("right");
          }}
        >
          <Text style={[styles.leftRight, ]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPressIn={() => {
            move("plus");
          }}
        >
          <Text style={[styles.plus, {marginTop:-2.5}]}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.group}>
        <TouchableOpacity
          onPressIn={() => {
            move("down");
          }}
        >
          <Text style={[styles.Down]}>↓</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.group}>
        <TouchableOpacity
          onPressIn={() => {
            setaddPrompt(true);

            isLiveLocationOn ? stopMyLiveLocation() : "";
          }}
        >
          {!GoogleInput ? <Text style={[styles.buttonStyleAdd, ]}>Add</Text> : null}
        </TouchableOpacity>



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
            GooglePlacesDetailsQuery={{ fields: "geometry" }}
            visible={GoogleInput}
            isRowScrollable={true}
            styles={{
              textInput: {
                marginTop: -490,
                marginLeft: 17,
                height: 50,
                color: "black",
                fontSize: 16,
              },

              listView: {
                marginTop: -450,
                textAlign: "center",
                height: 22,
                marginLeft: -5,
                width: "110%",
              },
              row: {
                backgroundColor: "#FFFFFF",
                padding: 13,
                height: 44,
                width: 600,
                flexDirection: "row",
              },
            }}
            fetchDetails={true}
            placeholder="Search"
            onPress={(data, details = null) => {
              // 'details' is provided when fetchDetails = true
              // console.log(data, details);
              console.log(details.geometry.location.lat);
              console.log(details.geometry.location.lng);

              stopMyLiveLocation();
              setLat(details.geometry.location.lat);
              setLong(details.geometry.location.lng);
              setLongD(0.00867);
              setDisplay(
                `lat: ${details.geometry.location.lat.toFixed(
                  7
                )}, long: ${details.geometry.location.lng.toFixed(7)}`
              );
              setLocations([
                {
                  lat: details.geometry.location.lat,
                  long: details.geometry.location.lng,
                },
              ]);
              showGoogleInput((prevState) => !prevState);
            }}
            query={{
              key: "AIzaSyDgf-kFLAr50LunR7vDOwvWG6ZgDc9OQHQ",
              language: "en",
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
                      showMyLiveLocation={startMyLiveLocation}
          googleInput={!GoogleInput}
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
      </View>

      {/* Import Button - Absolutely positioned to screen bottom-right */}
      <TouchableOpacity
        style={styles.importButton}
        onPress={() => setImportModalVisible(true)}
      >
        {!GoogleInput ? <Text style={styles.importButtonText}>⬇</Text> : null}
      </TouchableOpacity>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  top: { marginTop: "10%", zIndex: -12 },
  group: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: -1, // Added bottom margin
  },

  leftRight: {
    color: "white",
    marginLeft: "3%",
    marginTop: -7,
    marginBottom: "2%",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 32,
    width: 52,
    borderRadius: 12,
    padding: 6,
    backgroundColor: "black",
  },
  plus: {
    color: "white",
    marginRight: 1.4,
    marginLeft: -12,
    marginTop: 1,
    fontWeight: "900",
    textAlign: "center",
    padding: 8,
    fontSize: 32,
    width: 52,
    borderRadius: 12,
    backgroundColor: "black",
  },
  minus: {
    color: "white",
    marginTop: 6, // Updated margin value
    fontWeight: "900",
    marginRight: 2,
    textAlign: "center",
    fontSize: 32,
    borderRadius: 12,
    padding: 6,
    backgroundColor: "black",
  },
  
  up: {
    color: "white",
    marginLeft: "1%",
    marginTop: -31, // Updated margin value
    marginRight: "1%",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 32,
    width: 52,
    borderRadius: 12,
    padding: 4,
    backgroundColor: "black",
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
    marginTop: "5%",
    marginRight: "8%",
    marginBottom: "1%",
    color: "white",
    textAlign: "center",
    fontSize: 24,
    borderRadius: 12,
    padding: 6,
    backgroundColor: "black",
    marginTop: 2,
  },

  buttonStyleAdd: {
    marginTop: 2,
    marginBottom: 3, // Adjusted margin value
    marginRight: "8%",
    marginLeft: 11,
    color: "white",
    textAlign: "center",
    fontSize: 25,
    borderRadius: 12,
    padding: 8,
    backgroundColor: "black",
    marginTop: 0, // Adjusted margin value
  },
  
  Down: {
    marginBottom: "-10%",
    color: "white",
    marginRight: "2%",
    fontWeight: "800",
    textAlign: "center",
    fontSize: 28,
    width: 52,
    borderRadius: 12,
    padding: 6,
    backgroundColor: "black",
    marginTop: -11.6,
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
    left: -42,
    bottom: -20,
    backgroundColor: 'transparent',
    width: 40,
    height: 40,
    borderRadius: 20,
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
