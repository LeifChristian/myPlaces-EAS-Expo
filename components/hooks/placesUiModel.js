import React from "react";

import PlacesList from "../places/PlacesList";
import {
  addPlaceToStorage,
  confirmDeletePlace as confirmDeletePlaceService,
  deletePlaceFromStorage,
  refreshPlaces,
} from "../places/placesService";

// Builds places-related handlers + props objects.
export default function placesUiModel({ state, setters, refs, mapHandlers }) {
  const refresh = async () => refreshPlaces({ setPlaces: setters.setPlaces });

  const addPlace = async (text) =>
    addPlaceToStorage({ text, locations: state.locations, refresh });

  const deletePlace = async (id) =>
    deletePlaceFromStorage({
      id,
      locations: state.locations,
      refresh,
      setTheName: setters.setTheName,
      setTheId: setters.setTheId,
      setModalVisible: setters.setModalVisible,
    });

  const confirmDeletePlace = (id, lat, name) =>
    confirmDeletePlaceService({
      id,
      name,
      onConfirm: () => deletePlace(id),
    });

  const showPlaces = () => (
    <PlacesList
      places={state.places}
      mapRef={refs.mapRef}
      setLat={setters.setLat}
      setLong={setters.setLong}
      setTheName={setters.setTheName}
      setTheId={setters.setTheId}
      setDisplay={setters.setDisplay}
      setModalVisible={setters.setModalVisible}
      stopMyLiveLocation={mapHandlers.stopMyLiveLocation}
      setPlaceModalVisible={setters.setPlaceModalVisible}
      confirmDeletePlace={confirmDeletePlace}
    />
  );

  const actionButtonsProps = {
    showControls: true,
    GoogleInput: state.GoogleInput,
    addPlace,
    isLiveLocationOn: state.isLiveLocationOn,
    stopMyLiveLocation: mapHandlers.stopMyLiveLocation,
    setModalVisible: setters.setModalVisible,
  };

  const importButtonProps = {
    show:
      state.showControls &&
      !state.GoogleInput &&
      !state.modalVisible &&
      !state.PlaceModalVisible &&
      !state.importModalVisible,
    setImportModalVisible: setters.setImportModalVisible,
  };

  const placesModalProps = {
    places: state.places,
    theName: state.theName,
    setTheName: setters.setTheName,
    theId: state.theId,
    geocoder: state.geocoder,
    editPrompt: state.editPrompt,
    refresh,
    setEditPrompt: setters.setEditPrompt,
    setModalVisible: setters.setModalVisible,
    lat: state.lat,
    long: state.long,
    showPlace: mapHandlers.showPlace,
    setPlaceId: setters.setPlaceId,
    placeId: state.placeId,
    stopMyLiveLocation: mapHandlers.stopMyLiveLocation,
    modalVisible: state.modalVisible,
    PlaceModalVisible: state.PlaceModalVisible,
    setPlaceModalVisible: setters.setPlaceModalVisible,
  };

  const modalProps = {
    places: state.places,
    modalVisible: state.modalVisible,
    setModalVisible: setters.setModalVisible,
    setTheName: setters.setTheName,
    theName: state.theName,
    showPlaces,
    stopMyLiveLocation: mapHandlers.stopMyLiveLocation,
    startMyLiveLocation: mapHandlers.startMyLiveLocation,
    googleInput: false,
    mapRef: refs.mapRef,
    refresh,
    importModalVisible: state.importModalVisible,
    setImportModalVisible: setters.setImportModalVisible,
    setLat: setters.setLat,
    setLong: setters.setLong,
    setTheId: setters.setTheId,
    setDisplay: setters.setDisplay,
    confirmDeletePlace,
    setPlaceModalVisible: setters.setPlaceModalVisible,
    showGoogleInput: setters.showGoogleInput,
  };

  return {
    handlers: {
      refresh,
      addPlace,
      confirmDeletePlace,
      showPlaces,
    },
    props: {
      actionButtonsProps,
      importButtonProps,
      placesModalProps,
      modalProps,
    },
  };
}


