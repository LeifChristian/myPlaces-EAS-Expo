import { StyleSheet } from "react-native";

// Extracted from App.js to keep App thin. Values intentionally unchanged.
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  controlsContainer: {
    marginTop: 28,
    alignItems: "center",
  },
  topRow: {
    alignItems: "center",
    marginBottom: -15,
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -12,
  },
  bottomRow: {
    alignItems: "center",
  },
  buttonContainer: {
    margin: 5,
  },

  directionButton: {
    color: "white",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 32,
    width: 52,
    height: 52,
    borderRadius: 12,
    padding: 8,
    backgroundColor: "black",
    textAlignVertical: "center",
  },
  zoomButton: {
    color: "white",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 32,
    width: 52,
    height: 52,
    borderRadius: 12,
    padding: 8,
    backgroundColor: "black",
    textAlignVertical: "center",
    marginTop: 10,
  },
  centerImage: {
    height: 41,
    width: 41,
    marginTop: 19,
  },
  actionButtonsRow: {
    flexDirection: "row",

    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
    width: "100%",
  },
  actionButton: {
    color: "white",
    textAlign: "center",
    fontSize: 22,
    paddingBottom: 35,
    fontWeight: "bold",
    borderRadius: 12,
    paddingVertical: 1,

    backgroundColor: "black",
    minWidth: 90,
  },

  autoStyle: {
    marginLeft: "auto",
    marginBottom: "-40%",
    color: "white",
    textAlign: "center",
    fontSize: 39,
    borderRadius: 12,
    padding: 6,
    backgroundColor: "black",
    marginTop: -1,
  },

  buttonStyle: {
    marginBottom: "5%",
    marginRight: "2%",
    marginBottom: "1%",
    color: "white",
    textAlign: "center",
    fontSize: 24,
    borderRadius: 12,
    padding: 6,
    backgroundColor: "black",
    marginTop: 2,
  },

  modalItemStyle: { fontSize: 16, textAlign: "center", color: "white" },
  modalHeaderStyle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  importButton: {
    position: "absolute",
    right: 40,
    bottom: 30,
    backgroundColor: "black",
    width: 30,
    height: 30,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    zIndex: 9999,
  },
  importButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});


