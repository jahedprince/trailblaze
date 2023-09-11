import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { initializeApp } from "firebase/app";

import BottomNavigation from "../../components/BottomNavigation";
import ItineraryItem from "../../components/ItineraryItem";
import { LinearGradient } from "expo-linear-gradient";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc, // Import the deleteDoc function
} from "firebase/firestore";

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}`;

  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    const firebaseConfig = {
      apiKey: FIREBASE_API_KEY,
      authDomain: FIREBASE_AUTH_DOMAIN,
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET,
      messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
      appId: FIREBASE_APP_ID,
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const itinerariesCollection = collection(db, "itineraries");

    const unsubscribe = onSnapshot(itinerariesCollection, (querySnapshot) => {
      const updatedItineraries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItineraries(updatedItineraries);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Define the deleteItinerary function
  const deleteItinerary = async (itineraryId) => {
    try {
      const db = getFirestore(); // Get Firestore instance
      const itineraryRef = doc(db, "itineraries", itineraryId); // Get reference to the itinerary document
      await deleteDoc(itineraryRef); // Delete the document from Firestore

      // Remove the deleted itinerary from the state
      setItineraries((prevItineraries) =>
        prevItineraries.filter((item) => item.id !== itineraryId)
      );
    } catch (error) {
      console.error("Error deleting itinerary:", error);
    }
  };

  const editItinerary = async (itineraryId, newDestination) => {
    try {
      const db = getFirestore(); // Get Firestore instance
      const itineraryRef = doc(db, "itineraries", itineraryId); // Get reference to the itinerary document

      // Update the destination field in Firestore
      await setDoc(
        itineraryRef,
        { destination: newDestination },
        { merge: true }
      );

      // Update the state with the new destination
      setItineraries((prevItineraries) =>
        prevItineraries.map((item) =>
          item.id === itineraryId
            ? { ...item, destination: newDestination }
            : item
        )
      );
    } catch (error) {
      console.error("Error editing itinerary:", error);
    }
  };

  const renderItineraryItem = ({ item }) => (
    <ItineraryItem
      item={item}
      onPress={() =>
        navigation.navigate("ItineraryDetails", { itinerary: item })
      }
      onDelete={() => deleteItinerary(item.id)}
      onEdit={(newDestination) => editItinerary(item.id, newDestination)} // Pass the editItinerary function
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <View style={styles.hiGif}>
          <LinearGradient
            style={styles.childPosition}
            locations={[0, 1]}
            colors={["#bca5ed", "#bca5ed"]}
            useAngle={true}
            angle={180}
          />
          <Image
            style={[
              styles.c60ee25f093d85a18569d288610075Icon,
              styles.hiGifChildLayout,
            ]}
            resizeMode="cover"
            source={require("../../assets/65cb5e914bea8968c52a39b7a42e0b8c22c60ee25f093d85a18569d288610075-1.png")} // Replace with the actual image path
          />
        </View>

        <View style={styles.hello}>
          <Text style={[styles.hello1, styles.hello1Clr]}>Hello...</Text>
          <Image
            style={styles.helloChild}
            resizeMode="cover"
            source={require("../../assets/Frame.png")} // Replace with the actual image path
          />
        </View>
      </View>

      <View style={styles.itineraryContainer}>
        <Text style={styles.title}>My Itineraries</Text>
        <FlatList
          style={styles.itineraryList}
          data={itineraries}
          renderItem={renderItineraryItem}
          keyExtractor={(item) => item.id}
        />
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
  backgroundContainer: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: "500",
    marginTop: 15,
    padding: 5,
    color: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "#000000",
    textAlign: "left",
    letterSpacing: 1,
    lineHeight: 30,
    textTransform: "uppercase",
    fontFamily: "Poppins-Medium",
    left: 10,
  },
  c60ee25f093d85a18569d288610075Icon: {
    left: 0,
    top: 0,
  },
  hiGif: {
    left: 300,
    height: 120,
    width: 120,
    top: 50,
    position: "absolute",
  },
  childPosition: {
    backgroundColor: "transparent",
    left: 0,
    top: 0,
  },
  hiGifChildLayout: {
    borderBottomLeftRadius: 50,
    height: 135,
    width: 135,
    position: "absolute",
  },
  hello1Clr: {
    color: "#fff",
    textAlign: "left",
  },
  hello1: {
    fontSize: 54,
    fontFamily: "Poppins-Bold",
    textAlign: "left",
    fontWeight: "700",
    lineHeight: 54,
    color: "#fff",
    left: 0,
    top: 25,
    position: "absolute",
  },
  helloChild: {
    top: 75,
    left: 200,
    width: 63,
    height: 50,
    position: "absolute",
  },
  hello: {
    top: 60,
    width: 220,
    height: 122,
    left: 10,
    position: "absolute",
  },
  itineraryContainer: {
    flex: 1, // Let this container take up all available space
    top: 200, // Adjust this value as needed
    left: 0,
    right: 0,
    bottom: 0, // Ensure it stretches to the bottom
    position: "absolute",
  },
  itineraryList: {
    padding: 15,
    marginBottom: 65, // Height of the BottomNavigation
  },
  navigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default HomeScreen;
