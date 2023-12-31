

import {
  StyleSheet,
} from "react-native";


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  top: { marginTop: "10%", zIndex: -12 },
  group: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: -1, // Added bottom margin
  },

  leftRight: {
    color: "white",
    marginLeft: "3%",
    marginTop: -7,
    marginBottom: "2%",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 32,
    width: 52,
    borderRadius: 12,
    padding: 6,
    backgroundColor: "black",
  },
  plus: {
    color: "white",
    marginRight: 1.4,
    marginLeft: -12,
    marginTop: 1,
    fontWeight: "900",
    textAlign: "center",
    padding: 8,
    fontSize: 32,
    width: 52,
    borderRadius: 12,
    backgroundColor: "black",
  },
  minus: {
    color: "white",
    marginTop: 6, // Updated margin value
    fontWeight: "900",
    marginRight: 2,
    textAlign: "center",
    fontSize: 32,
    borderRadius: 12,
    padding: 6,
    backgroundColor: "black",
  },
  
  up: {
    color: "white",
    marginLeft: "1%",
    marginTop: -22, // Updated margin value
    marginRight: "1%",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 32,
    width: 52,
    borderRadius: 12,
    padding: 4,
    backgroundColor: "black",
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
    marginTop: "5%",
    marginRight: "8%",
    marginBottom: "1%",
    color: "white",
    textAlign: "center",
    fontSize: 24,
    borderRadius: 12,
    padding: 6,
    backgroundColor: "black",
    marginTop: 2,
  },

  buttonStyleAdd: {
    marginTop: 2,
    marginBottom: 3, // Adjusted margin value
    marginRight: "8%",
    marginLeft: 11,
    color: "white",
    textAlign: "center",
    fontSize: 25,
    borderRadius: 12,
    padding: 8,
    backgroundColor: "black",
    marginTop: 0, // Adjusted margin value
  },
  
  Down: {
    marginBottom: "-10%",
    color: "white",
    marginRight: "1%",
    fontWeight: "800",
    textAlign: "center",
    fontSize: 28,
    width: 52,
    borderRadius: 12,
    padding: 6,
    backgroundColor: "black",
    marginTop: -1.6,
  },

  modalItemStyle: { fontSize: 16, textAlign: "center", color: "white" },
  modalHeaderStyle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
});

export default styles