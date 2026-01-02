import 'react-native-get-random-values';
import "./components/app/XhrTimeoutFix";
import React, { useState, useRef, useEffect } from "react";
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
import { styles } from "./components/app/appStyles";
import appState from "./components/hooks/appState";
import mapUiModel from "./components/hooks/mapUiModel";
import placesUiModel from "./components/hooks/placesUiModel";

// Get Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey
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
  const { state, setters, refs } = appState();

  const mapModel = mapUiModel({
    state,
    setters,
    refs,
    derived: { GOOGLE_MAPS_API_KEY, axios },
  });

  const placesModel = placesUiModel({
    state,
    setters,
    refs,
    mapHandlers: mapModel.handlers,
  });
  
  //core of app display.
  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} hidden={false} />
      <MapTypeToggle {...mapModel.props.mapTypeToggleProps} />

      {state.appReady ? (
        <FtueScreen
          pagekey={"uniquekey"}
          title={"categort title"}
          description={"topic description"}
          setFtueVisible={setters.setFtueVisible}
        />
      ) : null}

      <MapCanvas {...mapModel.props.mapCanvasProps} />
   

      {/* <ScaleBar zoom={(longD/latD)} latitude={latD}>{console.log((latD, longD + 'nice'))}</ScaleBar> */}

      {state.showControls ? (
        <View style={{ backgroundColor: "black" }}></View>
      ) : null}

      {state.showControls ? (
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
          {state.display == "null" ? "" : state.display}
        </Text>
      ) : null}

      <LiveLocationToggle {...mapModel.props.liveLocationToggleProps} />

      {state.showControls ? (
        <TouchableOpacity
          style={styles.googleButton}
          onPressIn={() => {
            setters.showGoogleInput((prevState) => !prevState);
            mapModel.handlers.stopMyLiveLocation();
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

      {state.showControls ? (
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
          {state.theName}
        </Text>
      ) : null}

      <MovementControls {...mapModel.props.movementControlsProps}>
        <ActionButtons {...placesModel.props.actionButtonsProps} />
      </MovementControls>

      <PlacesModal placesModalProps={placesModel.props.placesModalProps} />

      <PlacesSearchOverlay {...mapModel.props.placesSearchOverlayProps} />

      <Modality modalProps={placesModel.props.modalProps} />
      
      <ImportButton {...placesModel.props.importButtonProps} />
    </View>
  );
}
