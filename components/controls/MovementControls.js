import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { styles } from "../app/appStyles";

export default function MovementControls({
  showControls,
  move,
  showMyLocation,
  startMyLiveLocation,
  children,
}) {
  if (!showControls) return null;

  return (
    <View style={styles.controlsContainer}>
      {/* Top Row - Up Button */}
      <View style={styles.topRow}>
        <TouchableOpacity onPressIn={() => move("up")} style={styles.buttonContainer}>
          <Text style={styles.directionButton}>↑</Text>
        </TouchableOpacity>
      </View>

      {/* Middle Row - Zoom Out, Left, Center, Right, Zoom In */}
      <View style={styles.middleRow}>
        <TouchableOpacity
          onPressIn={() => move("minus")}
          style={[styles.buttonContainer, { marginRight: -10 }]}
        >
          <Text style={styles.zoomButton}>--</Text>
        </TouchableOpacity>

        <TouchableOpacity onPressIn={() => move("left")} style={styles.buttonContainer}>
          <Text style={styles.directionButton}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            showMyLocation();
            startMyLiveLocation();
          }}
          style={styles.buttonContainer}
        >
          <Image style={styles.centerImage} source={require("../../images/center.png")} />
        </TouchableOpacity>

        <TouchableOpacity onPressIn={() => move("right")} style={styles.buttonContainer}>
          <Text style={styles.directionButton}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPressIn={() => move("plus")}
          style={[styles.buttonContainer, { marginLeft: -10 }]}
        >
          <Text style={styles.zoomButton}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Row - Down Button */}
      <View style={styles.bottomRow}>
        <TouchableOpacity onPressIn={() => move("down")} style={styles.buttonContainer}>
          <Text style={styles.directionButton}>↓</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons Row (and any other injected controls) */}
      {children}
    </View>
  );
}


