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
  Dimensions,
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
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
  deleteDoc,
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

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

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
  const [passwordInput, setPasswordInput] = useState(""); // State to store the password input
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteError, setDeleteError] = useState(""); // State to store deletion error messages

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
        aspect: [1, 1],
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

  const handleDeleteAccount = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        // User is not authenticated
        setDeleteError("User not authenticated");
        return;
      }

      // Re-authenticate the user with their current password
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete the user's account
      await deleteUser(user);

      // Sign the user out after account deletion
      await signOut(auth);

      // Redirect to the landing page or any other desired action
      navigation.navigate("IPhone14Pro6");
    } catch (error) {
      // Handle account deletion errors, e.g., display an error message to the user
      setDeleteError("Error deleting account. Please try again.");
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
    setNewName("");
  };

  const toggleEmailModal = () => {
    setEmail("");
    setEmailModalVisible(!isEmailModalVisible);
  };

  const togglePasswordModal = () => {
    setPassword("");
    setPasswordModalVisible(!isPasswordModalVisible);
  };

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!isDeleteModalVisible);
    setPassword(""); // Clear the password input field when opening/closing the modal
    setDeleteError(""); // Clear any previous error messages
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
          <TouchableOpacity onPress={toggleImageModal} style={styles.pfp}>
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
          </TouchableOpacity>
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
            <TouchableOpacity
              onPress={toggleNameModal}
              style={[styles.airportCrad1, styles.airportLayout]}
            >
              <View
                style={[styles.airportCradChild, styles.frameViewPosition]}
              />
              <FontAwesome
                style={[styles.reactIconsfafauser]}
                name="user"
                size={50}
                color="#6C6C6C"
              />
              <Text style={[styles.email, styles.nameTypo]}>NAME</Text>
            </TouchableOpacity>
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
            <TouchableOpacity
              onPress={toggleEmailModal}
              style={[styles.airportCrad2, styles.airportLayout]}
            >
              <View
                style={[styles.airportCradChild, styles.frameViewPosition]}
              />
              <MaterialIcons
                style={[styles.reactIconsfafaenvelope]}
                name="email"
                size={50}
                color="#6C6C6C"
              />
              <Text style={[styles.email, styles.nameTypo]}>EMAIL</Text>
            </TouchableOpacity>
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
            <TouchableOpacity
              onPress={togglePasswordModal}
              style={[styles.airportCrad3, styles.airportLayout]}
            >
              <View
                style={[styles.airportCradChild, styles.frameViewPosition]}
              />
              <Ionicons
                style={[styles.reactIconsfafakey]}
                name="key"
                size={50}
                color="#6C6C6C"
              />
              <Text style={[styles.email, styles.nameTypo]}>PASSWORD</Text>
            </TouchableOpacity>
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
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.airportCrad4, styles.airportLayout]}
            >
              <View
                style={[styles.airportCradChild4, styles.frameViewPosition1]}
              />
              <Text style={[styles.email1, styles.nameTypo1]}>LOGOUT</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleDeleteModal}>
            <TouchableOpacity
              onPress={toggleDeleteModal}
              style={[styles.airportCrad5, styles.airportLayout]}
            >
              <View
                style={[styles.airportCradChild5, styles.frameViewPosition1]}
              />
              <Text style={styles.nameTypo2}>DELETE ACCOUNT</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <Modal
            visible={isDeleteModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Confirm Deletion</Text>
                <Text>Please enter your password to confirm:</Text>
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry={true}
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                />
                <Text style={styles.errorText}>{deleteError}</Text>
                <TouchableOpacity onPress={handleDeleteAccount}>
                  <Text style={styles.confirmButton}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleDeleteModal}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
      <BottomNavigation style={styles.navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  // modals
  passwordInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 5,
    color: "#fff",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  confirmButton: {
    color: "green",
    marginBottom: 10,
    fontFamily: "Overpass-SemiBold",
    textAlign: "center",
    fontSize: 19,
  },
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
    width: 200,
    height: 200,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#070606",
    padding: 20,
    borderRadius: 24,
    width: 300,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#6C6C6C",
    padding: 10,
    marginBottom: 10,
    fontSize: 15,
    fontFamily: "Overpass-Regular",
    color: "#fff",
  },
  saveButton: {
    color: "#28A745",
    fontFamily: "Overpass-SemiBold",
    textAlign: "center",
    fontSize: 19,
    marginBottom: 5,
  },
  cancelButton: {
    color: "#DC3545",
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

  hiJahedPrince1Typo: {
    fontFamily: "Poppins-Medium",
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

  // name, email, password

  nameTypo: {
    fontFamily: "Overpass-SemiBold",
    fontWeight: "600",
    letterSpacing: 0.1,
    fontSize: windowWidth * 0.09,
    textAlign: "left",
    color: "#fff",
  },

  // logout typo
  nameTypo1: {
    fontFamily: "Overpass-SemiBold",
    lineHeight: 70,
    letterSpacing: 1,
    fontSize: windowWidth * 0.08,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
    color: "#fff",
  },

  // delete typo
  nameTypo2: {
    fontFamily: "Overpass-SemiBold",
    lineHeight: 40,
    letterSpacing: 1,
    fontSize: windowWidth * 0.05,
    textAlign: "center",
    color: "#fff",
    marginTop: 2,
  },

  //Hi, lets explore

  hiJahedPrince1: {
    // top: 282,
    top: windowHeight * 0.304,
    fontSize: windowWidth * 0.07,
    lineHeight: 48,
    color: "#f7ff88",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
  },
  letsExploreThe1: {
    top: windowHeight * 0.344,
    textAlign: "center",
    fontSize: windowWidth * 0.045,
    justifyContent: "center",
    alignItems: "center",
    lineHeight: 30,
    color: "rgba(255, 255, 255, 0.8)",
  },

  //pfp
  pfp: {
    top: windowHeight * -0.03,
    left: windowWidth * 0.12,
  },

  airportCradChild: {
    height: 100,
    width: 365,
    position: "absolute",
  },
  airportCradChild4: {
    height: 60,
    width: 365,
    position: "absolute",
  },
  airportCradChild5: {
    height: 40,
    width: 365,
    position: "absolute",
  },

  reactIconsfafaenvelope: {
    left: windowWidth * 0.08,
    top: windowHeight * 0.025,
  },
  reactIconsfafakey: {
    left: windowWidth * 0.08,
    top: windowHeight * 0.025,
  },
  reactIconsfafauser: {
    left: windowWidth * 0.095,
    top: windowHeight * 0.025,
  },
  email: {
    left: windowWidth * 0.23,
    width: 229,
    top: windowHeight * 0.03,
    height: 48,
    position: "absolute",
  },

  airportCrad1: {
    left: 0,
    top: 0,
  },
  airportCrad2: {
    top: windowHeight * 0.12,
    left: 0,
  },
  airportCrad3: {
    top: windowHeight * 0.24,
    left: 0,
  },

  airportCrad: {
    top: windowHeight * 0.2,
    width: 360,
    height: 340,
    position: "absolute",
    alignContent: "center",
    justifyContent: "center",
  },

  airportCrad4: {
    top: windowHeight * 0.37,
    left: 0,
  },
  airportCrad5: {
    top: windowHeight * 0.45,
    left: 0,
  },

  myProfile: {
    backgroundColor: "#070606",
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
  },

  hello1: {
    fontSize: windowWidth * 0.095,
    fontFamily: "Poppins-Bold",
    textAlign: "left",
    fontWeight: "700",
    color: "#fff",
    left: 0,
    top: 0,
    margin: 5,
    position: "relative",
  },
  helloChild: {
    top: windowHeight * 0.077,
    left: windowWidth * 0.69,
    width: 60,
    height: 50,
    position: "absolute",
  },
  hello: {
    top: windowHeight * 0.0,
    width: 400,
    height: 190,
    left: windowWidth * -0.04,
    position: "relative",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyProfile;
