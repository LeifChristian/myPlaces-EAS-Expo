// 

import 'dotenv/config';

// Rotate this in GCP; during dev you can keep it in .env
const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY || 'REPLACE_WITH_ROTATED_KEY';

export default {
  expo: {
    name: "myPlaces",
    slug: "myplaces",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],

    // ❌ remove the react-native-maps plugin; it doesn't exist

    ios: {
      supportsTablet: true,
      config: {
        // iOS native key
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
      }
    },

    android: {
      package: "com.leifonatree.myplaces",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.FOREGROUND_SERVICE"
      ],
      config: {
        // Android native key
        googleMaps: { apiKey: GOOGLE_MAPS_API_KEY }
      }
    },

    web: { favicon: "./assets/favicon.png" },

    extra: {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      eas: { projectId: "c87bf6eb-4093-4227-b840-4030cce1b2e2" }
    }
  }
}
