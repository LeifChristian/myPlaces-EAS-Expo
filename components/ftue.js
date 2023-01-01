import React from "react";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  View,
  Modal,
  Text,
  TouchableHighlight,
  Image,
} from "react-native";

const propTypes = {};

const defaultProps = {};

const ftue = () => {
  const [iterable, setiterable] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      //await AsyncStorage.removeItem('ftu'); return; // this line clears localStorage item for testing.

      try {
        const value = await AsyncStorage.getItem("ftu");

        if (!value) {
          await AsyncStorage.setItem("ftu", "false"); // comment this line to make changes to ftue screen.
          setModalVisible(true);
        } else if (value) {
          //console.log("is first time user: ", value)
          setModalVisible(false);
        }
      } catch (e) {
        // error reading value
        console.log(e);
      }
    })();
  }, []);

  const styles = StyleSheet.create({
    ftreContainer: {
      backgroundColor: "black",
      flex: 1,
      marginTop: 70,
      marginBottom: 40,
      marginLeft: 20,
      marginRight: 20,
      borderRadius: 20,
      borderWidth: 4,
      borderColor: "blue",
    },

    center: {
      // marginTop: "50%"
    },
    ftreTitle: {
      color: "white",
      fontWeight: "bold",
      fontSize: 27,
      textAlign: "center",
      margin: 10,
    },
    ftreDescription: {
      textAlign: "center",
      color: "white",
      fontWeight: "500",
      fontSize: 22,
      marginRight: 20,
      marginLeft: 20,
    },
    ftreCloseIcon: {
      alignSelf: "flex-end",
      flex: 0.5,
      marginRight: 10,
    },
    ftreTitleContainer: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    ftreDescriptionContainer: {
      flex: 6.5,
    },
    ftreExitContainer: {
      flex: 2,
      justifyContent: "flex-start",
      alignItems: "center",
    },
    ftreExitButtonContainer: {
      width: 200,
      height: 40,
      marginTop: 68,
      backgroundColor: "black",
      borderRadius: 10,
      justifyContent: "center",
    },
    ftreExitButtonText: {
      color: "white",
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
    },
  });

  return (
    <View>
      <Modal
        animationType={"slide"}
        transparent={true}
        style={styles.ftreContainer}
        visible={modalVisible}
        onRequestClose={() => {
          alert("Modal has been closed.");
        }}
      >
        <View style={styles.ftreContainer}>
          <View style={styles.ftreTitleContainer}>
            <Text style={styles.ftreTitle}>Welcome</Text>
          </View>
          <View style={styles.ftreDescriptionContainer}>
            {iterable == 0 ? (
              <>
                <Text style={styles.ftreDescription} allowFontScaling={true}>
                  {"\n"}
                  Welcome to MyPlaces! {"\n"} {"\n"}
                  MyPlaces shows your live location on the map. {"\n"} {"\n"}
                  Includes zoom, navigation arrows and a button to re-center.{" "}
                  {"\n"}
                </Text>
                <Image
                  style={{
                    height: 180,
                    width: 260,
                    marginTop: "5%",
                    borderRadius: 10,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                  source={require("../images/screen1.png")}
                ></Image>
              </>
            ) : null}

            {iterable == 1 ? (
              <View>
                <Text
                  style={[styles.ftreDescription, styles.center]}
                  allowFontScaling={true}
                >
                  {"\n"}Move around the map or search to find places.
                </Text>
                <Image
                  style={{
                    height: 380,
                    width: 200,
                    marginTop: "5%",
                    borderRadius: 10,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                  source={require("../images/screen2.png")}
                ></Image>
              </View>
            ) : null}

            {iterable == 2 ? (
              <View>
                <Text style={styles.ftreDescription} allowFontScaling={true}>
                  {"\n"} Name and save your places. {"\n"}
                  {"\n"}
                  <Text style={{ fontSize: 12, fontStyle: "italic" }}>
                    *Places are private and only stored on your device
                  </Text>
                </Text>
                <Image
                  style={{
                    height: 380,
                    width: 200,
                    marginTop: "5%",
                    borderRadius: 10,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                  source={require("../images/screen3.png")}
                ></Image>
              </View>
            ) : null}
          

        {iterable == 3 ? (
              <View>
                <Text style={styles.ftreDescription} allowFontScaling={true}>
                {"\n"} Tap the map for Google Maps directions or info.{" "}
                 
                  
                </Text>
                <Image
                  style={{
                    height: 380,
                    width: 200,
                    marginTop: "5%",
                    borderRadius: 10,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                  source={require("../images/screen4.png")}
                ></Image>
              </View>
            ) : null}

        {iterable == 4 ? (
              <Text style={styles.ftreDescription} allowFontScaling={true}>
                {"\n"}
                {"\n"} "Map Type" switches between standard and satellite view.{" "}
                {"\n"}
                {"\n"}
                Long press shows
                {"\n"}
               address information. {"\n"}
                {"\n"}
                Tap the person walking to toggle follow mode.
                {"\n"}
                {"\n"}Thats it! Enjoy!
                <Text
                  style={{ fontSize: 4, color: "blue", textAlign: "center" }}
                >
                  {"\n"}
                  {"\n"}
                  {"\n"}
                  {"\n"}
                  {"\n"}
                  {"\n"}
                  {"\n"}
                  {"\n"}
                  {"\n"}
                  {"\n"}
                  {"\n"}
                  █░░ █▀▀ █ █▀▀  {"\n"}
                  █▄▄ ██▄ █ █▀░ 
                  {"\n"}
                  {"\n"}
                  █▀▀ █░█ █▀█ █ █▀ ▀█▀ █ ▄▀█ █▄░█{"\n"}
                  █▄▄ █▀█ █▀▄ █ ▄█ ░█░ █ █▀█ █░▀█
                </Text>
              </Text>
            ) : null}
          </View>
          <View style={styles.ftreExitContainer}>
            {iterable <= 3 ? (
              <TouchableHighlight
                onPress={() => {
                  setiterable((prevState) => prevState + 1);
                }}
              >
                <View style={styles.ftreExitButtonContainer}>
                  <Text style={styles.ftreExitButtonText}>Next</Text>
                </View>
              </TouchableHighlight>
            ) : (
              <TouchableHighlight
                onPress={() => {
                  setModalVisible(false);
                }}
              >
                <View style={styles.ftreExitButtonContainer}>
                  <Text style={styles.ftreExitButtonText}>Exit</Text>
                </View>
              </TouchableHighlight>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

ftue.propTypes = propTypes;
ftue.defaultProps = defaultProps;
// #endregion

export default ftue;
