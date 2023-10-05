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
  Modal,
  Pressable,
  SafeAreaView,
  SectionList,
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
  arrayUnion,
  arrayRemove,
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
  const currentDate = new Date();
  const { itinerary } = route.params;
  const [editingActivity, setEditingActivity] = useState(null);
  const [itineraryData, setItineraryData] = useState(itinerary);
  const [newActivityTexts, setNewActivityTexts] = useState(
    Array(itineraryData.days.length).fill("")
  );
  const [itineraryDocId, setItineraryDocId] = useState("");
  const [isItineraryUploaded, setIsItineraryUploaded] = useState(false);

  // New state variables for the modal and users
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [usersAdded, setUsersAdded] = useState([]);
  const [usersRequested, setUsersRequested] = useState([]);

  const [usersAddedNames, setUsersAddedNames] = useState({});
  const [usersRequestedNames, setUsersRequestedNames] = useState({});

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

  const fetchUserName = async (userUID) => {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, "users", userUID); // Replace "users" with your actual collection name
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        return userData.name;
      } else {
        return "Unknown User";
      }
    } catch (error) {
      console.error("Error fetching user name: ", error);
      return "Unknown User";
    }
  };

  const toggleModal = async () => {
    setIsModalVisible(!isModalVisible);

    if (!isModalVisible) {
      // If the modal is being opened, fetch user names for usersAdded and usersRequested
      try {
        const db = getFirestore();
        const sharedItineraryRef = doc(db, "sharedItineraries", itineraryDocId);
        const sharedItineraryDoc = await getDoc(sharedItineraryRef);

        if (sharedItineraryDoc.exists()) {
          const sharedItineraryData = sharedItineraryDoc.data();
          setUsersAdded(sharedItineraryData.usersAdded || []);
          setUsersRequested(sharedItineraryData.usersRequested || []);

          // Fetch and update user names for usersAdded
          const usersAddedNamesData = {};
          for (const userUID of sharedItineraryData.usersAdded || []) {
            const userName = await fetchUserName(userUID);
            usersAddedNamesData[userUID] = userName;
          }
          setUsersAddedNames(usersAddedNamesData);

          // Fetch and update user names for usersRequested
          const usersRequestedNamesData = {};
          for (const userUID of sharedItineraryData.usersRequested || []) {
            const userName = await fetchUserName(userUID);
            usersRequestedNamesData[userUID] = userName;
          }
          setUsersRequestedNames(usersRequestedNamesData);
        }
      } catch (error) {
        console.error("Error fetching usersAdded and usersRequested: ", error);
      }
    }
  };

  // Function to add a user to the usersAdded array and remove them from usersRequested
  const addUserToAdded = async (user) => {
    try {
      const db = getFirestore();
      const itineraryRef = doc(db, "itineraries", itineraryDocId);
      const sharedItineraryRef = doc(db, "sharedItineraries", itineraryDocId);

      // Check if the user is already in the usersAdded array
      if (!usersAdded.includes(user)) {
        // Update Firestore to add the user to the itinerary's "usersAdded" array
        await updateDoc(itineraryRef, {
          usersAdded: arrayUnion(user),
        });

        // Update Firestore to remove the user from the itinerary's "usersRequested" array
        await updateDoc(itineraryRef, {
          usersRequested: arrayRemove(user),
        });

        // Update the local state to reflect the changes
        setUsersAdded([...usersAdded, user]);

        // Call the removeUserFromRequested function to remove the user from usersRequested
        removeUserFromRequested(user);

        // Also update the shared itinerary document
        await updateDoc(sharedItineraryRef, {
          usersAdded: arrayUnion(user),
        });
      }
    } catch (error) {
      console.error("Error adding user to usersAdded: ", error);
    }
  };

  // Function to remove a user from the usersRequested array
  const removeUserFromRequested = async (user) => {
    try {
      const db = getFirestore();
      const itineraryRef = doc(db, "itineraries", itineraryDocId);
      const sharedItineraryRef = doc(db, "sharedItineraries", itineraryDocId);

      // Update Firestore to remove the user from the itinerary's "usersRequested" array
      await updateDoc(itineraryRef, {
        usersRequested: arrayRemove(user),
      });

      // Update the local state to reflect the change
      const updatedUsersRequested = usersRequested.filter(
        (requestedUser) => requestedUser !== user
      );
      setUsersRequested(updatedUsersRequested);

      // Also update the shared itinerary document
      await updateDoc(sharedItineraryRef, {
        usersRequested: arrayRemove(user),
      });
    } catch (error) {
      console.error("Error removing user from usersRequested: ", error);
    }
  };

  // Function to remove a user from the usersAdded array
  const removeUserFromAdded = async (user) => {
    const updatedUsersAdded = usersAdded.filter(
      (addedUser) => addedUser !== user
    );
    setUsersAdded(updatedUsersAdded);

    // Implement Firestore update logic to remove the user from the itinerary
    const db = getFirestore();
    const sharedItineraryRef = doc(db, "sharedItineraries", itineraryDocId);

    try {
      const sharedItinerarySnapshot = await getDoc(sharedItineraryRef);

      if (sharedItinerarySnapshot.exists()) {
        const sharedItineraryData = sharedItinerarySnapshot.data();
        const updatedUsersAdded = sharedItineraryData.usersAdded.filter(
          (addedUser) => addedUser !== user
        );

        // Update Firestore with the updated usersAdded array
        await updateDoc(sharedItineraryRef, {
          usersAdded: updatedUsersAdded,
        });

        console.log(`Removed ${user} from usersAdded`);
      } else {
        console.error("Shared itinerary document does not exist.");
      }
    } catch (error) {
      console.error("Error removing user from usersAdded: ", error);
    }
  };

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
          usersAdded: [itinerary.uid], // Initialize "usersAdded" as an empty array
          usersRequested: [],
          dateAdded: currentDate,
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
        usersAdded: [itinerary.uid], // Initialize "usersAdded" as an empty array
        usersRequested: [],
        dateAdded: currentDate,
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
            style={styles.addButtonq}
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
            <TouchableOpacity style={styles.usersButton} onPress={toggleModal}>
              <FontAwesome name="users" size={30} color="#357FEE" />
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

        {/* Modal for displaying users */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <SafeAreaView>
                <SectionList
                  sections={[
                    {
                      title: "Users Added",
                      data: usersAdded,
                    },
                    {
                      title: "Users Requested",
                      data: usersRequested,
                    },
                  ]}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  renderItem={({ item, section }) => (
                    <View style={styles.userItem}>
                      <Text style={styles.userName}>
                        {section.title === "Users Added"
                          ? usersAddedNames[item] || "Unknown User"
                          : usersRequestedNames[item] || "Unknown User"}
                      </Text>
                      {section.title === "Users Requested" && (
                        <>
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                              addUserToAdded(item);
                            }}
                          >
                            <FontAwesome
                              name="plus-circle"
                              size={20}
                              color="#34C759"
                            />
                          </TouchableOpacity>
                          {usersRequested.length > 0 && (
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => {
                                removeUserFromRequested(item);
                              }}
                            >
                              <FontAwesome
                                name="minus-circle"
                                size={20}
                                color="#FF3B30"
                              />
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                      {section.title === "Users Added" &&
                        usersAdded.length > 0 && (
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => {
                              removeUserFromAdded(item);
                            }}
                          >
                            <FontAwesome
                              name="minus-circle"
                              size={20}
                              color="#FF3B30"
                            />
                          </TouchableOpacity>
                        )}
                    </View>
                  )}
                  renderSectionHeader={({ section: { title, data } }) => (
                    <Text style={styles.sectionHeader}>
                      {title} ({data.length})
                    </Text>
                  )}
                />

                <Pressable onPress={toggleModal} style={styles.modalClose}>
                  <FontAwesome name="times-circle" size={30} color="#888" />
                </Pressable>
              </SafeAreaView>
            </View>
          </View>
        </Modal>

        <BottomNavigation style={styles.navigation} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  addButtonq: {
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
    marginTop: windowHeight * 0.02,
    marginLeft: windowWidth * 0.055,
  },
  backgroundContainer: {
    flex: 1,
  },
  destinationRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
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

  usersButton: {
    backgroundColor: "transparent",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: windowHeight * 0.015,
  },

  // Styles for the modal
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#D8D8D8",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: windowWidth * 0.035,
    paddingLeft: windowWidth * 0.035,
    paddingRight: windowWidth * 0.035,
    paddingBottom: windowHeight * 0.05,
    maxHeight: windowHeight * 0.7,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#757575",
    paddingVertical: 10,
    paddingRight: windowWidth * 0.02,
  },
  userName: {
    fontSize: windowWidth * 0.045,
    textTransform: "uppercase",
    fontFamily: "Overpass-SemiBold",
  },
  addButton: {
    padding: windowWidth * 0.01,
    marginLeft: windowWidth * 0.01,
  },
  removeButton: {
    padding: windowWidth * 0.01,
  },
  sectionHeader: {
    fontSize: windowWidth * 0.05,
    fontFamily: "Overpass-Bold",
    marginTop: windowHeight * 0.015,
  },
  modalClose: {
    position: "absolute",
    top: windowHeight * 0.01,
    right: windowHeight * 0.01,
  },
});

export default ItineraryDetailsScreen;
