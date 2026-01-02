/**
 * Central place to build component prop objects so App.js stays readable.
 * No behavior changes intended: this file only repackages existing values.
 */
export default function componentPropRegistry({
  state,
  setters,
  refs,
  handlers,
  derived,
}) {
  const { mapRef } = refs;

  const {
    places,
    theName,
    theId,
    geocoder,
    editPrompt,
    lat,
    long,
    latD,
    longD,
    display,
    modalVisible,
    PlaceModalVisible,
    importModalVisible,
    GoogleInput,
    mapType,
    isLiveLocationOn,
    showControls,
    region,
  } = state;

  const {
    setTheName,
    setTheId,
    setGeocoder,
    setEditPrompt,
    setLat,
    setLong,
    setLatD,
    setLongD,
    setDisplay,
    setLocations,
    setModalVisible,
    setPlaceModalVisible,
    setImportModalVisible,
    showGoogleInput,
    setMapType,
    setPlaceId,
  } = setters;

  const {
    refresh,
    addPlace,
    confirmDeletePlace,
    stopMyLiveLocation,
    startMyLiveLocation,
    move,
    showPlace,
    showMyLocation,
    onMapPress,
    onLongPress,
    showPlaces,
  } = handlers;

  const { GOOGLE_MAPS_API_KEY, placeId } = derived;

  const mapTypeToggleProps = {
    showControls,
    mapType,
    setMapType,
  };

  const mapCanvasProps = {
    mapRef,
    mapType,
    region,
    places,
    latD,
    longD,
    setLat,
    setLong,
    setDisplay,
    setTheName,
    setTheId,
    onMapPress,
    onLongPress,
    stopMyLiveLocation,
  };

  const liveLocationToggleProps = {
    showControls,
    isLiveLocationOn,
    stopMyLiveLocation,
    startMyLiveLocation,
  };

  const movementControlsProps = {
    showControls,
    move,
    showMyLocation,
    startMyLiveLocation,
  };

  const actionButtonsProps = {
    showControls: true,
    GoogleInput,
    addPlace,
    isLiveLocationOn,
    stopMyLiveLocation,
    setModalVisible,
  };

  const placesSearchOverlayProps = {
    visible: GoogleInput,
    GOOGLE_MAPS_API_KEY,
    stopMyLiveLocation,
    setLat,
    setLong,
    setLongD,
    setDisplay,
    setLocations,
    showGoogleInput,
  };

  const importButtonProps = {
    show:
      showControls &&
      !GoogleInput &&
      !modalVisible &&
      !PlaceModalVisible &&
      !importModalVisible,
    setImportModalVisible,
  };

  const placesModalProps = {
    places,
    theName,
    setTheName,
    theId,
    geocoder,
    editPrompt,
    refresh,
    setEditPrompt,
    setModalVisible,
    lat,
    long,
    showPlace,
    setPlaceId,
    placeId,
    stopMyLiveLocation,
    modalVisible,
    PlaceModalVisible,
    setPlaceModalVisible,
  };

  const modalProps = {
    places,
    modalVisible,
    setModalVisible,
    setTheName,
    theName,
    showPlaces,
    stopMyLiveLocation,
    startMyLiveLocation,
    googleInput: false,
    mapRef,
    refresh,
    importModalVisible,
    setImportModalVisible,
    setLat,
    setLong,
    setTheId,
    setDisplay,
    confirmDeletePlace,
    setPlaceModalVisible,
    showGoogleInput,
  };

  return {
    mapTypeToggleProps,
    mapCanvasProps,
    liveLocationToggleProps,
    movementControlsProps,
    actionButtonsProps,
    placesSearchOverlayProps,
    importButtonProps,
    placesModalProps,
    modalProps,
  };
}


