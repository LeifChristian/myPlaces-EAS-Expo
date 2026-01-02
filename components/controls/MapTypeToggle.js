import React from "react";
import { Text, TouchableOpacity } from "react-native";

export default function MapTypeToggle({ showControls, mapType, setMapType }) {
  if (!showControls) return null;

  return mapType == "standard" ? (
    <TouchableOpacity
      style={{
        position: "absolute",
        top: 30,
        alignSelf: "center",
        zIndex: 3,
        elevation: 3,
      }}
      onPress={() => {
        //toggle map type, or street/satellite view
        setMapType("satellite");
      }}
    >
      <Text
        style={{
          color: "black",
          padding: 6,
          borderRadius: 9,
          backgroundColor: "rgba(161, 155, 155, 0.3)",
        }}
      >
        MAP TYPE
      </Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={{
        position: "absolute",
        top: 30,
        alignSelf: "center",
        zIndex: 3,
        elevation: 3,
      }}
      onPress={() => {
        setMapType("standard");
      }}
    >
      <Text
        style={{
          color: "darkgrey",
          padding: 6,
          borderRadius: 9,
          backgroundColor: "rgba(161, 155, 155, 0.3)",
        }}
      >
        SATELLITE
      </Text>
    </TouchableOpacity>
  );
}


