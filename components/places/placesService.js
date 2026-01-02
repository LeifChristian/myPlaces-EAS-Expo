import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { v4 as uuidv4 } from "uuid";

// Extracted from App.js. These functions intentionally accept state setters/callbacks
// so App can remain a thin composition file without changing behavior.

export const refreshPlaces = async ({ setPlaces }) => {
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

export const addPlaceToStorage = async ({ text, locations, refresh }) => {
  console.log(locations, " locations");
  console.log(text, "text");

  try {
    //set object structure of new place
    const newPlace = {
      lat: parseFloat(locations[0].lat),
      long: parseFloat(locations[0].long),
      id: uuidv4(),
      name: text,
      dateAdded: Date.now(),
    };

    //assign previous places to array
    const prevPlaces = await AsyncStorage.getItem("places");
    console.log(prevPlaces, "prevPlaces");
    console.log(locations[0], "locations");
    console.log(newPlace, "--new place object");

    // Parse previous places safely
    let parsedReturn = [];
    try {
      parsedReturn = prevPlaces ? JSON.parse(prevPlaces) : [];
      if (!Array.isArray(parsedReturn)) parsedReturn = [];
    } catch (parseErr) {
      parsedReturn = [];
    }

    // add new place to prevPlaces with spread operator
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

export const confirmDeletePlace = ({ id, name, onConfirm }) => {
  return Alert.alert("Sure?", `Confirm delete ${name}`, [
    // The "Yes" button
    {
      text: "Yes",
      onPress: () => {
        onConfirm();
      },
    },
    // Dismiss the dialog when tapped
    {
      text: "No",
    },
  ]);
};

export const deletePlaceFromStorage = async ({
  id,
  locations,
  refresh,
  setTheName,
  setTheId,
  setModalVisible,
}) => {
  //remove name and id of deleted place.
  setTheName("");
  setTheId("");
  // close modal
  setModalVisible(false);
  try {
    console.log(id, "deleting place");

    //get places array before deleting item
    const prevPlaces = await AsyncStorage.getItem("places");
    // parse prevPlaces safely
    let parseley = [];
    try {
      parseley = prevPlaces ? JSON.parse(prevPlaces) : [];
      if (!Array.isArray(parseley)) parseley = [];
    } catch (e) {
      parseley = [];
    }
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


