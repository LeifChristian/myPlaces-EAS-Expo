import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import prompt from "react-native-prompt-android";

import { styles } from "../app/appStyles";

export default function ActionButtons({
  showControls,
  GoogleInput,
  addPlace,
  isLiveLocationOn,
  stopMyLiveLocation,
  setModalVisible,
}) {
  if (!showControls) return null;

  return (
    <View style={styles.actionButtonsRow}>
      <TouchableOpacity
        onPressIn={() => {
          prompt(
            "Name Your Place",
            "",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Save", onPress: (text) => addPlace(text || "untitled") },
            ],
            {
              type: "plain-text",
              cancelable: true,
              placeholder: "...",
            }
          );
          isLiveLocationOn ? stopMyLiveLocation() : "";
        }}
        style={styles.buttonContainer}
      >
        <Text style={[styles.actionButton, GoogleInput ? { opacity: 0 } : null]}>
          Add
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPressIn={() => {
          setModalVisible(true);
          stopMyLiveLocation();
        }}
        style={styles.buttonContainer}
      >
        <Text style={[styles.actionButton, GoogleInput ? { opacity: 0 } : null]}>
          Places
        </Text>
      </TouchableOpacity>
    </View>
  );
}


