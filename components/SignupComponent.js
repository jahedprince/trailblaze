import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
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

const SignupComponent = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleClick = () => {
    navigation.navigate("signin");
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User signed up:", user);

      // Create a Firestore document for the user with UID as document ID
      const userDocRef = doc(db, "users", user.uid);

      // Set the document data
      await setDoc(userDocRef, {
        email,
        uid: user.uid,

        // Add other user data here
      });

      // Redirect to the login page or any desired screen
      navigation.navigate("signin");
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = "An error occurred. Please try again.";

      // Customize the error message based on the error code
      switch (errorCode) {
        case AuthErrorCodes.EMAIL_ALREADY_IN_USE:
          errorMessage = "Email is already in use. Please choose another.";
          break;

        // Add more cases as needed

        default:
          // Use the default error message
          break;
      }

      setError(errorMessage);
      console.error("Registration error:", error);
    }
  };

  return (
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
        style={styles.signupButtonContainer}
        onPress={handleSignUp}
      >
        <Text style={styles.signupButton}>Sign Up</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorMessage}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
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
  },
  signupButtonContainer: {
    backgroundColor: "#00a3ff",
    borderRadius: 24,
    width: 321,
    height: 49,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  signupButton: {
    fontFamily: "Poppins-Medium",
    color: "#fff",
    fontSize: 20,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  errorMessage: {
    fontFamily: "Poppins-Medium",
    color: "red",
    marginTop: 10,
    fontSize: 16,
  },
});

export default SignupComponent;
