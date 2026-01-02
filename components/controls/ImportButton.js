import React from "react";
import { Text, TouchableOpacity } from "react-native";

import { styles } from "../app/appStyles";

export default function ImportButton({
  show,
  setImportModalVisible,
}) {
  if (!show) return null;

  return (
    <TouchableOpacity
      style={styles.importButton}
      onPress={() => setImportModalVisible(true)}
    >
      <Text style={styles.importButtonText}>⬇</Text>
    </TouchableOpacity>
  );
}


