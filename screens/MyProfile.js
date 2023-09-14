import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

import BottomNavigation from "../components/BottomNavigation";
import { useNavigation } from "@react-navigation/native";

const MyProfile = () => {
  const navigation = useNavigation();

  const handleClick = () => {
    navigation.navigate("IPhone14Pro6");
  };
  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [isEmailModalVisible, setEmailModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

  const [name, setName] = useState("Jahed Prince"); // Initialize with your default values
  const [email, setEmail] = useState("jahed@example.com");
  const [password, setPassword] = useState("********"); // You may want to handle passwords more securely

  const toggleNameModal = () => {
    setNameModalVisible(!isNameModalVisible);
  };

  const toggleEmailModal = () => {
    setEmailModalVisible(!isEmailModalVisible);
  };

  const togglePasswordModal = () => {
    setPasswordModalVisible(!isPasswordModalVisible);
  };

  const handleNameChange = (newName) => {
    // Handle the name change here
    setName(newName);
    toggleNameModal(); // Close the modal after saving
  };

  const handleEmailChange = (newEmail) => {
    // Handle the email change here
    setEmail(newEmail);
    toggleEmailModal(); // Close the modal after saving
  };

  const handlePasswordChange = (newPassword) => {
    // Handle the password change here
    setPassword(newPassword);
    togglePasswordModal(); // Close the modal after saving
  };

  return (
    <View style={styles.container}>
      <View style={styles.myProfile}>
        <View style={styles.hello}>
          <Text style={styles.hello1}>My Profile</Text>
          <Image
            style={styles.helloChild}
            resizeMode="cover"
            source={require("../assets/Frame.png")}
          />
        </View>

        <View style={[styles.hello2, styles.helloLayout2]}>
          <Entypo
            style={[styles.helloChild2, styles.helloLayout2]}
            name="user"
            size={75}
            color="white"
          />
        </View>

        <Text style={[styles.hiJahedPrince1, styles.hiJahedPrince1Typo]}>
          Hi, Jahed Prince!
        </Text>
        <Text style={[styles.letsExploreThe1, styles.hiJahedPrince1Typo]}>
          Let’s Explore the World.
        </Text>

        <View style={styles.airportCrad}>
          <TouchableOpacity onPress={toggleNameModal}>
            <View style={[styles.airportCrad1, styles.airportLayout]}>
              <View
                style={[styles.airportCradChild, styles.frameViewPosition]}
              />
              <FontAwesome
                style={[styles.reactIconsfafauser, styles.reactLayout]}
                name="user"
                size={50}
                color="#6C6C6C"
              />
              <Text style={[styles.email, styles.nameTypo]}>NAME</Text>
            </View>
          </TouchableOpacity>
          <Modal
            visible={isNameModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={name}
                  onChangeText={(text) => setName(text)}
                  placeholder="Enter new name"
                />
                <TouchableOpacity onPress={() => handleNameChange(name)}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleNameModal}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <TouchableOpacity onPress={toggleEmailModal}>
            <View style={[styles.airportCrad2, styles.airportLayout]}>
              <View
                style={[styles.airportCradChild, styles.frameViewPosition]}
              />
              <MaterialIcons
                style={[styles.reactIconsfafaenvelope, styles.reactLayout]}
                name="email"
                size={50}
                color="#6C6C6C"
              />
              <Text style={[styles.email, styles.nameTypo]}>EMAIL</Text>
            </View>
          </TouchableOpacity>

          <Modal
            visible={isEmailModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Email</Text>
                <TextInput
                  style={styles.modalInput}
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  placeholder="Enter new email"
                />
                <TouchableOpacity onPress={() => handleEmailChange(email)}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleEmailModal}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TouchableOpacity onPress={togglePasswordModal}>
            <View style={[styles.airportCrad3, styles.airportLayout]}>
              <View
                style={[styles.airportCradChild, styles.frameViewPosition]}
              />
              <Ionicons
                style={[styles.reactIconsfafakey, styles.reactLayout]}
                name="key"
                size={50}
                color="#6C6C6C"
              />
              <Text style={[styles.email, styles.nameTypo]}>PASSWORD</Text>
            </View>
          </TouchableOpacity>
          <Modal
            visible={isPasswordModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <TextInput
                  style={styles.modalInput}
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  placeholder="Enter new password"
                  secureTextEntry={true} // This hides the entered password
                />
                <TouchableOpacity
                  onPress={() => handlePasswordChange(password)}
                >
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={togglePasswordModal}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <TouchableOpacity onPress={handleClick}>
            <View style={[styles.airportCrad4, styles.airportLayout]}>
              <View
                style={[styles.airportCradChild4, styles.frameViewPosition]}
              />
              <Text style={[styles.email1, styles.nameTypo1]}>LOGOUT</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <BottomNavigation style={styles.navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Add these styles for modals
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#070606", // Match your app's background color
    padding: 20,
    borderRadius: 24, // Match your app's border radius
    width: 300,
  },
  modalTitle: {
    fontSize: 24, // Adjust font size as needed
    fontFamily: "Overpass-Bold",
    marginBottom: 10,
    color: "#fff", // Match your app's text color
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#6C6C6C", // Match your app's input border color
    padding: 10,
    marginBottom: 10,
    fontSize: 15,
    fontFamily: "Overpass-Regular",
    color: "#fff", // Match your app's text color
  },
  saveButton: {
    color: "#28A745", // Match your app's save button color
    fontFamily: "Overpass-SemiBold",
    textAlign: "center",
    fontSize: 19,
    marginBottom: 5,
  },
  cancelButton: {
    color: "#DC3545", // Match your app's cancel button color
    fontFamily: "Overpass-SemiBold",
    textAlign: "center",
    fontSize: 19,
  },

  container: {
    flex: 1,
    backgroundColor: "black",
  },
  navigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tripText1FlexBox: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },

  helloLayout: {
    height: 48,
    position: "absolute",
  },
  hiJahedPrince1Typo: {
    fontFamily: "Poppins-Medium",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    position: "absolute",
  },
  airportLayout: {
    height: 104,
    width: 365,
    position: "absolute",
  },
  frameViewPosition: {
    backgroundColor: "#07363f",
    borderRadius: 24,
    left: 0,
    top: 0,
  },
  reactLayout: {
    width: 50,
    height: 48,
    position: "absolute",
  },
  nameTypo: {
    fontFamily: "Overpass-SemiBold",
    fontWeight: "600",
    lineHeight: 50,
    letterSpacing: 0,
    fontSize: 40,
    textAlign: "left",
    color: "#fff",
  },
  nameTypo1: {
    fontFamily: "Overpass-SemiBold",
    lineHeight: 55,
    letterSpacing: 1,
    fontSize: 30,
    textAlign: "center",
    color: "#fff",
  },
  nameLayout: {
    width: 136,
    height: 48,
    position: "absolute",
  },
  frameViewLayout: {
    height: 101,
    width: 365,
    position: "absolute",
  },
  reactPosition: {
    top: 15,
    position: "absolute",
  },
  materialSymbolshome1: {
    width: 24,
    height: 24,
    left: 0,
    top: 0,
    position: "absolute",
    overflow: "hidden",
  },
  vectorParent: {
    alignItems: "center",
    flexDirection: "row",
  },

  myProfile1: {
    top: 5,
    fontSize: 38,
    lineHeight: 38,
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
    textAlign: "left",
    color: "#fff",
    left: 0,
    position: "absolute",
  },

  tripText1: {
    top: 363,
    left: 46,
  },
  hiJahedPrince1: {
    top: 282,

    fontSize: 32,
    lineHeight: 48,
    color: "#f7ff88",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
  },
  profilePic: {
    left: 200,
  },
  letsExploreThe1: {
    top: 317,
    textAlign: "center",

    fontSize: 20,
    lineHeight: 30,
    color: "rgba(255, 255, 255, 0.8)",
  },
  airportCradChild: {
    height: 100,
    width: 365,
    position: "absolute",
  },
  airportCradChild4: {
    height: 50,
    width: 365,
    position: "absolute",
  },
  airportCrad1: {
    left: 4,
    top: 0,
  },
  reactIconsfafaenvelope: {
    left: 39,
    top: 22,
  },
  reactIconsfafakey: {
    left: 39,
    top: 22,
  },
  email: {
    left: 100,
    width: 229,
    top: 28,
    height: 48,
    position: "absolute",
  },

  airportCrad2: {
    top: 118,
    left: 0,
  },
  airportCrad3: {
    top: 236,
    left: 0,
  },
  reactIconsfafauser: {
    left: 39,
    top: 22,
  },
  name: {
    fontFamily: "Overpass-SemiBold",
    fontWeight: "600",
    lineHeight: 50,
    letterSpacing: 0,
    fontSize: 40,
    textAlign: "left",
    color: "#fff",
    left: 0,
    top: 0,
  },
  nameWrapper: {
    left: 101,
    top: 31,
  },
  airportCrad: {
    top: 381,
    width: 369,
    height: 340,
    position: "absolute",
    alignContent: "center",
  },
  frameView: {
    backgroundColor: "#07363f",
    borderRadius: 24,
    left: 0,
    top: 0,
  },
  reactIconsfafaheart: {
    top: 25,
    left: 70,
    width: 57,
    height: 58,
    position: "absolute",
  },
  reactIconsfafaregwindowmini: {
    left: 161,
    width: 22,
    height: 72,
  },
  reactIconsfafamapmarked: {
    left: 60,
    width: 71,
    height: 68,
  },
  reactIconsfafawrench: {
    top: 20,
    left: 233,
    width: 55,
    height: 59,
    position: "absolute",
  },
  airportCrad4: {
    top: 360,
    left: 0,
  },

  myProfile: {
    borderRadius: 48,
    backgroundColor: "#070606",
    shadowColor: "#1f1f23",
    shadowOffset: {
      width: 4,
      height: 10,
    },
    shadowRadius: 54,
    elevation: 54,
    shadowOpacity: 1,
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    alignItems: "center",
  },

  hello1: {
    fontSize: 40,
    fontFamily: "Poppins-Bold",
    textAlign: "left",
    fontWeight: "700",
    lineHeight: 54,
    color: "#fff",
    left: 0,
    top: 0,
    margin: 5,
    position: "relative",
  },
  helloChild: {
    top: 10,
    left: 295,
    width: 60,
    height: 50,
    position: "absolute",
  },
  hello: {
    top: 65,
    width: 400,
    height: 190,
    left: -15,
    position: "relative",
    alignContent: "flex-start",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  helloLayout2: {
    height: 100,
    position: "absolute",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
  },
  helloChild2: {
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    width: 80,
    top: 120,
  },
  hello2: {
    top: 70,
    width: 378,
    left: 30,
  },
});

export default MyProfile;
