import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BottomNavigation from "../components/BottomNavigation";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const SocialPage = () => {
  const navigation = useNavigation();
  const [sharedItineraries, setSharedItineraries] = useState([]);
  const [userProfilePictures, setUserProfilePictures] = useState({});
  const [isDataFetched, setIsDataFetched] = useState(false); // New state variable
  const [userNames, setUserNames] = useState({});

  // Function to fetch shared itineraries from Firestore
  const fetchSharedItineraries = async () => {
    const db = getFirestore();
    const sharedItinerariesCollection = collection(db, "sharedItineraries");

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      query(sharedItinerariesCollection, orderBy("dateAdded", "desc")),
      (querySnapshot) => {
        const itinerariesData = [];
        querySnapshot.forEach((doc) => {
          itinerariesData.push({ id: doc.id, ...doc.data() });
        });

        setSharedItineraries(itinerariesData);
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  };

  // Function to fetch user profile pictures
  const fetchUserProfilePictures = async () => {
    const db = getFirestore();
    const usersCollection = collection(db, "users");

    const userProfilePicturesData = {};

    for (const itinerary of sharedItineraries) {
      const userDocRef = doc(usersCollection, itinerary.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        userProfilePicturesData[itinerary.uid] = userData.profilePictureUrl;
      }
    }

    setUserProfilePictures(userProfilePicturesData);
    setIsDataFetched(true); // Set the flag to true when data is fetched
  };

  const fetchUserNames = async () => {
    const db = getFirestore();
    const usersCollection = collection(db, "users");

    const userNamesData = {};

    for (const itinerary of sharedItineraries) {
      const userDocRef = doc(usersCollection, itinerary.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const fullName = userData.name; // Assuming the name field contains the full name
        const firstName = fullName.split(" ")[0]; // Split full name and extract the first part
        userNamesData[itinerary.uid] = firstName;
      }
    }

    setUserNames(userNamesData);
  };

  useEffect(() => {
    // Fetch shared itineraries and user profile pictures when the component mounts
    fetchSharedItineraries();
  }, []);

  useEffect(() => {
    // Fetch user profile pictures only when shared itineraries change
    if (sharedItineraries.length > 0 && !isDataFetched) {
      fetchUserProfilePictures();
      fetchUserNames(); // Fetch user names here
    }
  }, [sharedItineraries, isDataFetched]);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <View style={styles.backContainer}>
          <View style={styles.hello}>
            <Text style={[styles.hello1, styles.hello1Clr]}>ItineraFeed</Text>
            <Image
              style={styles.helloChild}
              resizeMode="cover"
              source={require("../assets/Frame.png")}
            />
          </View>
        </View>
      </View>

      <View style={styles.itineraryContainer}>
        <Text style={styles.title}>Shared Itineraries:</Text>
        <ScrollView style={styles.itineraryContainer1}>
          {sharedItineraries.map((itinerary) => (
            <TouchableOpacity
              style={styles.itineraryItem}
              onPress={() => {
                // Navigate to SharedItineraryDetailsScreen with the sharedItineraryId
                navigation.navigate("SharedItineraryDetails", {
                  sharedItineraryId: itinerary.id,
                  userProfilePicture: userProfilePictures[itinerary.uid],
                });
              }}
              key={itinerary.id}
            >
              <View style={styles.profile}>
                {userProfilePictures[itinerary.uid] ? (
                  // Render the user's profile picture if available
                  <Image
                    style={styles.itineraryItemImage}
                    resizeMode="cover"
                    source={{ uri: userProfilePictures[itinerary.uid] }}
                  />
                ) : (
                  // Render the user icon if no profile picture is available
                  <Entypo name="user" size={80} color="#757575" />
                )}
                <Text style={styles.name}>{userNames[itinerary.uid]}</Text>
              </View>

              <View style={styles.itineraryItemDetails}>
                <Text style={styles.itineraryItemTitle}>
                  {itinerary.destination}
                </Text>
                <Text style={styles.itineraryItemSubtitle}>
                  Duration: {itinerary.duration} days
                </Text>
              </View>
              {/* You can add an icon or button here for "View Details" */}
            </TouchableOpacity>
          ))}
        </ScrollView>
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

  profile: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: windowWidth * 0.03,
  },
  name: {
    color: "rgba(247, 255, 136, 1)",
    fontFamily: "Poppins-SemiBold",
    fontSize: windowHeight * 0.017,
    textTransform: "uppercase",
    textAlign: "center",
  },
  title: {
    fontSize: windowWidth * 0.05,
    padding: windowHeight * 0.005,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "left",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "Poppins-Medium",
    left: windowWidth * 0.02,
  },

  itineraryContainer: {
    flex: 1,
    top: windowHeight * 0.14,
    left: 0,
    right: 0,
    bottom: 0,
    position: "absolute",
  },
  itineraryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: windowHeight * 0.008,
    marginHorizontal: windowWidth * 0.02,
    borderRadius: windowWidth * 0.05,
    backgroundColor: "#0a2e55",
    height: windowHeight * 0.125,
    paddingTop: windowHeight * 0.008,
  },

  itineraryItemImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  itineraryItemDetails: {
    marginLeft: windowWidth * 0.025,
    flex: 1,
  },
  itineraryItemTitle: {
    color: "#bca5ed",
    fontFamily: "Poppins-Bold",
    fontSize: windowHeight * 0.035,

    textTransform: "uppercase",
  },
  itineraryItemSubtitle: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: windowHeight * 0.02,
    textTransform: "uppercase",
  },

  backContainer: {
    flex: 1,
  },
  hello1Clr: {
    color: "#fff",
    textAlign: "left",
  },
  hello1: {
    fontSize: windowWidth * 0.095,
    fontFamily: "Poppins-Bold",
    textAlign: "left",
    color: "#fff",
    left: windowWidth * 0.183,
    top: 0,
    position: "absolute",
  },
  helloChild: {
    top: windowHeight * 0.01,
    left: windowWidth * 0.73,
    width: windowHeight * 0.05,
    height: windowWidth * 0.1,
    position: "absolute",
  },
  hello: {
    top: windowHeight * 0.065,
    left: windowWidth * 0.01,
    position: "absolute",
  },

  itineraryContainer1: {
    flex: 1, // Let this container take up all available space
    top: windowHeight * 0.05, // Adjust this value as needed
    left: 0,
    right: 0,
    bottom: windowHeight * 0.09, // Ensure it stretches to the bottom

    position: "absolute",
  },
});

export default SocialPage;
