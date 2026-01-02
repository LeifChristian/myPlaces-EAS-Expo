import AsyncStorage from "@react-native-async-storage/async-storage";

export const PLACES_KEY = "places";
export const PLACES_BACKUP_KEY = "places_backup";

export async function getPlacesRaw() {
  return await AsyncStorage.getItem(PLACES_KEY);
}

export function parsePlacesSafe(value) {
  try {
    if (value === null || value === undefined || value === "null") return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return [];
  }
}

export async function getPlacesSafe() {
  const raw = await getPlacesRaw();
  return parsePlacesSafe(raw);
}

export async function setPlacesSafe(placesArray) {
  return await AsyncStorage.setItem(PLACES_KEY, JSON.stringify(placesArray));
}

export async function ensurePlacesBackupOnce(rawPlacesValue) {
  try {
    const backup = await AsyncStorage.getItem(PLACES_BACKUP_KEY);
    if (!backup && rawPlacesValue) {
      await AsyncStorage.setItem(PLACES_BACKUP_KEY, rawPlacesValue);
      console.log("Created one-time backup of places");
    }
  } catch (backupErr) {
    console.log("Backup error:", backupErr);
  }
}


