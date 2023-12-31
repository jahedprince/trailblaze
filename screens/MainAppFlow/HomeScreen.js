import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Keyboard,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
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
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { useUser } from "../../Providers/UserContext"; // Update the import path to match your project structure

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const HomeScreen = () => {
  const navigation = useNavigation(); // Use the useNavigation hook
  const route = useRoute();
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}`;

  const [itineraries, setItineraries] = useState([]);
  const [itineraryCounts, setItineraryCounts] = useState({});
  // const userData = route.params?.userData; // Get user data passed from Login screen
  const { userData } = useUser(); // Get the userData from the context

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
    // const { uid } = route.params;

    const itinerariesCollection = collection(db, "itineraries");
    const sharedItinerariesCollection = collection(db, "sharedItineraries"); // Assuming this is the correct collection name

    const unsubscribe = onSnapshot(itinerariesCollection, (querySnapshot) => {
      const userItineraries = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((itinerary) => itinerary.uid === userData.uid); // Filter itineraries by user's uid

      // Create a promise for each itinerary to fetch the count of usersRequested
      const promises = userItineraries.map(async (itinerary) => {
        // Check if the same itinerary exists in the sharedItineraries collection
        const sharedItineraryDocRef = doc(
          sharedItinerariesCollection,
          itinerary.id
        );
        const sharedItineraryDoc = await getDoc(sharedItineraryDocRef);

        if (sharedItineraryDoc.exists()) {
          // Calculate the count of usersRequested based on the sharedItineraries document
          const usersRequestedCount =
            sharedItineraryDoc.data().usersRequested.length;

          return { id: itinerary.id, usersRequestedCount };
        } else {
          return { id: itinerary.id, usersRequestedCount: 0 };
        }
      });

      // Use Promise.all to wait for all counts to be fetched
      Promise.all(promises).then((counts) => {
        const countsObj = counts.reduce((acc, curr) => {
          acc[curr.id] = curr.usersRequestedCount;
          return acc;
        }, {});

        // Update the itineraryCounts state variable
        setItineraryCounts(countsObj);
      });

      // Set the itineraries state variable as before
      setItineraries(userItineraries);
    });

    // Create a promise for each itinerary to fetch the count of usersRequested
    const promises = itineraries.map(async (itinerary) => {
      // Check if the same itinerary exists in the sharedItineraries collection
      const sharedItineraryDocRef = doc(
        sharedItinerariesCollection,
        itinerary.id
      );
      const sharedItineraryDoc = await getDoc(sharedItineraryDocRef);

      if (sharedItineraryDoc.exists()) {
        // Calculate the count of usersRequested based on the sharedItineraries document
        const usersRequestedCount =
          sharedItineraryDoc.data().usersRequested.length;

        return { id: itinerary.id, usersRequestedCount };
      } else {
        return { id: itinerary.id, usersRequestedCount: 0 };
      }
    });

    // Use Promise.all to wait for all counts to be fetched
    Promise.all(promises).then((counts) => {
      const countsObj = counts.reduce((acc, curr) => {
        acc[curr.id] = curr.usersRequestedCount;
        return acc;
      }, {});

      // Update the itineraryCounts state variable
      setItineraryCounts(countsObj);
    });

    return () => {
      unsubscribe();
    };
  }, [userData, itineraries]);

  const firstName = userData.name.split(" ")[0];

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

  const updateDestinationNameInFirestore = async (
    itineraryId,
    newDestinationName
  ) => {
    try {
      const db = getFirestore();
      const itineraryRef = doc(db, "itineraries", itineraryId);

      // Update the destination name in the "itineraries" collection
      await setDoc(
        itineraryRef,
        { destination: newDestinationName },
        { merge: true }
      );

      // Check if the shared itinerary document exists before updating it
      const sharedItineraryExists = await checkSharedItineraryExists(
        itineraryId
      );

      if (sharedItineraryExists) {
        // Update the destination name in the "sharedItineraries" collection
        const sharedItineraryRef = doc(db, "sharedItineraries", itineraryId);
        await setDoc(
          sharedItineraryRef,
          { destination: newDestinationName },
          { merge: true }
        );
      } else {
        console.log("Shared itinerary does not exist.");
      }

      // Update the state with the new destination name
      setItineraries((prevItineraries) =>
        prevItineraries.map((item) =>
          item.id === itineraryId
            ? { ...item, destination: newDestinationName }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating destination name:", error);
    }
  };

  const checkSharedItineraryExists = async (itineraryDocId) => {
    const db = getFirestore();
    const sharedItineraryRef = doc(db, "sharedItineraries", itineraryDocId);

    const docSnapshot = await getDoc(sharedItineraryRef);
    return docSnapshot.exists();
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

      updateDestinationNameInFirestore(itineraryId, newDestination);
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
      onEdit={(newDestination) => editItinerary(item.id, newDestination)}
      usersRequestedCount={itineraryCounts[item.id] || 0}
    />
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            <Text style={[styles.hello1, styles.hello1Clr]}>Hello,</Text>
            <Text
              style={[
                styles.hello2,
                styles.hello1Clr2,
                firstName.length > 6 && { fontSize: 45 },
                firstName.length >= 7 && { fontSize: 39 },
                firstName.length >= 8 && { fontSize: 35 },
                firstName.length >= 9 && { fontSize: 32 },
                firstName.length >= 10 && { fontSize: 29 },
                firstName.length >= 11 && { fontSize: 24 },
                firstName.length >= 12 && { fontSize: 20 },
                firstName.length >= 13 && { fontSize: 16 },
              ]}
            >
              {firstName}
            </Text>
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
    </TouchableWithoutFeedback>
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
    left: windowWidth * 0.02,
  },
  c60ee25f093d85a18569d288610075Icon: {
    left: 0,
    top: 0,
  },
  hiGif: {
    left: windowWidth * 0.7,
    height: 120,
    width: 120,
    top: windowHeight * 0.06,
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
    top: windowHeight * 0.02,
    position: "absolute",
  },
  hello1Clr2: {
    color: "#fff",
    textAlign: "left",
  },
  hello2: {
    marginTop: 5,
    fontSize: 54,
    fontFamily: "Poppins-Bold",
    textAlign: "left",
    color: "#fff",
    left: 0,
    top: windowHeight * 0.055,
    position: "absolute",
  },
  helloChild: {
    top: windowHeight * 0.075,
    left: windowWidth * 0.51,
    width: 63,
    height: 50,
    position: "absolute",
  },
  hello: {
    top: windowHeight * 0.065,
    width: 220,
    left: windowHeight * 0.015,
    position: "absolute",
  },
  itineraryContainer: {
    flex: 1, // Let this container take up all available space
    top: windowHeight * 0.21, // Adjust this value as needed
    left: 0,
    right: 0,
    bottom: windowHeight * 0.035, // Ensure it stretches to the bottom

    position: "absolute",
  },
  itineraryList: {
    padding: 15,
    marginBottom: windowHeight * 0.06, // Height of the BottomNavigation
  },
  navigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default HomeScreen;
