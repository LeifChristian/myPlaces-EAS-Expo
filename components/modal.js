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
import { v4 as uuidv4 } from 'uuid';
// import { Clipboard } from 'react-native'; // Not available in this RN version

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
  const [singleInputMode, setSingleInputMode] = useState("text"); // 'text' or 'link'
  const [singleLink, setSingleLink] = useState("");
  const [linkParsed, setLinkParsed] = useState(false);
  const [modalTab, setModalTab] = useState("import"); // "import" or "export"
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());
  const [exportModalVisible, setExportModalVisible] = useState(false);

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

  // Export functions
  const togglePlaceSelection = (placeId) => {
    const newSelected = new Set(selectedPlaces);
    if (newSelected.has(placeId)) {
      newSelected.delete(placeId);
    } else {
      newSelected.add(placeId);
    }
    setSelectedPlaces(newSelected);
  };

  const selectAllPlaces = () => {
    const allIds = new Set(props.places.map(p => p.id));
    setSelectedPlaces(allIds);
  };

  const deselectAllPlaces = () => {
    setSelectedPlaces(new Set());
  };

  const generateExportText = () => {
    const selectedPlacesList = props.places.filter(place => selectedPlaces.has(place.id));
    
    return selectedPlacesList.map(place => {
      return `${place.name}, ${place.lat}, ${place.long}`;
    }).join('\n');
  };

  const showExportText = () => {
    if (selectedPlaces.size === 0) {
      alert('Please select at least one place to export');
      return;
    }
    setExportModalVisible(true);
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
        id: uuidv4(),
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
        id: uuidv4(),
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

  // Parse Google Maps link to lat/long and name
  const parseGoogleMapsLink = async () => {
    setImportError("");
    setLinkParsed(false);
    let link = (singleLink || "").trim();
    if (!link) { setImportError("Link is required"); return; }
    if (link.startsWith("@http")) link = link.slice(1);
    try {
      let working = link;
      try {
        const res = await fetch(working, { method: 'GET' });
        if (res && res.url) working = res.url;
      } catch (_) {}

      let latMatch; let longMatch; let nameCandidate = "";
      const atMatch = working.match(/@(-?[\d.]+),(-?[\d.]+)/);
      if (atMatch) { latMatch = atMatch[1]; longMatch = atMatch[2]; }
      if (!latMatch) {
        const qMatch = working.match(/[?&](?:q|query)=(-?[\d.]+),(-?[\d.]+)/);
        if (qMatch) { latMatch = qMatch[1]; longMatch = qMatch[2]; }
      }
      if (!latMatch) {
        const llMatch = working.match(/[?&]ll=(-?[\d.]+),(-?[\d.]+)/);
        if (llMatch) { latMatch = llMatch[1]; longMatch = llMatch[2]; }
      }
      const nameMatch = working.match(/\/maps\/place\/([^\/?#]+)/);
      if (nameMatch) nameCandidate = decodeURIComponent(nameMatch[1]).replace(/\+/g, ' ');
      if (!latMatch || !longMatch) { setImportError("Could not find coordinates in the link"); return; }
      setSingleLat(String(latMatch));
      setSingleLong(String(longMatch));
      if (nameCandidate && !singleName) setSingleName(nameCandidate);
      setLinkParsed(true);
    } catch (e) { setImportError("Failed to parse link"); }
  };

       const resetImportModal = () => {
    props.setImportModalVisible(false);
    setImportText("");
    setImportError("");
    setSingleLat("");
    setSingleLong("");
    setSingleName("");
    setImportMode("bulk");
    setModalTab("import");
    setSelectedPlaces(new Set());
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
                         <Text style={styles.importTitle}>
              {modalTab === "import" ? "Import Places" : "Export Places"}
            </Text>
            
            {/* Tab Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, modalTab === "import" && styles.modeButtonActive]}
                onPress={() => {
                  setModalTab("import");
                  setImportError("");
                }}
              >
                <Text style={styles.modeButtonText}>Import</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, modalTab === "export" && styles.modeButtonActive]}
                onPress={() => {
                  setModalTab("export");
                  setImportError("");
                }}
              >
                <Text style={styles.modeButtonText}>Export</Text>
              </TouchableOpacity>
            </View>

            {modalTab === "import" && (
              <>
                {/* Import Mode Toggle */}
                <View style={[styles.modeToggle, { marginTop: 10 }]}>
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
              </>
            )}

             {modalTab === "import" && (
               <>
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
                    {/* Single import sub-tabs: Link / Text */}
                    <View style={[styles.modeToggle, { marginBottom: 10 }]}>
                      <TouchableOpacity
                        style={[styles.modeButton, singleInputMode === 'link' && styles.modeButtonActive]}
                        onPress={() => { setSingleInputMode('link'); setImportError(''); }}
                      >
                        <Text style={styles.modeButtonText}>Link</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modeButton, singleInputMode === 'text' && styles.modeButtonActive]}
                        onPress={() => { setSingleInputMode('text'); setImportError(''); }}
                      >
                        <Text style={styles.modeButtonText}>Text</Text>
                      </TouchableOpacity>
                    </View>

                    {singleInputMode === 'link' ? (
                      <>
                        <TextInput
                          style={styles.singleInput}
                          placeholder="Paste Google Maps link (e.g., https://maps.app.goo.gl/...)"
                          placeholderTextColor="#666"
                          value={singleLink}
                          onChangeText={(text) => { setSingleLink(text); setImportError(''); setLinkParsed(false); }}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        <View style={styles.importButtons}>
                          <Pressable style={[styles.button, styles.buttonClose]} onPress={parseGoogleMapsLink}>
                            <Text style={styles.textStyle}>Parse Link</Text>
                          </Pressable>
                        </View>
                        {linkParsed ? (
                          <>
                            <TextInput
                              style={styles.singleInput}
                              placeholder="Place name (editable)"
                              placeholderTextColor="#666"
                              value={singleName}
                              onChangeText={(text) => { setSingleName(text); setImportError(''); }}
                            />
                            <Text style={{ color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 8 }}>
                              Parsed lat: {singleLat}  long: {singleLong}
                            </Text>
                          </>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <TextInput
                          style={styles.singleInput}
                          placeholder="Latitude (e.g., 40.758896)"
                          placeholderTextColor="#666"
                          value={singleLat}
                          onChangeText={(text) => {
                            setSingleLat(text);
                            setImportError('');
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
                            setImportError('');
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
                            setImportError('');
                          }}
                        />
                      </>
                    )}
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
               </>
             )}

             {modalTab === "export" && (
               <>
                 {/* Select All/None Buttons */}
                 <View style={[styles.importButtons, { marginBottom: 15 }]}>
                   <Pressable
                     style={[styles.button, styles.buttonClose]}
                     onPress={selectAllPlaces}
                   >
                     <Text style={styles.textStyle}>Select All</Text>
                   </Pressable>
                   <Pressable
                     style={[styles.button, styles.buttonClose]}
                     onPress={deselectAllPlaces}
                   >
                     <Text style={styles.textStyle}>Clear All</Text>
                   </Pressable>
                 </View>

                 {/* Places Selection List */}
                 <ScrollView style={{ flex: 1, width: '100%', maxHeight: 300 }}>
                   {props.places.map((place) => (
                     <TouchableOpacity
                       key={place.id}
                       style={{
                         flexDirection: 'row',
                         alignItems: 'center',
                         padding: 10,
                         borderBottomWidth: 1,
                         borderBottomColor: '#333',
                       }}
                       onPress={() => togglePlaceSelection(place.id)}
                     >
                       <View
                         style={{
                           width: 20,
                           height: 20,
                           borderRadius: 10,
                           borderWidth: 2,
                           borderColor: 'white',
                           backgroundColor: selectedPlaces.has(place.id) ? 'white' : 'transparent',
                           marginRight: 10,
                         }}
                       />
                       <Text style={{ color: 'white', flex: 1 }}>
                         {place.name}
                       </Text>
                     </TouchableOpacity>
                   ))}
                 </ScrollView>

                 {/* Export Buttons */}
                 <View style={styles.importButtons}>
                   <Pressable
                     style={[styles.button, styles.buttonClose]}
                     onPress={resetImportModal}
                   >
                     <Text style={styles.textStyle}>Cancel</Text>
                   </Pressable>
                   <Pressable
                     style={[styles.button, styles.buttonClose, { opacity: selectedPlaces.size > 0 ? 1 : 0.5 }]}
                     onPress={showExportText}
                   >
                     <Text style={styles.textStyle}>
                       Export {selectedPlaces.size > 0 ? `(${selectedPlaces.size})` : ''}
                     </Text>
                   </Pressable>
                 </View>
               </>
             )}
           </View>
         </View>
       </Modal>

      {/* Export Data Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={exportModalVisible}
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { height: 400 }]}>
            <Text style={styles.importTitle}>Export Data</Text>
            
            <ScrollView style={{ flex: 1, width: '100%', marginVertical: 15 }}>
              <Text 
                style={{
                  color: 'white',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  backgroundColor: '#222',
                  padding: 15,
                  borderRadius: 10,
                  lineHeight: 20,
                }}
                selectable={true}
                selectTextOnFocus={true}
              >
                {generateExportText()}
              </Text>
            </ScrollView>
            
            <Text style={{
              color: '#888',
              fontSize: 12,
              textAlign: 'center',
              marginBottom: 10,
            }}>
              Long press the text above to select and copy
            </Text>
            
            <Pressable
              style={{
                backgroundColor: "black",
                borderRadius: 12,
                padding: 10,
              }}
              onPress={() => setExportModalVisible(false)}
            >
              <Text style={{ color: "white", textAlign: "center", fontSize: 18 }}>Close</Text>
            </Pressable>
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
