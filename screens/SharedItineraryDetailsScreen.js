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
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { Entypo } from "@expo/vector-icons";
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
import BottomNavigation from "../components/BottomNavigation";
import Swipeout from "react-native-swipeout";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const SharedItineraryDetailsScreen = ({ route }) => {
  const { sharedItineraryId, userProfilePicture } = route.params;
  const [editingActivity, setEditingActivity] = useState(null);
  const [itineraryData, setItineraryData] = useState(null);
  const [newActivityTexts, setNewActivityTexts] = useState([]);
  const [itineraryDocId, setItineraryDocId] = useState("");
  const [userProfilePicture1, setUserProfilePicture] =
    useState(userProfilePicture);

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

    // Create a reference to the specific shared itinerary document in 'sharedItineraries'
    const sharedItineraryRef = doc(db, "sharedItineraries", sharedItineraryId);

    // Subscribe to real-time updates for the shared itinerary in 'sharedItineraries'
    const unsubscribeSharedItinerary = onSnapshot(
      sharedItineraryRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const sharedItinerary = docSnapshot.data();
          setItineraryData(sharedItinerary);
        }
      }
    );

    // Fetch the user's profile picture URL using the uid from the shared itinerary
    const getUserProfilePicture = async (uid) => {
      const db = getFirestore();
      const userRef = doc(db, "users", uid);

      try {
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUserProfilePicture[userData.profilePictureUrl];
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (itineraryData) {
      // Fetch the user's profile picture when you have the itinerary data
      getUserProfilePicture(itineraryData.uid);
    }

    return () => {
      // Clean up the listener when the component unmounts
      unsubscribeSharedItinerary();
    };
  }, [sharedItineraryId]);

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
      const sharedItineraryRef = doc(
        db,
        "sharedItineraries",
        sharedItineraryId
      );

      // Update Firestore with the updated activities array
      updateDoc(sharedItineraryRef, {
        days: updatedItinerary.days,
      });
    };

    // Function to check if a shared itinerary document exists
    const checkSharedItineraryExists = async (itineraryDocId) => {
      const db = getFirestore();
      const sharedItineraryRef = doc(db, "sharedItineraries", itineraryDocId);

      const docSnapshot = await getDoc(sharedItineraryRef);
      return docSnapshot.exists();
    };

    const updateFirestoreWithActivity = async (activityIndex, text) => {
      const updatedItinerary = { ...itineraryData };
      updatedItinerary.days[index].activities[activityIndex] = text;

      const db = getFirestore();
      const sharedItineraryRef = doc(
        db,
        "sharedItineraries",
        sharedItineraryId
      );

      // Update the Firestore document with the updated activity
      await updateDoc(sharedItineraryRef, {
        days: updatedItinerary.days,
      });

      // Check if the original itinerary document exists before updating it
      const originalItineraryExists = await checkSharedItineraryExists(
        sharedItineraryId
      );

      if (originalItineraryExists) {
        const originalItineraryRef = doc(db, "itineraries", sharedItineraryId);
        await updateDoc(originalItineraryRef, {
          days: updatedItinerary.days,
        });
      } else {
        console.log("Original itinerary does not exist.");
      }
    };

    const addNewActivity = (dayIndex) => {
      const newText = newActivityTexts[dayIndex]; // Get the text for the current day
      if (newText.trim() !== "") {
        const updatedItinerary = { ...itineraryData };
        updatedItinerary.days[dayIndex].activities.push(newText);

        // Update the local state to reflect the added activity
        const updatedItineraryCopy = { ...itineraryData };
        updatedItineraryCopy.days[dayIndex].activities =
          updatedItinerary.days[dayIndex].activities;

        setItineraryData(updatedItineraryCopy); // Update the state with the modified itinerary

        const db = getFirestore();
        const sharedItineraryRef = doc(
          db,
          "sharedItineraries",
          sharedItineraryId
        );

        // Update Firestore with the updated activities array
        updateDoc(sharedItineraryRef, {
          days: updatedItinerary.days,
        });

        // Clear the input field for the current day
        const updatedTexts = [...newActivityTexts];
        updatedTexts[dayIndex] = "";
        setNewActivityTexts(updatedTexts);
      }
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
              component: (
                <View
                  style={{
                    backgroundColor: "#357FEE",
                    borderRadius: 15,
                    flex: 0.95,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 1,
                  }}
                >
                  <Feather name="edit" size={28} color="white" />
                </View>
              ),
              backgroundColor: "transparent",
              onPress: () => onEdit(activityIndex),
            },
            {
              component: (
                <View
                  style={{
                    backgroundColor: "#E92B2B",
                    borderRadius: 15,
                    flex: 0.95,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 0,
                  }}
                >
                  <FontAwesome name="trash" size={28} color="white" />
                </View>
              ),
              backgroundColor: "transparent",
              onPress: () => onDelete(activityIndex),
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
                  const updatedItinerary = { ...itineraryData };
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
      <TouchableOpacity activeOpacity={0.8} style={styles.itineraryItem}>
        <LinearGradient
          colors={["rgba(7, 54, 63, 1)", "rgba(10, 46, 53, 1)"]}
          style={styles.linearGradient}
        >
          <View style={styles.iconAndHeader}>
            <Text style={styles.header}>{`Day ${item.dayNumber}`}</Text>
          </View>
          {activities}

          <TextInput
            style={styles.newActivityInput}
            placeholder="Add a new activity"
            value={newActivityTexts[index]}
            onChangeText={(text) => {
              const updatedTexts = [...newActivityTexts];
              updatedTexts[index] = text;
              setNewActivityTexts(updatedTexts);
            }}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addNewActivity(index)}
          >
            <Ionicons
              name="ios-add-circle-outline"
              size={31}
              color="rgba(34, 221, 133, 0.8)"
            />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.backgroundContainer}>
          <View style={styles.hello}>
            <Text style={[styles.hello1, styles.hello1Clr]}>
              Itinerary Details
            </Text>
            <Image
              style={styles.helloChild}
              resizeMode="cover"
              source={require("../assets/Frame.png")}
            />
          </View>
        </View>

        <View style={styles.itineraryContainer}>
          <View style={styles.destinationRow}>
            <View style={styles.profilePictureContainer}>
              {userProfilePicture1 ? (
                <Image
                  style={styles.profilePicture}
                  source={{ uri: userProfilePicture1 }}
                />
              ) : (
                <Entypo name="user" size={75} color="white" />
              )}
            </View>
            <View>
              <Text style={styles.destination}>
                {itineraryData?.destination}
              </Text>
              <Text style={styles.duration}>
                {itineraryData
                  ? `Duration: ${itineraryData.duration} days`
                  : "Loading..."}
              </Text>
            </View>
          </View>
          <FlatList
            style={styles.itineraryList}
            data={itineraryData?.days}
            renderItem={renderDayItem}
            keyExtractor={(item, index) => `${index}`}
          />
        </View>

        <BottomNavigation style={styles.navigation} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  profilePictureContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
    marginLeft: windowWidth * 0.05,
  },
  profilePicture: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 40,
  },

  addButton: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "rgba(25, 130, 252, 0.8)",
    fontSize: 19,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  newActivityInput: {
    fontFamily: "Overpass-SemiBold",
    fontSize: windowWidth * 0.046,
    color: "white",
    textAlign: "center",
    marginBottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 20,
  },
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
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  hello1Clr: {
    color: "#fff",
    textAlign: "left",
  },
  hello1: {
    fontSize: windowWidth * 0.095,
    fontFamily: "Poppins-Bold",
    textAlign: "left",
    fontWeight: "700",
    lineHeight: 54,
    color: "#fff",
    left: windowWidth * 0.01,
    top: 0,
    margin: 5,
    position: "absolute",
  },
  helloChild: {
    top: windowHeight * 0.01,
    left: windowWidth * 0.8,
    width: 60,
    height: 50,
    position: "absolute",
  },
  hello: {
    top: windowHeight * 0.065,
    width: 400,
    height: 190,
    left: windowWidth * 0.01,
    position: "absolute",
  },
  itineraryContainer: {
    flex: 1,
    top: windowHeight * 0.13,
    left: 0,
    right: 0,
    bottom: 0,
    position: "absolute",
  },

  destination: {
    color: "#F7FF88",
    fontSize: windowWidth * 0.075,
    marginTop: 15,
    padding: 0,
    textAlign: "left",
    letterSpacing: 0,
    textTransform: "uppercase",
    fontFamily: "Poppins-Medium",
    left: windowWidth * 0.03,
  },
  duration: {
    fontSize: windowWidth * 0.055,
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
    left: windowWidth * 0.03,
  },
  itineraryList: {
    padding: 15,
    marginBottom: 65,
  },
  navigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

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
    fontSize: windowWidth * 0.07,
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
    fontSize: windowWidth * 0.06,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    paddingTop: 30,
    fontFamily: "Overpass-Medium",
  },
  itineraryDetails: {
    fontFamily: "Overpass-SemiBold",
    fontSize: windowWidth * 0.05,
    color: "white",
    textAlign: "center",
  },
});

export default SharedItineraryDetailsScreen;
