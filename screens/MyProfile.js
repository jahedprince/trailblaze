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
  ActivityIndicator,
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
import { width } from "deprecated-react-native-prop-types/DeprecatedImagePropType";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  const [isLoadingImage, setLoadingImage] = useState(true);

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
            const userName = userData.name || "";

            setName(userName);

            // Check if the profile picture URL is already cached
            const cachedProfilePictureUrl = await AsyncStorage.getItem(
              "profilePictureUrl"
            );

            if (cachedProfilePictureUrl) {
              // If cached URL is available, use it directly
              setProfilePictureUrl(cachedProfilePictureUrl);
              setLoadingImage(false);
            } else {
              const userProfilePicUrl = userData.profilePictureUrl || null;
              setProfilePictureUrl(userProfilePicUrl);

              if (userProfilePicUrl) {
                await Image.prefetch(userProfilePicUrl);
                setLoadingImage(false);
                // Cache the profile picture URL for future use
                await AsyncStorage.setItem(
                  "profilePictureUrl",
                  userProfilePicUrl
                );
              } else {
                setLoadingImage(false);
              }
            }
          } else {
            console.error("User document does not exist in Firestore");
            setLoadingImage(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoadingImage(false);
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

      if (!user) {
        console.error("User is not authenticated.");
        return;
      }

      // Set isLoadingImage to true while the new image is being uploaded
      setLoadingImage(true);

      // Ask for permission to access the device's photo library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access photos was denied");
        setLoadingImage(false);
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.cancelled) {
        // Create a subfolder based on the user's UID
        const userId = user.uid;
        const fileName = `${userId}_${Date.now()}.jpg`;
        const storageRef = ref(
          storage,
          `profilePictures/${userId}/${fileName}`
        );

        // Upload the image
        const response = await fetch(result.uri);
        const blob = await response.blob();

        // Upload the image to the subfolder
        const snapshot = await uploadBytesResumable(storageRef, blob);

        // Get the download URL of the uploaded image
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Update the profile picture URL in Firestore
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
          profilePictureUrl: downloadURL,
        });

        // Remove the cached profile picture URL
        await AsyncStorage.removeItem("profilePictureUrl");

        // Set the profile picture URL in the component state
        setProfilePictureUrl(downloadURL);

        // Set isLoadingImage to false once the image is successfully uploaded
        setLoadingImage(false);
      } else {
        // Set isLoadingImage to false if the user cancels the image upload
        setLoadingImage(false);
      }
    } catch (error) {
      console.error("Error selecting/uploading profile picture:", error);
      setLoadingImage(false);
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

      // Retrieve the current profile picture URL from Firestore
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.error("User document does not exist in Firestore");
        return;
      }

      const userData = userDocSnap.data();
      const profilePictureUrl = userData.profilePictureUrl;

      if (!profilePictureUrl) {
        console.error("No profile picture to delete");
        return;
      }

      // Extract the timestamp from the URL (assuming it's part of the filename)
      const fileNameParts = profilePictureUrl.split("/");
      const fileName = fileNameParts[fileNameParts.length - 1];
      const timestamp = fileName.split("_")[1].split(".")[0];

      // Construct the correct storage path
      const storagePath = `profilePictures/${userId}/${userId}_${timestamp}.jpg`;

      // Delete the profile picture file from Firebase Storage
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);

      // Update the profile picture URL in Firestore to null
      await updateDoc(userDocRef, {
        profilePictureUrl: null,
      });

      // Remove the cached profile picture URL
      await AsyncStorage.removeItem("profilePictureUrl");

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
      <View style={styles.main}>
        <View style={styles.centeredContainer}>
          <View style={styles.hello}>
            <Text style={styles.hello1}>My Profile</Text>
            <Image
              style={styles.helloChild}
              resizeMode="cover"
              source={require("../assets/Frame.png")}
            />
          </View>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.profileInfo}>
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={toggleImageModal}
            >
              {isLoadingImage ? ( // Display the loading indicator while fetching
                <ActivityIndicator size="large" color="#fff" />
              ) : profilePictureUrl ? (
                <Image
                  source={{ uri: profilePictureUrl }}
                  resizeMode="cover"
                  style={styles.profileImage}
                />
              ) : (
                <Entypo
                  style={styles.profileImage1}
                  name="user"
                  size={130}
                  color="white"
                />
              )}
            </TouchableOpacity>

            <Text style={styles.nameText}>Hi, {name}!</Text>
            <Text style={styles.exploreText}>Let’s Explore the World.</Text>
          </View>
          <View style={styles.iconsContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleNameModal}
            >
              <View style={styles.iconBackground}>
                <FontAwesome name="user" size={40} color="#6C6C6C" />
              </View>
              <Text style={styles.iconText}>NAME</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleEmailModal}
            >
              <View style={styles.iconBackground}>
                <MaterialIcons name="email" size={40} color="#6C6C6C" />
              </View>
              <Text style={styles.iconText}>EMAIL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={togglePasswordModal}
            >
              <View style={styles.iconBackground}>
                <Ionicons name="key" size={40} color="#6C6C6C" />
              </View>
              <Text style={styles.iconText}>PASSWORD</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton1} onPress={handleLogout}>
              <Text style={styles.iconTextWhite}>LOGOUT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton2}
              onPress={toggleDeleteModal}
            >
              <Text style={styles.iconTextWhite}>DELETE ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </View>

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
              <TouchableOpacity onPress={() => updateUserEmail(email)}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleEmailModal}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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

      <BottomNavigation style={styles.navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  main: {
    flex: 1,
  },
  centeredContainer: {
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    backgroundColor: "black", // You can change the background color if needed
    marginTop: windowHeight * 0.065,
  },
  hello: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "black",
  },
  helloChild: {
    width: 60,
    height: 50,
  },
  hello1: {
    fontSize: windowWidth * 0.095,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
    color: "#fff",
    marginLeft: 5, // Add margin to separate from the image
  },

  profileContainer: {
    paddingHorizontal: 20,
    paddingTop: windowHeight * 0.07,

    justifyContent: "space-between",
  },
  profileInfo: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "black",
  },
  profileImageContainer: {
    marginRight: windowWidth * 0.02,
    marginBottom: windowHeight * 0.02,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 75,
  },
  profileImag1: {
    width: 130,
    height: 130,
    borderRadius: 75,
  },
  nameText: {
    fontFamily: "Overpass-SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "left",
    fontSize: windowWidth * 0.07, // Adjust this as needed
    color: "#f7ff88",
  },
  exploreText: {
    textAlign: "left",
    fontSize: windowWidth * 0.05, // Adjust this as needed
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Overpass-Medium",
  },
  iconsContainer: {
    marginTop: windowHeight * 0.03,
    backgroundColor: "black",
    alignItems: "center",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: windowWidth * 0.03,
    width: windowWidth * 0.7,
    height: windowHeight * 0.07,
    borderRadius: 24,
    backgroundColor: "#07363f",
  },
  iconButton1: {
    flexDirection: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: windowWidth * 0.02,
    width: windowWidth * 0.7,
    height: windowHeight * 0.05,
    borderRadius: 24,
    backgroundColor: "#f74a4a",
  },
  iconButton2: {
    flexDirection: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: windowWidth * 0.02,
    width: windowWidth * 0.7,
    height: windowHeight * 0.05,
    borderRadius: 24,
    backgroundColor: "red",
  },
  iconBackground: {
    backgroundColor: "#07363f",
    borderRadius: 24,
    width: windowWidth * 0.2,
    height: windowHeight * 0.06,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 0,
  },

  iconText: {
    fontFamily: "Overpass-SemiBold",
    fontWeight: "600",
    letterSpacing: 0.1,
    fontSize: windowWidth * 0.06, // Adjust this as needed
    textAlign: "left",
    color: "#fff",
  },
  iconTextWhite: {
    fontFamily: "Overpass-SemiBold",
    lineHeight: 40,
    letterSpacing: 1,
    fontSize: windowWidth * 0.045,
    textAlign: "center",
    color: "#fff",
  },
  navigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

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
});

export default MyProfile;
