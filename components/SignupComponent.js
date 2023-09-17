import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  AuthErrorCodes,
} from "firebase/auth";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { sendEmailVerification } from "firebase/auth";

import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SignupComponent = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Add state for the user's name
  const [error, setError] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  const handleClick = () => {
    navigation.navigate("signin");
  };

  const isPasswordValid = (password) => {
    // Implement your custom password requirements here
    // Example: Password should be at least 8 characters and include at least one digit
    const minLength = 6;
    const hasDigit = /\d/.test(password);

    return password.length >= minLength && hasDigit;
  };

  const handleSignUp = async () => {
    try {
      Keyboard.dismiss();

      // Check for empty fields
      if (email === "" || password === "" || name === "") {
        setError("All fields must be entered.");
        return;
      }

      if (!isPasswordValid(password)) {
        setError(
          "Password should be at least 6 characters and include at least one digit."
        );
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User signed up:", user);

      // Send email verification
      await sendVerificationEmail(user);

      // Create a Firestore document for the user with UID as document ID
      const userDocRef = doc(db, "users", user.uid);
      // Set the document data, including the user's name
      await setDoc(userDocRef, {
        email,
        uid: user.uid,
        name, // Include the user's name
        // Add other user data here
        profilePictureUrl,
      });

      // Redirect to the login page or any desired screen
      navigation.navigate("signin");

      setError(null);
    } catch (error) {
      const errorCode = error.code;
      console.error("Firebase Error Code:", errorCode); // Print the error code to the console

      let errorMessage = "An error occurred. Please try again.";

      // Customized error message
      switch (errorCode) {
        case "auth/email-already-in-use":
          errorMessage = "Email is already in use. Please choose another.";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters.";
          break;
        default:
          // Use the default error message
          break;
      }

      // Now check for empty fields
      if (email === "" || password === "" || name === "") {
        errorMessage = "All fields must be entered.";
      }

      setError(errorMessage);
      console.error("Registration error:", error);
    }
  };

  const sendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user);
      console.log("Verification email sent.");
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.backgroundOverlay} />
        <Text style={styles.loginTitle}>Sign Up</Text>
        <View style={styles.haveAccountContainer}>
          <Text style={styles.haveAccountText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink} onPress={handleClick}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <FontAwesome
              style={styles.userIcon}
              name="user-circle"
              size={23}
              color="#6C6C6C"
            />
            <TextInput
              style={styles.inputLabel}
              placeholder="Name"
              value={name}
              onChangeText={(text) => setName(text)}
              blurOnSubmit={true}
              placeholderTextColor="#4C4C4C"
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons
              name="mail"
              style={styles.userIcon}
              size={24}
              color="#6C6C6C"
            />

            <TextInput
              style={styles.inputLabel}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              blurOnSubmit={true}
              placeholderTextColor="#4C4C4C"
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <FontAwesome5
              style={styles.userIcon}
              name="key"
              size={23}
              color="#6C6C6C"
            />
            <TextInput
              style={styles.inputLabel}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
              blurOnSubmit={true}
              placeholderTextColor="#4C4C4C"
            />
          </View>
        </View>
        <TouchableOpacity
          underlayColor="transparent"
          style={styles.signupButtonContainer}
          onPress={handleSignUp}
        >
          <Text style={styles.signupButton}>Sign Up</Text>
        </TouchableOpacity>
        {error && <Text style={styles.errorMessage}>{error}</Text>}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 24,
    width: 320,
    height: 390,
    // top: 10,
    // left: 125,
  },
  backgroundOverlay: {
    position: "absolute",
    backgroundColor: "rgba(7, 54, 63, 0.8)",
    borderRadius: 24,
    width: 370,
    height: 440,
  },
  loginTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    lineHeight: 48,
    color: "#f7ff88",
    marginTop: 20,
    textTransform: "uppercase",
  },
  haveAccountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    width: 230,
  },
  haveAccountText: {
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 1)",
  },
  loginLink: {
    fontFamily: "Poppins-Medium",
    color: "#00a3ff",
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    width: 300,
  },
  inputIcon: {
    backgroundColor: "#091C20",
    borderRadius: 24,
    width: 300,
    height: 40,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  icon: {
    height: 27,
    width: 26,
  },
  inputLabel: {
    fontFamily: "Poppins-Medium",
    color: "#848484",
    marginLeft: 10,
    fontSize: 20,
    width: 240,
  },
  signupButtonContainer: {
    backgroundColor: "#00a3ff",
    borderRadius: 24,
    width: 280,
    height: 40,
    marginTop: 20,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 20,
    marginRight: 20,
  },
  signupButton: {
    fontFamily: "Poppins-Medium",
    color: "#fff",
    fontSize: 20,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  userIcon: {
    marginLeft: 10,
  },

  errorMessage: {
    fontFamily: "Poppins-Medium",
    color: "#FD5D5D",
    marginTop: 5,
    fontSize: 14,
    marginBottom: 20,
    textDecorationLine: "underline",
    marginLeft: 6,
    marginRight: 6,
    textAlign: "center",
  },
});

export default SignupComponent;
