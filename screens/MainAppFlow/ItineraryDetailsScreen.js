import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Button,
} from "react-native";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";
import { useSelector } from "react-redux";
import BottomNavigation from "../../components/BottomNavigation";
import Swipeout from "react-native-swipeout";

const ItineraryDetailsScreen = ({ route }) => {
  const { itinerary } = route.params;
  const [editingActivity, setEditingActivity] = useState(null);
  const [itineraryData, setItineraryData] = useState(itinerary);

  if (!itinerary) {
    return <Text>Loading...</Text>;
  }

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

    // Add Firestore queries and listeners here
    return () => {
      // Cleanup code if needed
    };
  }, []);

  const renderDayItem = ({ item, index }) => {
    const onEdit = (activityIndex) => {
      setEditingActivity({ dayIndex: index, activityIndex });
    };

    const onDelete = (activityIndex) => {
      const updatedItinerary = { ...itineraryData };
      updatedItinerary.days[index].activities.splice(activityIndex, 1);

      // Update the local state to reflect the deleted activity
      const updatedItineraryCopy = { ...itineraryData };
      updatedItineraryCopy.days[index].activities =
        updatedItinerary.days[index].activities;

      setItineraryData(updatedItineraryCopy); // Update the state with the modified itinerary

      const db = getFirestore();
      const itineraryRef = doc(db, "itineraries", itinerary.id);

      // Update Firestore with the updated activities array
      updateDoc(itineraryRef, {
        days: updatedItinerary.days,
      });
    };

    const updateFirestoreWithActivity = (activityIndex, text) => {
      const updatedItinerary = { ...itinerary };
      updatedItinerary.days[index].activities[activityIndex] = text;

      const db = getFirestore();
      const itineraryRef = doc(db, "itineraries", itinerary.id);

      // Update the Firestore document with the updated activity
      updateDoc(itineraryRef, {
        days: updatedItinerary.days,
      });
    };

    const activities = item.activities.map((activity, activityIndex) => {
      const isEditing =
        activityIndex === editingActivity?.activityIndex &&
        editingActivity?.dayIndex === index;

      const onPress = () => {
        if (!isEditing) {
          setEditingActivity({
            dayIndex: index,
            activityIndex,
          });
        }
      };

      return (
        <Swipeout
          right={[
            {
              text: "Edit",
              backgroundColor: "#357FEE",
              onPress: () => onEdit(activityIndex),
            },
            {
              text: "Delete",
              backgroundColor: "#E92B2B",
              onPress: () => onDelete(activityIndex), // Call the onDelete function here
            },
          ]}
          autoClose={true}
          backgroundColor="transparent"
          key={activityIndex}
        >
          <TouchableOpacity onPress={onPress}>
            {isEditing ? (
              <TextInput
                style={styles.itineraryDetails}
                value={activity}
                onChangeText={(text) => {
                  // Update the local state
                  const updatedItinerary = { ...itinerary };
                  updatedItinerary.days[index].activities[activityIndex] = text;
                  setEditingActivity({
                    dayIndex: index,
                    activityIndex,
                  });
                }}
                onBlur={() => {
                  setEditingActivity(null);
                  // Update Firestore with the new activity text here
                  updateFirestoreWithActivity(activityIndex, activity);
                }}
                onSubmitEditing={() => {
                  setEditingActivity(null);
                  // Update Firestore with the new activity text here
                  updateFirestoreWithActivity(activityIndex, activity);
                }}
                autoFocus
                multiline
                blurOnSubmit={true}
              />
            ) : (
              <Text style={styles.itineraryDetails}>
                {activity.startsWith("-") ? activity.slice(1).trim() : activity}
              </Text>
            )}
          </TouchableOpacity>
          {activityIndex !== item.activities.length - 1 && <Text>{"\n"}</Text>}
        </Swipeout>
      );
    });

    return (
      <View style={styles.itineraryItem}>
        <LinearGradient
          colors={["rgba(7, 54, 63, 1)", "rgba(10, 46, 53, 1)"]}
          style={styles.linearGradient}
        >
          <View style={styles.iconAndHeader}>
            <Text style={styles.header}>{`Day ${item.dayNumber}`}</Text>
          </View>
          {activities}
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <View style={styles.hello}>
          <Text style={[styles.hello1, styles.hello1Clr]}>
            Itinerary Details
          </Text>
          <Image
            style={styles.helloChild}
            resizeMode="cover"
            source={require("../../assets/Frame.png")} // Replace with the actual image path
          />
        </View>
      </View>

      <View style={styles.itineraryContainer}>
        <Text style={styles.destination}>{itinerary.destination} </Text>
        <Text
          style={styles.duration}
        >{`Duration: ${itinerary.duration} days`}</Text>

        <FlatList
          style={styles.itineraryList}
          data={itinerary.days}
          renderItem={renderDayItem}
          keyExtractor={(item, index) => `${index}`}
        />
      </View>

      <BottomNavigation style={styles.navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  activityContainer: {
    marginBottom: 5,
  },
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  c60ee25f093d85a18569d288610075Icon: {
    left: 0,
    top: 0,
  },

  childPosition: {
    backgroundColor: "transparent",
    left: 0,
    top: 0,
  },
  backgroundContainer: {
    flex: 1,
  },

  hello1Clr: {
    color: "#fff",
    textAlign: "left",
  },
  hello1: {
    fontSize: 40,
    fontFamily: "Poppins-Bold",
    textAlign: "left",
    fontWeight: "700",
    lineHeight: 54,
    color: "#fff",
    left: 5,
    top: 0,
    margin: 5,
    position: "absolute",
  },
  helloChild: {
    top: 15,
    left: 335,
    width: 60,
    height: 50,
    position: "absolute",
  },
  hello: {
    top: 65,
    width: 400,
    height: 190,
    left: 10,
    position: "absolute",
  },
  itineraryContainer: {
    flex: 1, // Let this container take up all available space
    top: 110, // Adjust this value as needed
    left: 0,
    right: 0,
    bottom: 0, // Ensure it stretches to the bottom
    position: "absolute",
  },

  destination: {
    color: "#F7FF88",
    fontSize: 35,
    marginTop: 20,
    padding: 0,
    textAlign: "left",
    letterSpacing: 0,
    textTransform: "uppercase",
    fontFamily: "Poppins-Medium",
    left: 20,
  },
  duration: {
    fontSize: 24,
    fontWeight: "500",
    marginTop: 0,
    marginBottom: 10,
    padding: 0,
    color: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "#000000",
    textAlign: "left",
    letterSpacing: 0,
    lineHeight: 30,
    textTransform: "uppercase",
    fontFamily: "Poppins-Medium",
    left: 20,
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
  // iconAndHeader: {
  //   flexDirection: "row", // Arrange items horizontally
  //   alignItems: "center", // Align items vertically in the center
  //   marginBottom: 10, // Add margin as needed
  // },
  itineraryItem: {
    marginBottom: 15,
    borderRadius: 30,
    overflow: "hidden",
  },
  linearGradient: {
    paddingTop: 0,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  header: {
    fontSize: 31,
    fontWeight: "700",
    fontFamily: "Overpass-Bold",
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 10,
    marginBottom: 10,
    color: "rgba(34, 221, 133, 1)",
    textAlign: "center",
    justifyContent: "center",
  },
  viewDetails: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    paddingTop: 30,
    fontFamily: "Overpass-Medium",
  },
  itineraryDetails: {
    fontFamily: "Overpass-SemiBold",
    fontSize: 21,
    color: "white",
    textAlign: "center", // Add this line to center-align the text
  },
});

export default ItineraryDetailsScreen;
