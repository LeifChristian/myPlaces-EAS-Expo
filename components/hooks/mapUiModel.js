import liveLocation from "./liveLocation";
import mapInteractions from "./mapInteractions";
import mapMovement from "./mapMovement";

// Builds map-related handlers + props objects.
export default function mapUiModel({ state, setters, refs, derived }) {
  const { GOOGLE_MAPS_API_KEY, axios } = derived;

  const { stopMyLiveLocation, startMyLiveLocation } = liveLocation({
    isLiveLocationOn: state.isLiveLocationOn,
    watcher: state.watcher,
    setWatcher: setters.setWatcher,
    setIsLiveLocationOn: setters.setIsLiveLocationOn,
    setLocations: setters.setLocations,
    setDisplay: setters.setDisplay,
    setLat: setters.setLat,
    setLong: setters.setLong,
    locationsRef: refs.locationsRef,
  });

  const { move } = mapMovement({
    lat: state.lat,
    long: state.long,
    latD: state.latD,
    longD: state.longD,
    display: state.display,
    setTheName: setters.setTheName,
    setTheId: setters.setTheId,
    stopMyLiveLocation,
    setLong: setters.setLong,
    setLat: setters.setLat,
    setDisplay: setters.setDisplay,
    setLocations: setters.setLocations,
    setLongD: setters.setLongD,
    setLatD: setters.setLatD,
  });

  const { showPlace, showMyLocation, onMapPress, onLongPress } = mapInteractions({
    lat: state.lat,
    long: state.long,
    setPlaceId: setters.setPlaceId,
    setGeocoder: setters.setGeocoder,
    setTheName: setters.setTheName,
    setTheId: setters.setTheId,
    setLat: setters.setLat,
    setLong: setters.setLong,
    setLongD: setters.setLongD,
    setLatD: setters.setLatD,
    setDisplay: setters.setDisplay,
    setLocations: setters.setLocations,
    setModalVisible: setters.setModalVisible,
    setPlaceModalVisible: setters.setPlaceModalVisible,
    placeId: state.placeId,
    GOOGLE_MAPS_API_KEY,
    axios,
  });

  const mapTypeToggleProps = {
    showControls: state.showControls,
    mapType: state.mapType,
    setMapType: setters.setMapType,
  };

  const mapCanvasProps = {
    mapRef: refs.mapRef,
    mapType: state.mapType,
    region: state.region,
    places: state.places,
    latD: state.latD,
    longD: state.longD,
    setLat: setters.setLat,
    setLong: setters.setLong,
    setDisplay: setters.setDisplay,
    setTheName: setters.setTheName,
    setTheId: setters.setTheId,
    onMapPress,
    onLongPress,
    stopMyLiveLocation,
  };

  const liveLocationToggleProps = {
    showControls: state.showControls,
    isLiveLocationOn: state.isLiveLocationOn,
    stopMyLiveLocation,
    startMyLiveLocation,
  };

  const movementControlsProps = {
    showControls: state.showControls,
    move,
    showMyLocation,
    startMyLiveLocation,
  };

  const placesSearchOverlayProps = {
    visible: state.GoogleInput,
    GOOGLE_MAPS_API_KEY,
    stopMyLiveLocation,
    setLat: setters.setLat,
    setLong: setters.setLong,
    setLongD: setters.setLongD,
    setDisplay: setters.setDisplay,
    setLocations: setters.setLocations,
    showGoogleInput: setters.showGoogleInput,
  };

  return {
    handlers: {
      stopMyLiveLocation,
      startMyLiveLocation,
      move,
      showPlace,
      showMyLocation,
      onMapPress,
      onLongPress,
    },
    props: {
      mapTypeToggleProps,
      mapCanvasProps,
      liveLocationToggleProps,
      movementControlsProps,
      placesSearchOverlayProps,
    },
  };
}


