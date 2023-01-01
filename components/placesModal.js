import React, { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Button,
} from "react-native";
import Prompt from "react-native-input-prompt";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PlacesModal = (props) => {
  useEffect(() => {
    props.PlaceModalVisible ? props.setModalVisible(false) : "";
  }, [props.PlaceModalVisible]);

  const changeName = async (text) => {
    const placesUnparsed = await AsyncStorage.getItem("places");

    let parsed = JSON.parse(placesUnparsed);

    console.log(parsed, "all items");

    var updatedPlacesArray = parsed.map((el) =>
      el.id == props.theId ? { ...el, name: text } : el
    );

    console.log(updatedPlacesArray);

    await AsyncStorage.setItem("places", JSON.stringify(updatedPlacesArray));

    props.refresh();

    // AsyncStorage 'places' Object structure (array of places objects):
    // {
    //   "id": props.theId,
    //   "lat": 37.1779367,
    //   "long": -122.0551417,
    //   "name": "TestPlace",
    // };
  };

  return (
    <View>
      <Modal
        propagateSwipe={true}
        animationType="slide"
        transparent={true}
        visible={props.PlaceModalVisible}
        onShow={props.showPlace}
        onRequestClose={() => {
          // Alert.alert("Modal has been closed.");
          props.setModalVisible(!props.modalVisible);
          props.setPlaceModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* <ScrollView> */}
            <Text
              selectable={true}
              selectionColor="blue"
              style={styles.modalText}
            >
              <Prompt
                style={{ backgroundColor: "black" }}
                visible={props.editPrompt}
                title={`Rename "${props.theName}":`}
                placeholder="..."
                submitText={"Save"}
                cancelText={"Cancel"}
                titleStyle={{ color: "black" }}
                onCancel={() => {
                  console.log("cancelled");
                  props.setEditPrompt(false);
                }}
                onSubmit={(text) => {
                  if (text.length == 0) {
                    alert("no text entered, idiot!");
                    return;
                  }
                  changeName(text);
                  props.setTheName(text);
                  props.setEditPrompt(false);
                }}
              />
              <Text style={{ fontSize: 20, color: "white", fontWeight: "700" }}>
                {props.theName
                  ? props.theName
                  : props?.geocoder[1]?.address_components[0].short_name}
              </Text>
              {"\n"}
              {/* <Button title={"edit"} onPress={() => props.setEditPrompt(!props.editPrompt)}></Button> */}
              <Text style={styles.modalView}>
                <TouchableOpacity
                  onPress={() => {
                    props.setEditPrompt(!props.editPrompt);
                  }}
                >
                  {props.theName ? (
                    <Text
                      style={{
                        textAlign: "center",
                        color: "white",
                        fontSize: 23,
                      }}
                    >
                      ...
                    </Text>
                  ) : null}
                </TouchableOpacity>
              </Text>
              {"\n"} {"\n"}
              {/* whole thing: {props.geocoder ? JSON.stringify(props?.geocoder[1].address_components) : ''}{'\n'}{'\n'} */}
              <Text style={styles.headers}>Address: </Text>
              {"\n"}
              {props.geocoder
                ? JSON.stringify(props.geocoder[1]?.formatted_address)
                : ""}
              {"\n"}
              {"\n"}
              <Text style={styles.headers}>Coordinates: {"\n"}</Text>{" "}
              {"lat: " +
                props.lat.toFixed(6) +
                " " +
                "long: " +
                props.long.toFixed(6)}
              {"\n"}
              {/* {JSON.stringify(props.geocoder[1])} */}
              {props.modalVisible
                ? console.log(
                    JSON.stringify(props.geocoder),
                    "--geocoder response"
                  )
                : ""}
              {"\n"}
              <Text
                style={styles.headers}
                onPress={() => {
                  Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${props.placeId}`
                  );
                }}
              >
                Url: {"\n"}
                <Text style={styles.link}>
                  https://www.google.com/maps/search/?api=1&query=Google&query_place_id=
                  {props.placeId}
                </Text>
              </Text>
            </Text>

            {/* </ScrollView> */}

            {props.theName ? (
              <Pressable
                onPress={() => {
                  props.setPlaceModalVisible(false);
                  props.setModalVisible(true);
                }}
              >
                <Text style={styles.textStyle}>X</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  props.setPlaceModalVisible(false);
                }}
              >
                <Text style={styles.textStyle}>X</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => props.setModalVisible(false)}
      >
        {/* {props.googleInput ? 
        <Text style={styles.textStyle}>Places</Text> : null} */}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    width: 400,

    // backgroundColor: 'rgba(0,0,0,1)',
    marginBottom: 260,
    padding: 5,
  },
  modalView: {
    height: 440,
    margin: 20,
    backgroundColor: "black",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#180",
    shadowOffset: {
      width: 40,
      height: 22,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    borderRadius: 12,
  },
  textStyle: {
    color: "white",
    textAlign: "center",
    fontSize: 24,
    marginBottom: 20,
  },
  modalText: {
    marginBottom: 25,
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },

  link: { color: "aquamarine", fontSize: 16, fontWeight: "600" },

  headers: { color: "white", fontSize: 18, fontWeight: "700" },
});

export default PlacesModal;
