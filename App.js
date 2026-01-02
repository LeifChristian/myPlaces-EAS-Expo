import 'react-native-get-random-values';
import "./components/app/XhrTimeoutFix";
import React, { useState, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from 'uuid';
import * as Location from "expo-location";
import Constants from 'expo-constants';
import FtueScreen from "./components/ftue";
import Modality from "./components/modal";
import PlacesModal from "./components/placesModal";
import axios from "axios";

import MapCanvas from "./components/map/MapCanvas";
import PlacesSearchOverlay from "./components/search/PlacesSearchOverlay";
import MapTypeToggle from "./components/controls/MapTypeToggle";
import LiveLocationToggle from "./components/controls/LiveLocationToggle";
import MovementControls from "./components/controls/MovementControls";
import ActionButtons from "./components/controls/ActionButtons";
import ImportButton from "./components/controls/ImportButton";
import PlacesList from "./components/places/PlacesList";
import {
  addPlaceToStorage,
  confirmDeletePlace as confirmDeletePlaceService,
  deletePlaceFromStorage,
  refreshPlaces,
} from "./components/places/placesService";
import { styles } from "./components/app/appStyles";
import useAppBootstrap from "./components/hooks/useAppBootstrap";
import useLiveLocation from "./components/hooks/useLiveLocation";
import {
  getCurrentLocationAndSet,
  handleLongPress,
  handleMapPress,
  reverseGeocodeCurrent,
} from "./components/map/mapInteractions";
import { moveMap } from "./components/map/mapMovement";

// Get Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || 'YOUR_API_KEY_HERE';
console.log("Google Maps API Key loaded:", GOOGLE_MAPS_API_KEY ? "✓ Key found" : "✗ NO KEY");

import {
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";

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
  const locationsRef = useRef(locations);
  useEffect(() => {
    locationsRef.current = locations;
  }, [locations]);
  //set initial region as "home" location for new users
  let region = {
    latitude: lat,
    latitudeDelta: latD,
    longitude: long,
    longitudeDelta: longD,
  };

  //get location permission and set location watch. check for places in localstorage and display them.
  useAppBootstrap({
    setPlaces,
    setLocations,
    setDisplay,
    setLat,
    setLong,
    setWatcher,
    setAppReady,
    locationsRef,
  });

  //refresh function to update places after edit, delete or add
  const refresh = async () => {
    return refreshPlaces({ setPlaces });
  };

  //add a place and save to localStorage
  const addPlace = async (text) => {
    return addPlaceToStorage({ text, locations, refresh });
  };

  //confirm place to be deleted on delete button press
  const confirmDeletePlace = (id, lat, name) => {
    return confirmDeletePlaceService({
      id,
      lat,
      name,
      onConfirm: () => deletePlace(id, lat, name),
    });
  };

  //delete a place upon confirmation
  const deletePlace = async (id, lat) => {
    return deletePlaceFromStorage({
      id,
      lat,
      locations,
      refresh,
      setTheName,
      setTheId,
      setModalVisible,
    });
  };

  //show individual places
  const showPlaces = () => {
    return (
      <PlacesList
        places={places}
        mapRef={mapRef}
        setLat={setLat}
        setLong={setLong}
        setTheName={setTheName}
        setTheId={setTheId}
        setDisplay={setDisplay}
        setModalVisible={setModalVisible}
        stopMyLiveLocation={stopMyLiveLocation}
        setPlaceModalVisible={setPlaceModalVisible}
        confirmDeletePlace={confirmDeletePlace}
      />
    );
  };

  //move functionality for up, down, left, right, and zoom.
  //amount to be moved in any direction is determined as a ratio to zoom level

  const { stopMyLiveLocation, startMyLiveLocation } = useLiveLocation({
    isLiveLocationOn,
    watcher,
    setWatcher,
    setIsLiveLocationOn,
    setLocations,
    setDisplay,
    setLat,
    setLong,
    locationsRef,
  });

  const move = (direction) => {
    return moveMap({
      direction,
      lat,
      long,
      latD,
      longD,
      setTheName,
      setTheId,
      stopMyLiveLocation,
      setLong,
      setLat,
      setDisplay,
      setLocations,
      setLongD,
      setLatD,
      display,
    });
  };

  const showPlace = async () => {
    return reverseGeocodeCurrent({ lat, long, setPlaceId, setGeocoder });
  };

  const showMyLocation = async () => {
    return getCurrentLocationAndSet({
      setTheName,
      setTheId,
      setLat,
      setLong,
      setLongD,
      setLatD,
      setDisplay,
    });
  };

  const onMapPress = (e) => {
    return handleMapPress({
      e,
      setTheName,
      setLocations,
      setLat,
      setLong,
      setDisplay,
    });
  };

  const onLongPress = async (e) => {
    return handleLongPress({
      e,
      GOOGLE_MAPS_API_KEY,
      setDisplay,
      setModalVisible,
      setPlaceModalVisible,
      showPlace,
      setPlaceId,
      placeId,
      axios,
    });
  };
  
  //core of app display.
  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} hidden={false} />
      <MapTypeToggle showControls={showControls} mapType={mapType} setMapType={setMapType} />

      {appReady ? (
        <FtueScreen
          pagekey={"uniquekey"}
          title={"categort title"}
          description={"topic description"}
          setFtueVisible={setFtueVisible}
        />
      ) : null}

      <MapCanvas
        mapRef={mapRef}
        mapType={mapType}
        region={region}
        places={places}
        latD={latD}
        longD={longD}
        setLat={setLat}
        setLong={setLong}
        setDisplay={setDisplay}
        setTheName={setTheName}
        setTheId={setTheId}
        onMapPress={onMapPress}
        onLongPress={onLongPress}
        stopMyLiveLocation={stopMyLiveLocation}
      />
   

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

      <LiveLocationToggle
        showControls={showControls}
        isLiveLocationOn={isLiveLocationOn}
        stopMyLiveLocation={stopMyLiveLocation}
        startMyLiveLocation={startMyLiveLocation}
      />

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
            maxWidth: "80%",
            fontSize: 22,
            textAlign: "center",
          }}
        >
          {theName}
        </Text>
      ) : null}

      <MovementControls
        showControls={showControls}
        move={move}
        showMyLocation={showMyLocation}
        startMyLiveLocation={startMyLiveLocation}
      >
        <ActionButtons
          showControls={true}
          GoogleInput={GoogleInput}
          addPlace={addPlace}
          isLiveLocationOn={isLiveLocationOn}
          stopMyLiveLocation={stopMyLiveLocation}
          setModalVisible={setModalVisible}
        />
      </MovementControls>

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

      <PlacesSearchOverlay
        visible={GoogleInput}
        GOOGLE_MAPS_API_KEY={GOOGLE_MAPS_API_KEY}
        stopMyLiveLocation={stopMyLiveLocation}
        setLat={setLat}
        setLong={setLong}
        setLongD={setLongD}
        setDisplay={setDisplay}
        setLocations={setLocations}
        showGoogleInput={showGoogleInput}
      />

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
      <ImportButton
        show={
          showControls &&
          !GoogleInput &&
          !modalVisible &&
          !PlaceModalVisible &&
          !importModalVisible
        }
        setImportModalVisible={setImportModalVisible}
      />
    </View>
  );
}
