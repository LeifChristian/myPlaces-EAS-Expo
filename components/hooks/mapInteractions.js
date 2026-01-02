import { useCallback } from "react";
import {
  getCurrentLocationAndSet,
  handleLongPress,
  handleMapPress,
  reverseGeocodeCurrent,
} from "../map/mapInteractions";

// Returns map interaction handlers (press/long-press + helper actions).
// Extracted from App.js; behavior intentionally unchanged.
export default function mapInteractions({
  lat,
  long,
  setPlaceId,
  setGeocoder,
  setTheName,
  setTheId,
  setLat,
  setLong,
  setLongD,
  setLatD,
  setDisplay,
  setLocations,
  setModalVisible,
  setPlaceModalVisible,
  placeId,
  GOOGLE_MAPS_API_KEY,
  axios,
}) {
  const showPlace = useCallback(async () => {
    return reverseGeocodeCurrent({ lat, long, setPlaceId, setGeocoder });
  }, [lat, long, setPlaceId, setGeocoder]);

  const showMyLocation = useCallback(async () => {
    return getCurrentLocationAndSet({
      setTheName,
      setTheId,
      setLat,
      setLong,
      setLongD,
      setLatD,
      setDisplay,
    });
  }, [setTheName, setTheId, setLat, setLong, setLongD, setLatD, setDisplay]);

  const onMapPress = useCallback(
    (e) => {
      return handleMapPress({
        e,
        setTheName,
        setLocations,
        setLat,
        setLong,
        setDisplay,
      });
    },
    [setTheName, setLocations, setLat, setLong, setDisplay]
  );

  const onLongPress = useCallback(
    async (e) => {
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
    },
    [
      GOOGLE_MAPS_API_KEY,
      setDisplay,
      setModalVisible,
      setPlaceModalVisible,
      showPlace,
      setPlaceId,
      placeId,
      axios,
    ]
  );

  return { showPlace, showMyLocation, onMapPress, onLongPress };
}


