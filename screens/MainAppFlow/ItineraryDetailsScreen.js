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
  addDoc,
  setDoc,
  getDoc,
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
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const ItineraryDetailsScreen = ({ route }) => {
  const { itinerary } = route.params;
  const [editingActivity, setEditingActivity] = useState(null);
  const [itineraryData, setItineraryData] = useState(itinerary);
  const [newActivityTexts, setNewActivityTexts] = useState(
    Array(itineraryData.days.length).fill("")
  );
  const [itineraryDocId, setItineraryDocId] = useState("");
  const [isItineraryUploaded, setIsItineraryUploaded] = useState(false);

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

    // Create a reference to the specific itinerary document in 'itineraries'
    const itineraryRef = doc(db, "itineraries", itinerary.id);

    // Create a reference to the corresponding document in 'sharedItineraries'
    const sharedItineraryRef = doc(db, "sharedItineraries", itinerary.id);

    // Subscribe to real-time updates for the specific itinerary in 'itineraries'
    const unsubscribeItinerary = onSnapshot(itineraryRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const updatedItinerary = docSnapshot.data();
        setItineraryData(updatedItinerary);

        // Check if the corresponding document exists in 'sharedItineraries'
        getDoc(sharedItineraryRef).then((sharedDocSnapshot) => {
          if (sharedDocSnapshot.exists()) {
            // Update the destination name in 'sharedItineraries'
            updateDoc(sharedItineraryRef, {
              destination: updatedItinerary.destination,
            });
          }
        });
      }
    });

    setItineraryDocId(itinerary.id);

    const checkIfItineraryIsUploaded = async () => {
      const db = getFirestore();

      // Create a reference to the specific itinerary document in 'sharedItineraries'
      const sharedItineraryRef = doc(db, "sharedItineraries", itinerary.id);

      try {
        const sharedItinerarySnapshot = await getDoc(sharedItineraryRef);
        if (sharedItinerarySnapshot.exists()) {
          setIsItineraryUploaded(true);
        } else {
          setIsItineraryUploaded(false);
        }
      } catch (error) {
        console.error("Error checking if itinerary is uploaded: ", error);
      }
    };

    checkIfItineraryIsUploaded();

    return () => {
      // Clean up the listeners when the component unmounts
      unsubscribeItinerary();
    };
  }, []);

  const uploadOrCancelItinerary = async () => {
    try {
      const db = getFirestore();
      const sharedItinerariesRef = collection(db, "sharedItineraries");

      if (isItineraryUploaded) {
        // If the itinerary is already uploaded, remove it from sharedItineraries
        const sharedItineraryDocRef = doc(sharedItinerariesRef, itinerary.id);
        await deleteDoc(sharedItineraryDocRef);
        setIsItineraryUploaded(false);
      } else {
        // If the itinerary is not uploaded, upload it to sharedItineraries
        const sharedItineraryDocRef = doc(sharedItinerariesRef, itinerary.id);

        await setDoc(sharedItineraryDocRef, {
          destination: itinerary.destination,
          duration: itinerary.duration,
          uid: itinerary.uid,
          days: itinerary.days,
          // Add any other relevant data here
        });

        setIsItineraryUploaded(true);
      }
    } catch (error) {
      console.error("Error uploading/canceling itinerary: ", error);
    }
  };

  const uploadItinerary = async () => {
    try {
      const db = getFirestore();
      const sharedItinerariesRef = collection(db, "sharedItineraries");

      // Use the correct 'itineraryDocId' when updating the shared itinerary
      const sharedItineraryDocRef = doc(sharedItinerariesRef, itineraryDocId);

      // Create a new document in the "sharedItineraries" collection
      await setDoc(sharedItineraryDocRef, {
        destination: itinerary.destination,
        duration: itinerary.duration,
        uid: itinerary.uid,
        days: itinerary.days,
        // Add any other relevant data here
      });

      // The new itinerary has been uploaded
      console.log("Itinerary uploaded with ID: ", itineraryDocId);
    } catch (error) {
      console.error("Error uploading itinerary: ", error);
    }
  };

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

    // Function to check if a shared itinerary document exists
    const checkSharedItineraryExists = async (itineraryDocId) => {
      const db = getFirestore();
      const sharedItineraryRef = doc(db, "sharedItineraries", itineraryDocId);

      const docSnapshot = await getDoc(sharedItineraryRef);
      return docSnapshot.exists();
    };

    const updateFirestoreWithActivity = async (activityIndex, text) => {
      const updatedItinerary = { ...itinerary };
      updatedItinerary.days[index].activities[activityIndex] = text;

      const db = getFirestore();
      const itineraryRef = doc(db, "itineraries", itineraryDocId);

      // Update the Firestore document with the updated activity
      await updateDoc(itineraryRef, {
        days: updatedItinerary.days,
      });

      // Check if the shared itinerary document exists before updating it
      const sharedItineraryExists = await checkSharedItineraryExists(
        itineraryDocId
      );

      if (sharedItineraryExists) {
        const sharedItineraryRef = doc(db, "sharedItineraries", itineraryDocId);
        await updateDoc(sharedItineraryRef, {
          days: updatedItinerary.days,
        });
      } else {
        console.log("Shared itinerary does not exist.");
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
        const itineraryRef = doc(db, "itineraries", itinerary.id);

        // Update Firestore with the updated activities array
        updateDoc(itineraryRef, {
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
                    borderRadius: 15, // Set the borderRadius here
                    flex: 0.95,
                    justifyContent: "center",
                    alignItems: "center",

                    marginBottom: 1,
                  }}
                  // onPress={startEditing}
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
                    borderRadius: 15, // Set the borderRadius here
                    flex: 0.95,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 0,
                  }}
                  // onPress={() => onDelete(item.id)}
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
            {/* <Text style={styles.buttonText}>Add Activity</Text> */}
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
              source={require("../../assets/Frame.png")}
            />
          </View>
        </View>

        <View style={styles.itineraryContainer}>
          <View style={styles.destinationRow}>
            <Text style={styles.destination}>{itinerary.destination}</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={uploadOrCancelItinerary}
            >
              <FontAwesome
                name={isItineraryUploaded ? "times-circle" : "cloud-upload"}
                size={38}
                color={isItineraryUploaded ? "red" : "#BCA5ED"}
              />
            </TouchableOpacity>
          </View>
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
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
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
  uploadButton: {
    backgroundColor: "transparent",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: windowWidth * 0.035,
    marginTop: windowHeight * 0.01,
  },
  backgroundContainer: {
    flex: 1,
  },
  destinationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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

export default ItineraryDetailsScreen;
