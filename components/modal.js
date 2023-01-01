import React, { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  ScrollView,
} from "react-native";

const Modality = (props) => {
  // const [modalVisible, setModalVisible] = useState(false);

  let areTherePlaces = props.places.length >= 1 ? true : false;

  // !areTherePlaces ? console.log("no places") : console.log("places exist");

  return (
    <View>
      <Modal
        propagateSwipe={true}
        animationType="slide"
        transparent={true}
        visible={areTherePlaces ? props.modalVisible : false}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          props.setModalVisible(!props.modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView>
              <Text style={styles.modalText}>{props.showPlaces()}</Text>
            </ScrollView>

            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                props.setModalVisible(!props.modalVisible);
              }}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => {
          props.setModalVisible(true);
        }}
      >
        {props.googleInput ? (
          <Text style={styles.textStyle}>Places</Text>
        ) : null}
      </Pressable>
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
    height: 600,
    // width: 200,
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
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default Modality;
