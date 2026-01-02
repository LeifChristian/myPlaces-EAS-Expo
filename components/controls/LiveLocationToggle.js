import React from "react";
import { Image, Text, TouchableOpacity } from "react-native";

export default function LiveLocationToggle({
  showControls,
  isLiveLocationOn,
  stopMyLiveLocation,
  startMyLiveLocation,
}) {
  if (!showControls) return null;

  return isLiveLocationOn ? (
    <TouchableOpacity
      onPressIn={() => {
        stopMyLiveLocation();
      }}
    >
      <Text
        style={{
          marginTop: 24,
          marginLeft: 300,
          height: 80,
          marginBottom: -68,
        }}
      >
        <Image
          style={{
            height: 33,
            width: 20,
            marginTop: 4,
            marginRight: 2,
            marginLeft: -2,
          }}
          source={require("../../images/walking.png")}
        ></Image>
      </Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      onPressIn={() => {
        startMyLiveLocation();
      }}
    >
      <Text
        style={{
          marginTop: 20,
          marginLeft: 300,
          height: 80,
          marginBottom: -78,
        }}
      >
        <Image
          style={{
            height: 35,
            width: 35,
            marginTop: 4,
            marginRight: 2,
            marginLeft: -2,
          }}
          source={require("../../images/car.png")}
        ></Image>
      </Text>
    </TouchableOpacity>
  );
}


