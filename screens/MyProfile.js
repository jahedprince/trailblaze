import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  ImagePickerIOS,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import {
  getAuth,
  updateEmail,
  updatePassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import BottomNavigation from "../components/BottomNavigation";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { uploadBytesResumable } from "firebase/storage";

const MyProfile = () => {
  const navigation = useNavigation();

  const handleClick = () => {
    navigation.navigate("IPhone14Pro6");
  };

  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [isEmailModalVisible, setEmailModalVisible] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [isImageModalVisible, setImageModalVisible] = useState(false); // New modal for image upload

  const [newName, setNewName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null); // To store the user's profile picture URL
  const [profilePictureFile, setProfilePictureFile] = useState(null); // To store the selected profile picture file
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;

        if (user) {
          // Retrieve the user document by UID from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // Set the user's name and profile picture URL from Firestore data
            const userName = userData.name || "";

            setName(userName);
            const userProfilePicUrl = userData.profilePictureUrl || null;
            setProfilePictureUrl(userProfilePicUrl);
          } else {
            console.error("User document does not exist in Firestore");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Call the fetchUserData function when the component mounts
    fetchUserData();
  }, []); // The empty dependency array ensures this effect runs once

  const handleEmailValidation = (newEmail) => {
    if (!newEmail.trim()) {
      // Email is empty
      alert("Email cannot be empty");
      return false;
    }

    // Check if the email is in a valid format (you can use a regular expression for this)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handlePasswordValidation = (newPassword) => {
    if (newPassword.length < 6) {
      // Password is too short
      alert("Password must be at least 6 characters long");
      return false;
    }

    // Check if the password contains at least one digit
    if (!/\d/.test(newPassword)) {
      alert("Password must contain at least one digit");
      return false;
    }

    return true;
  };

  const updateUserEmail = async (newEmail) => {
    // Validate the email
    if (!handleEmailValidation(newEmail)) {
      return; // Stop execution if validation fails
    }

    try {
      const user = auth.currentUser;

      // Check if the new email is the same as the current email
      if (newEmail === user.email) {
        alert("New email is the same as the current email.");
        return;
      }

      // Check if the new email is already in use
      const signInMethods = await fetchSignInMethodsForEmail(auth, newEmail);
      if (signInMethods && signInMethods.length > 0) {
        alert("Email is already in use by another user.");
        return;
      }

      // Update the email in Firebase Authentication
      await updateEmail(user, newEmail);

      // Update the email in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        email: newEmail,
      });

      // Set the new email in the component state
      setEmail(newEmail);

      // Close the email modal
      toggleEmailModal();
    } catch (error) {
      console.error("Error updating email:", error);
      // Handle errors, e.g., show an error message to the user
    }
  };

  const handleNameChange = async () => {
    try {
      const user = auth.currentUser;

      // Update the name in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: newName, // Use newName here instead of name
      });

      // Set the new name in the component state
      setName(newName); // Update the name state here

      // Close the name modal
      toggleNameModal();
    } catch (error) {
      console.error("Error updating name:", error);
      // Handle errors, e.g., show an error message to the user
    }
  };

  const updateUserPassword = async (newPassword) => {
    if (!handlePasswordValidation(newPassword)) {
      return; // Stop execution if validation fails
    }
    try {
      const user = auth.currentUser;

      await updatePassword(user, newPassword);

      togglePasswordModal();
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("IPhone14Pro6"); // Redirect to the sign-in screen or any other screen as needed
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleImageUpload = async () => {
    try {
      const user = auth.currentUser;

      // Ask for permission to access the device's photo library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access photos was denied");
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // You can adjust this aspect ratio as needed
        quality: 1, // Image quality (0 to 1)
      });

      if (!result.cancelled) {
        // Upload the selected image to Firebase Storage
        const response = await fetch(result.uri);
        const blob = await response.blob();
        const fileName = `${user.uid}_${Date.now()}.jpg`; // Generate a unique filename
        const storageRef = ref(storage, `profilePictures/${fileName}`);

        // Upload the image
        const snapshot = await uploadBytesResumable(storageRef, blob);

        // Get the download URL of the uploaded image
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Update the profile picture URL in Firestore
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          profilePictureUrl: downloadURL,
        });

        // Set the profile picture URL in the component state
        setProfilePictureUrl(downloadURL);
      }
    } catch (error) {
      console.error("Error selecting/uploading profile picture:", error);
      // Handle errors, e.g., show an error message to the user
    }
  };

  const deleteUserProfilePicture = async () => {
    try {
      const user = auth.currentUser;

      // Check if the user has a UID (user must be authenticated)
      if (!user || !user.uid) {
        alert("User not authenticated");
        return;
      }

      // Get the UID of the authenticated user
      const userId = user.uid;

      // Delete the profile picture file from Firebase Storage
      const fileName = profilePictureUrl.split("/").pop();
      const storageRef = ref(storage, `profilePictures/${userId}/${fileName}`);
      await deleteObject(storageRef);

      // Update the profile picture URL in Firestore to null
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        profilePictureUrl: null,
      });

      // Set the profile picture URL to null in the component state
      setProfilePictureUrl(null);
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      // Handle errors, e.g., show an error message to the user
    }
  };

  const isLongName = name.length > 18;
  const isLongLongName = name.length > 30;

  const toggleImageModal = () => {
    setImageModalVisible(!isImageModalVisible);
  };

  const toggleNameModal = () => {
    setNameModalVisible(!isNameModalVisible);
    // Reset the newName state when closing the modal
    setNewName(""); // Add this line
  };

  const toggleEmailModal = () => {
    setEmail("");
    setEmailModalVisible(!isEmailModalVisible);
  };

  const togglePasswordModal = () => {
    setPassword("");
    setPasswordModalVisible(!isPasswordModalVisible);
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

        <TouchableOpacity onPress={toggleImageModal}>
          <View style={styles.pfp}>
            {profilePictureUrl ? (
              <Image source={{ uri: profilePictureUrl }} style={styles.pfp1} />
            ) : (
              <Entypo
                style={styles.pfp1}
                name="user"
                size={100}
                color="white"
              />
            )}
          </View>
        </TouchableOpacity>

        <Modal
          visible={isImageModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Upload Profile Picture</Text>
              <TouchableOpacity onPress={handleImageUpload}>
                <Text style={styles.uploadButton}>Upload</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteUserProfilePicture}>
                <Text style={styles.deleteButton}>Delete Current Picture</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleImageModal}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Text
          style={[
            styles.hiJahedPrince1,
            styles.hiJahedPrince1Typo,
            isLongName && { fontSize: 20 },
            isLongLongName && { fontSize: 17 },
          ]}
        >
          Hi, {name}!
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
                  value={newName} // Use newName state for the value
                  onChangeText={(text) => setNewName(text)} // Update newName state
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
                  placeholder={email}
                />
                <TouchableOpacity onPress={() => updateUserEmail(email)}>
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
                <TouchableOpacity onPress={() => updateUserPassword(password)}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={togglePasswordModal}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <TouchableOpacity onPress={handleLogout}>
            <View style={[styles.airportCrad4, styles.airportLayout]}>
              <View
                style={[styles.airportCradChild4, styles.frameViewPosition1]}
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
  modalTitle: {
    fontSize: 24,
    fontFamily: "Overpass-Bold",
    marginBottom: 10,
    color: "#fff",
  },
  uploadButton: {
    color: "#28A745",
    fontFamily: "Overpass-SemiBold",
    textAlign: "center",
    fontSize: 19,
    marginBottom: 5,
  },
  deleteButton: {
    color: "#DC3545",
    fontFamily: "Overpass-SemiBold",
    textAlign: "center",
    fontSize: 19,
    marginBottom: 5,
  },
  pfp1: {
    width: 100,
    height: 100,
  },
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
  frameViewPosition1: {
    backgroundColor: "#F53F3F",
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
