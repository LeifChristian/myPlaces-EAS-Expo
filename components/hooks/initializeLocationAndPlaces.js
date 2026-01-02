import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { v4 as uuidv4 } from "uuid";

// Initializes persisted places + location permission + current location + default "home" + watchPosition.
// Extracted from App.js; sequence and side effects intentionally unchanged.
export default function initializeLocationAndPlaces({
  setPlaces,
  setLocations,
  setDisplay,
  setLat,
  setLong,
  setWatcher,
  setAppReady,
  locationsRef, // optional: pass a ref if you want to preserve logging behavior
}) {
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

          // One-time backup of existing places
          try {
            const backup = await AsyncStorage.getItem("places_backup");
            if (!backup) {
              await AsyncStorage.setItem("places_backup", value);
              console.log("Created one-time backup of places");
            }
          } catch (backupErr) {
            console.log("Backup error:", backupErr);
          }
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
      setLocations([{ lat: location.coords.latitude, long: location.coords.longitude }]);
      setDisplay(
        `lat: ${location.coords.latitude.toFixed(
          7
        )}, long: ${location.coords.longitude.toFixed(7)}`
      );
      setLat(location.coords.latitude);
      setLong(location.coords.longitude);

      //FIFTH: If no places existed, create default home with actual location
      const currentPlaces = await AsyncStorage.getItem("places");
      let currentArray = [];
      try {
        currentArray = currentPlaces ? JSON.parse(currentPlaces) : [];
      } catch (e) {
        currentArray = [];
      }
      if (!currentArray || !Array.isArray(currentArray) || currentArray.length === 0) {
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
          setLocations([{ lat: location.coords.latitude, long: location.coords.longitude }]);
          console.log(locationsRef?.current ?? null, "lo");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}


