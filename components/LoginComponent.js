import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  AuthErrorCodes,
  sendPasswordResetEmail,
} from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useUser } from "../Providers/UserContext";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

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

// fetchUserDataFromFirestore function
const fetchUserDataFromFirestore = async (userUid) => {
  try {
    const userRef = collection(db, "users");
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

const fetchUserItinerariesFromFirestore = async (userUid) => {
  try {
    const itinerariesRef = collection(db, "itineraries");
    const itinerariesQuery = query(
      itinerariesRef,
      where("userUid", "==", userUid)
    );
    const itinerariesSnapshot = await getDocs(itinerariesQuery);

    const userItineraries = [];

    itinerariesSnapshot.forEach((doc) => {
      const itineraryData = doc.data();
      userItineraries.push(itineraryData);
    });

    return userItineraries;
  } catch (error) {
    throw error;
  }
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const LoginComponent = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [userUid, setUserUid] = useState(null); // New state variable to store the user's UID
  const { setUserData } = useUser();

  const handleClick = () => {
    navigation.navigate("signup");
  };

  const handleSignIn = async () => {
    try {
      Keyboard.dismiss();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if the user's email is verified
      if (!user.emailVerified) {
        setError("Verify your email before signing in");
        return;
      }

      console.log("User signed in:", user);

      // Set the user's UID
      setUserUid(user.uid);

      // Fetch user-specific data from Firestore
      const userData = await fetchUserDataFromFirestore(user.uid);

      // Fetch user-specific itineraries
      const userItineraries = await fetchUserItinerariesFromFirestore(user.uid);

      setUserData(userData);

      // Redirect to the homepage and pass user data and itineraries as navigation parameters
      navigation.navigate("Home", { userData, userItineraries, userUid }); // Pass userUid as a parameter

      setError(null);
    } catch (error) {
      if (email === "" || password === "") {
        setError("All fields must be entered.");
      } else {
        const errorCode = error.code;
        let errorMessage = "An error occurred. Please try again.";

        console.log(errorCode);

        switch (errorCode) {
          case "auth/invalid-email":
          case "auth/invalid-password":
            errorMessage = "Email and/or password may be wrong.";
            break;
          case "auth/user-not-found":
            errorMessage = "User not found. Please check your credentials.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many requests. Please try again later.";
            break;

          // Add more cases as needed

          default:
            // Use the default error message
            break;
        }

        setError(errorMessage);
      }

      //   console.error("Authentication error:", error);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (email === "") {
        setError("Please enter your email address.");
        return;
      }

      await sendPasswordResetEmail(auth, email);

      // Password reset email sent successfully
      setError("Password reset email sent. Check your inbox.");
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Password reset error:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.backgroundOverlay} />
        <Text style={styles.loginTitle}>Login</Text>
        <View style={styles.dontHaveAccountContainer}>
          <Text style={styles.dontHaveAccountText}>Don't have an account?</Text>
          <Text style={styles.signUp} onPress={handleClick}>
            Sign Up
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <FontAwesome
              style={styles.userIcon}
              name="user"
              size={28}
              color="#6C6C6C"
            />
            <TextInput
              style={styles.inputLabel}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              placeholderTextColor="#4C4C4C"
              blurOnSubmit={true}
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <FontAwesome5
              style={styles.userIcon}
              name="key"
              size={22.5}
              color="#6C6C6C"
            />
            <TextInput
              style={styles.inputLabel}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholderTextColor="#4C4C4C"
              blurOnSubmit={true}
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
        <Text style={styles.forgotPassword} onPress={handleForgotPassword}>
          Forgot Password?
        </Text>
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
    borderRadius: windowWidth * 0.05,
    width: windowWidth * 0.78,
    height: windowHeight * 0.45,
    padding: 10,
  },
  backgroundOverlay: {
    position: "absolute",
    backgroundColor: "rgba(7, 54, 63, 0.8)",
    borderRadius: windowWidth * 0.05,
    width: windowWidth * 0.89,
    height: windowHeight * 0.5,
  },
  loginTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: windowWidth * 0.075,
    color: "#f7ff88",
    marginTop: 20,
    textTransform: "uppercase",
  },
  dontHaveAccountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    textAlign: "center",
    justifyContent: "center",
  },
  dontHaveAccountText: {
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 1)",
    fontSize: windowWidth * 0.035,
  },
  signUp: {
    fontFamily: "Poppins-Medium",
    color: "#00a3ff",
    marginLeft: 5,
    fontSize: windowWidth * 0.035,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    width: windowWidth * 0.7,
    textAlign: "center",
    justifyContent: "center",
  },
  inputIcon: {
    backgroundColor: "#091C20",
    borderRadius: 24,
    width: windowWidth * 0.7,
    height: windowWidth * 0.1,
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
    fontSize: windowWidth * 0.045,
    width: windowWidth * 0.56,
  },

  loginButtonContainer: {
    backgroundColor: "#00a3ff",
    borderRadius: 24,
    width: windowWidth * 0.7,
    height: windowWidth * 0.09,
    marginTop: 20,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButton: {
    fontFamily: "Poppins-Medium",
    color: "#fff",
    fontSize: windowWidth * 0.05,
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
    marginTop: 10,
    fontSize: windowWidth * 0.035,
    textDecorationLine: "underline",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginComponent;
