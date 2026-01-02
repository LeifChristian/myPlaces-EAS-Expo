import { useEffect, useRef, useState } from "react";

import initializeLocationAndPlaces from "./initializeLocationAndPlaces";

// Centralizes App-level state + refs so App.js stays slim.
export default function appState() {
  const [editPrompt, setEditPrompt] = useState(false);
  const [placeId, setPlaceId] = useState(null);
  const [locations, setLocations] = useState(null);
  const [lat, setLat] = useState(40.758896);
  const [latD, setLatD] = useState(0.421);
  const [long, setLong] = useState(-73.98513);
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

  // set initial region as "home" location for new users
  const region = {
    latitude: lat,
    latitudeDelta: latD,
    longitude: long,
    longitudeDelta: longD,
  };

  initializeLocationAndPlaces({
    setPlaces,
    setLocations,
    setDisplay,
    setLat,
    setLong,
    setWatcher,
    setAppReady,
    locationsRef,
  });

  return {
    state: {
      editPrompt,
      placeId,
      locations,
      lat,
      latD,
      long,
      longD,
      places,
      display,
      modalVisible,
      GoogleInput,
      mapType,
      isLiveLocationOn,
      watcher,
      theName,
      theId,
      PlaceModalVisible,
      importModalVisible,
      ftueVisible,
      appReady,
      geocoder,
      showControls,
      region,
    },
    setters: {
      setEditPrompt,
      setPlaceId,
      setLocations,
      setLat,
      setLatD,
      setLong,
      setLongD,
      setPlaces,
      setDisplay,
      setModalVisible,
      showGoogleInput,
      setMapType,
      setIsLiveLocationOn,
      setWatcher,
      setTheName,
      setTheId,
      setPlaceModalVisible,
      setImportModalVisible,
      setFtueVisible,
      setAppReady,
      setGeocoder,
    },
    refs: {
      mapRef,
      locationsRef,
    },
  };
}


