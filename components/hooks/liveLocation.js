import { useCallback, useRef } from "react";
import * as Location from "expo-location";

// Extracted from App.js start/stop live location. Keeps same side effects/guards.
export default function liveLocation({
  isLiveLocationOn,
  watcher,
  setWatcher,
  setIsLiveLocationOn,
  setLocations,
  setDisplay,
  setLat,
  setLong,
  locationsRef,
}) {
  const isLiveLocationOnRef = useRef(isLiveLocationOn);
  isLiveLocationOnRef.current = isLiveLocationOn;

  const stopMyLiveLocation = useCallback(async () => {
    // Only stop if currently running
    if (!isLiveLocationOnRef.current) {
      return;
    }

    console.log("Stopping live location");

    if (watcher) {
      await watcher.remove();
      setWatcher(null);
    }

    // Explicitly set to OFF
    setIsLiveLocationOn(false);
  }, [watcher, setWatcher, setIsLiveLocationOn]);

  const startMyLiveLocation = useCallback(async () => {
    // Only start if not already running
    if (isLiveLocationOnRef.current) {
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
          console.log(locationsRef?.current ?? null, "lo");
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
  }, [
    setLocations,
    setDisplay,
    setLat,
    setLong,
    setWatcher,
    setIsLiveLocationOn,
    locationsRef,
  ]);

  return { stopMyLiveLocation, startMyLiveLocation };
}


