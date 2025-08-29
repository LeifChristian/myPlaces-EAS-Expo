import React, { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

const Modality = (props) => {
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, lat, long, date
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [showDates, setShowDates] = useState(false); // show dates only when sorting by date
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importMode, setImportMode] = useState("bulk"); // "bulk" or "single"
  const [singleLat, setSingleLat] = useState("");
  const [singleLong, setSingleLong] = useState("");
  const [singleName, setSingleName] = useState("");

  let areTherePlaces = props.places.length >= 1 ? true : false;

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2); // last 2 digits
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month}/${day}/${year} - ${hours}:${minutes}`;
  };

  // Filter and sort places
  const getFilteredAndSortedPlaces = () => {
    if (!props.places) return [];
    
    let filtered = props.places.filter(place => 
      place.name.toLowerCase().includes(searchText.toLowerCase())
    );
    
    console.log("Filtering with sortBy:", sortBy, "sortOrder:", sortOrder);
    console.log("Filtered places before sort:", filtered.map(p => p.name));
    
    // Sort places
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch(sortBy) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "lat":
          aVal = a.lat;
          bVal = b.lat;
          break;
        case "long":
          aVal = a.long;
          bVal = b.long;
          break;
        case "date":
          // For backward compatibility, places without dateAdded go first
          aVal = a.dateAdded || 0;
          bVal = b.dateAdded || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    console.log("Filtered places after sort:", filtered.map(p => p.name));
    return filtered;
  };

  // Show filtered places using the original showPlaces function design
  const showFilteredPlaces = () => {
    const filteredPlaces = getFilteredAndSortedPlaces();
    
    return filteredPlaces.map((element) => {
      //capitalize the first letter of a place. unused but cool. lol
      const caps =
        element?.name.charAt(0).toUpperCase() + element?.name.slice(1);

      //go to a place on press
      const gotoPlace = (lat, long) => {
        props.mapRef.current.animateToRegion(
          {
            latitude: lat,
            longitude: long,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          3 * 1000
        );

        //set current lat, long, display, and id
        props.setLat && props.setLat(lat);
        props.setLong && props.setLong(long);
        props.setTheName(element.name);
        props.setTheId && props.setTheId(element.id);
        //fixed length on lat/long returns for display purposes
        props.setDisplay && props.setDisplay(`lat: ${lat.toFixed(7)}, long: ${long.toFixed(7)}`);
      };

      //show place and edit, delete buttons
      return (
        <View key={element.id}>
          <TouchableOpacity
            onPress={() => {
              gotoPlace(element.lat, element.long, element.name);
              props.setLat && props.setLat(element.lat);
              props.setLong && props.setLong(element.long);
              props.setModalVisible(false);
              props.stopMyLiveLocation && props.stopMyLiveLocation();
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
                color: "white",
              }}
            >
              {element.name} {/*   {caps} */}{" "}
            </Text>
          </TouchableOpacity>

          {/* Show date if showDates is true and element has dateAdded */}
          {showDates && element.dateAdded && (
            <Text
              style={{
                fontSize: 12,
                textAlign: "center",
                color: "#888",
                marginTop: 2,
                marginBottom: 5,
              }}
            >
              {formatDate(element.dateAdded)}
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 18,
              width: "100%",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                props.confirmDeletePlace && props.confirmDeletePlace(element.id, element.lat, element.name);
              }}
              style={{
                marginHorizontal: 3,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "white",
                  fontSize: 23,
                }}
              >
                X
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                gotoPlace(element.lat, element.long, element.name);
                props.setPlaceModalVisible && props.setPlaceModalVisible(true);
                props.setTheId && props.setTheId(element.id);

                //  showPlace()
              }}
              style={{
                marginHorizontal: 3,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "white",
                  fontSize: 23,
                }}
              >
                ...
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    });
  };

  // Validate and parse import data
  const validateImportData = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return { valid: false, error: "No data provided" };

    // Try JSON format first
    try {
      const jsonData = JSON.parse(trimmed);
      if (!Array.isArray(jsonData)) {
        return { valid: false, error: "JSON must be an array of places" };
      }
      
      for (let i = 0; i < jsonData.length; i++) {
        const place = jsonData[i];
        if (!place.name || typeof place.name !== 'string' || place.name.trim() === '') {
          return { valid: false, error: `Place ${i + 1}: Name is required` };
        }
        if (typeof place.lat !== 'number' || isNaN(place.lat) || place.lat < -90 || place.lat > 90) {
          return { valid: false, error: `Place ${i + 1}: Invalid latitude` };
        }
        if (typeof place.long !== 'number' || isNaN(place.long) || place.long < -180 || place.long > 180) {
          return { valid: false, error: `Place ${i + 1}: Invalid longitude` };
        }
      }
      
      return { valid: true, data: jsonData, format: 'json' };
    } catch (e) {
      // Try coordinate format
      const lines = trimmed.split('\n').filter(line => line.trim());
      const places = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const parts = line.split(',');
        
        if (parts.length < 3) {
          return { valid: false, error: `Line ${i + 1}: Must have format "name, lat, long"` };
        }
        
        const name = parts[0].trim();
        const lat = parseFloat(parts[1].trim());
        const long = parseFloat(parts[2].trim());
        
        if (!name) {
          return { valid: false, error: `Line ${i + 1}: Name is required` };
        }
        if (isNaN(lat) || lat < -90 || lat > 90) {
          return { valid: false, error: `Line ${i + 1}: Invalid latitude` };
        }
        if (isNaN(long) || long < -180 || long > 180) {
          return { valid: false, error: `Line ${i + 1}: Invalid longitude` };
        }
        
        places.push({ name, lat, long });
      }
      
      return { valid: true, data: places, format: 'coordinates' };
    }
  };

  // Import places (bulk)
  const importPlaces = async () => {
    const validation = validateImportData(importText);
    
    if (!validation.valid) {
      setImportError(validation.error);
      return;
    }
    
    try {
      const existingPlaces = await AsyncStorage.getItem("places");
      let currentPlaces = existingPlaces ? JSON.parse(existingPlaces) : [];
      
      const newPlaces = validation.data.map(place => ({
        ...place,
        id: uuid.v4(),
        dateAdded: Date.now()
      }));
      
      const updatedPlaces = [...currentPlaces, ...newPlaces];
      await AsyncStorage.setItem("places", JSON.stringify(updatedPlaces));
      
      props.refresh();
      resetImportModal();
      
      Alert.alert("Success", `Imported ${newPlaces.length} places successfully!`);
    } catch (error) {
      setImportError("Failed to import places. Please try again.");
    }
  };

  // Import single place
  const importSinglePlace = async () => {
    const lat = parseFloat(singleLat);
    const long = parseFloat(singleLong);
    const name = singleName.trim();

    // Validation
    if (!name) {
      setImportError("Name is required");
      return;
    }
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setImportError("Invalid latitude (must be between -90 and 90)");
      return;
    }
    if (isNaN(long) || long < -180 || long > 180) {
      setImportError("Invalid longitude (must be between -180 and 180)");
      return;
    }

    try {
      const existingPlaces = await AsyncStorage.getItem("places");
      let currentPlaces = existingPlaces ? JSON.parse(existingPlaces) : [];
      
      const newPlace = {
        name,
        lat,
        long,
        id: uuid.v4(),
        dateAdded: Date.now()
      };
      
      const updatedPlaces = [...currentPlaces, newPlace];
      await AsyncStorage.setItem("places", JSON.stringify(updatedPlaces));
      
      props.refresh();
      resetImportModal();
      
      Alert.alert("Success", `Added "${name}" successfully!`);
    } catch (error) {
      setImportError("Failed to add place. Please try again.");
    }
  };

     const resetImportModal = () => {
     props.setImportModalVisible(false);
     setImportText("");
     setImportError("");
     setSingleLat("");
     setSingleLong("");
     setSingleName("");
     setImportMode("bulk");
   };

  // Get filtered and sorted places for the original showPlaces function
  const getFilteredPlacesForShowPlaces = () => {
    return getFilteredAndSortedPlaces();
  };

  return (
    <View>
             {/* Import Modal */}
       <Modal
         animationType="slide"
         transparent={true}
         visible={props.importModalVisible}
         onRequestClose={resetImportModal}
       >
         <View style={styles.centeredView}>
           <View style={[styles.modalView, { height: 550 }]}>
             <Text style={styles.importTitle}>Import Places</Text>
             
             {/* Mode Toggle */}
             <View style={styles.modeToggle}>
               <TouchableOpacity
                 style={[styles.modeButton, importMode === "bulk" && styles.modeButtonActive]}
                 onPress={() => {
                   setImportMode("bulk");
                   setImportError("");
                 }}
               >
                 <Text style={styles.modeButtonText}>Bulk Import</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={[styles.modeButton, importMode === "single" && styles.modeButtonActive]}
                 onPress={() => {
                   setImportMode("single");
                   setImportError("");
                 }}
               >
                 <Text style={styles.modeButtonText}>Single Place</Text>
               </TouchableOpacity>
             </View>

             {importMode === "bulk" ? (
               <TextInput
                 style={styles.importTextArea}
                 multiline
                 placeholder="Paste JSON array or coordinate lines here..."
                 placeholderTextColor="#666"
                 value={importText}
                 onChangeText={(text) => {
                   setImportText(text);
                   setImportError("");
                 }}
               />
             ) : (
               <View style={styles.singleImportForm}>
                 <TextInput
                   style={styles.singleInput}
                   placeholder="Latitude (e.g., 40.758896)"
                   placeholderTextColor="#666"
                   value={singleLat}
                   onChangeText={(text) => {
                     setSingleLat(text);
                     setImportError("");
                   }}
                   keyboardType="numeric"
                 />
                 <TextInput
                   style={styles.singleInput}
                   placeholder="Longitude (e.g., -73.985130)"
                   placeholderTextColor="#666"
                   value={singleLong}
                   onChangeText={(text) => {
                     setSingleLong(text);
                     setImportError("");
                   }}
                   keyboardType="numeric"
                 />
                 <TextInput
                   style={styles.singleInput}
                   placeholder="Place name (required)"
                   placeholderTextColor="#666"
                   value={singleName}
                   onChangeText={(text) => {
                     setSingleName(text);
                     setImportError("");
                   }}
                 />
               </View>
             )}
             
             {importError ? (
               <Text style={styles.errorText}>{importError}</Text>
             ) : null}
             
             <View style={styles.importButtons}>
               <Pressable
                 style={[styles.button, styles.buttonClose]}
                 onPress={resetImportModal}
               >
                 <Text style={styles.textStyle}>Cancel</Text>
               </Pressable>
               <Pressable
                 style={[styles.button, styles.buttonClose]}
                 onPress={importMode === "bulk" ? importPlaces : importSinglePlace}
               >
                 <Text style={styles.textStyle}>
                   {importMode === "bulk" ? "Import" : "Add Place"}
                 </Text>
               </Pressable>
             </View>
           </View>
         </View>
       </Modal>

      {/* Main Places Modal */}
      <Modal
        propagateSwipe={true}
        animationType="slide"
        transparent={true}
        visible={areTherePlaces ? props.modalVisible : false}
        onRequestClose={() => {
          props.setModalVisible(!props.modalVisible);
          setShowDates(false); // Hide dates when modal closes
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Search Bar */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search places..."
              placeholderTextColor="#666"
              value={searchText}
              onChangeText={setSearchText}
            />
            
            {/* Sort Controls */}
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === "name" && styles.sortButtonActive]}
                onPress={() => {
                  console.log("Name sort pressed, current sortBy:", sortBy, "sortOrder:", sortOrder);
                  if (sortBy === "name") {
                    const newOrder = sortOrder === "asc" ? "desc" : "asc";
                    setSortOrder(newOrder);
                    console.log("Changed order to:", newOrder);
                  } else {
                    setSortBy("name");
                    setSortOrder("asc");
                    setShowDates(false); // Hide dates when sorting by name
                    console.log("Set to name sort, asc");
                  }
                }}
              >
                <Text style={styles.sortButtonText}>
                  Name {sortBy === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.sortButton, sortBy === "date" && styles.sortButtonActive]}
                onPress={() => {
                  if (sortBy === "date") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("date");
                    setSortOrder("desc");
                    setShowDates(true); // Show dates when sorting by date
                  }
                }}
              >
                <Text style={styles.sortButtonText}>
                  Date {sortBy === "date" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, width: '100%', marginTop: 10 }}>
              {showFilteredPlaces()}
            </ScrollView>

            <Pressable
              style={{
                backgroundColor: "black",
                borderRadius: 12,
                padding: 10,
                marginTop: 10,
              }}
              onPress={() => {
                props.setModalVisible(false);
                setShowDates(false); // Hide dates when modal closes
              }}
            >
              <Text style={{ color: "white", textAlign: "center", fontSize: 18 }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      

      {/* Main Places Button */}
      {props.showGoogleInput ? (
        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => {
            props.setModalVisible(true);
          }}
        >
          <Text style={[styles.textStyle]}>Places</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  modalView: {
    margin: 20,
    backgroundColor: "black",
    borderRadius: 20,
    padding: 25,
    height: '80%',
    width: '90%',
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    backgroundColor: "#333",
    color: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    width: '100%',
    fontSize: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  sortLabel: {
    color: "white",
    marginRight: 10,
    fontSize: 14,
  },
  sortButton: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  sortButtonActive: {
    backgroundColor: "#555",
  },
  sortButtonText: {
    color: "white",
    fontSize: 12,
  },
  
  button: {
    borderRadius: 20,
    padding: 9,
  },
  buttonOpen: {
    backgroundColor: "black",
    borderRadius: 12,
  },
  buttonClose: {
    backgroundColor: "black",
    borderRadius: 12,
    marginHorizontal: 5,
  },
  textStyle: {
    color: "white",
    textAlign: "center",
    fontSize: 24,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  
  importTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  importTextArea: {
    backgroundColor: "#333",
    color: "white",
    borderRadius: 10,
    padding: 15,
    height: 200,
    width: '100%',
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 15,
  },
  importButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
     errorText: {
     color: "#ff6b6b",
     fontSize: 12,
     marginBottom: 10,
     textAlign: 'center',
   },
   modeToggle: {
     flexDirection: 'row',
     marginBottom: 15,
     backgroundColor: '#333',
     borderRadius: 20,
     padding: 2,
   },
   modeButton: {
     flex: 1,
     paddingVertical: 8,
     paddingHorizontal: 16,
     borderRadius: 18,
     alignItems: 'center',
   },
   modeButtonActive: {
     backgroundColor: '#555',
   },
   modeButtonText: {
     color: 'white',
     fontSize: 14,
     fontWeight: '500',
   },
   singleImportForm: {
     width: '100%',
     marginBottom: 15,
   },
   singleInput: {
     backgroundColor: "#333",
     color: "white",
     borderRadius: 10,
     padding: 12,
     marginBottom: 10,
     width: '100%',
     fontSize: 16,
   },
});

export default Modality;
