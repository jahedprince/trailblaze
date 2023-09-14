import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  AuthErrorCodes,
} from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

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

// Initialize Firebase Authentication
const auth = getAuth(app);

const db = getFirestore(app);

// Define the fetchUserDataFromFirestore function
const fetchUserDataFromFirestore = async (userUid) => {
  try {
    const userRef = collection(db, "users"); // Replace "users" with your Firestore collection name
    const userQuery = query(userRef, where("uid", "==", userUid));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.docs.length === 1) {
      const userData = userSnapshot.docs[0].data();
      return userData;
    } else {
      throw new Error("User not found in Firestore");
    }
  } catch (error) {
    throw error;
  }
};

const LoginComponent = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleClick = () => {
    navigation.navigate("signup");
  };

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User signed in:", user);

      // Fetch user-specific data from Firestore
      const userData = await fetchUserDataFromFirestore(user.uid);

      // Redirect to the homepage and pass user data as navigation parameters
      navigation.navigate("Home", { userData });
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = "An error occurred. Please try again.";

      // Customize the error message based on the error code
      switch (errorCode) {
        case AuthErrorCodes.INVALID_EMAIL:
        case AuthErrorCodes.INVALID_PASSWORD:
          errorMessage = "Email and/or password may be wrong.";
          break;

        // Add more cases as needed

        default:
          // Use the default error message
          break;
      }

      setError(errorMessage);
      console.error("Authentication error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundOverlay} />
      <Text style={styles.loginTitle}>Login</Text>
      <View style={styles.dontHaveAccountContainer}>
        <Text style={styles.dontHaveAccountText}>Don't have an account?</Text>
        <Text style={styles.signUp} onPress={handleClick}>
          {" "}
          Sign Up
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.inputIcon}>
          <TextInput
            style={styles.inputLabel}
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.inputIcon}>
          <TextInput
            style={styles.inputLabel}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
        </View>
      </View>
      <TouchableOpacity
        underlayColor="transparent"
        style={styles.loginButtonContainer}
        onPress={handleSignIn}
      >
        <Text style={styles.loginButton}>Login</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorMessage}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 10,
    left: 125,
    alignItems: "center",
  },
  backgroundOverlay: {
    position: "absolute",
    backgroundColor: "rgba(7, 54, 63, 0.8)",
    borderRadius: 24,
    width: 350,
    height: 340,
  },
  loginTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    lineHeight: 48,
    color: "#f7ff88",
    marginTop: 20,
    textTransform: "uppercase",
  },
  dontHaveAccountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    width: 230,
  },
  dontHaveAccountText: {
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 1)",
  },
  signUp: {
    fontFamily: "Poppins-Medium",
    color: "#00a3ff",
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
  },
  loginButtonContainer: {
    backgroundColor: "#00a3ff",
    borderRadius: 24,
    width: 321,
    height: 49,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButton: {
    fontFamily: "Poppins-Medium",
    color: "#fff",
    fontSize: 20,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  errorMessage: {
    fontFamily: "Poppins-Medium",
    color: "red", // Change to your preferred error text color
    marginTop: 10,
    fontSize: 16, // Change to your preferred font size
  },
});

export default LoginComponent;
