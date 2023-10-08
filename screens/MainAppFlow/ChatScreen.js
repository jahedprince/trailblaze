import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  Keyboard,
  Dimensions,
} from "react-native";
import axios from "axios"; // Import axios or use fetch
import {
  GiftedChat,
  InputToolbar,
  MessageBubble,
  Composer,
  Time,
  Bubble,
  Avatar,
  Send,
  MessageText,
} from "react-native-gifted-chat";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { updateItinerary } from "../../reducers/itineraryActions";
import createTravelItinerary from "../../api";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import BottomNavigation from "../../components/BottomNavigation";

import {
  FIREBASE_API_KEY,
  FIREBASE_API_KEY2,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";
import { getAuth } from "firebase/auth";
import { useUser } from "../../Providers/UserContext";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

/* eslint-disable prettier/prettier */

const ChatScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const { userData } = useUser();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  const apiKey = FIREBASE_API_KEY2;

  const dispatch = useDispatch();
  const auth = getAuth();

  const handleSend = async (newMessages = []) => {
    try {
      //get user message

      const userMessage = newMessages[0];

      //add the user's message to the messages state
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, userMessage)
      );
      const messageText = userMessage.text.toLowerCase();
      const keywords = [
        "itinerary",
        "plan",
        "schedule",
        "trip",
        "travel",
        "visit",
        "explore",
        "vacation",
        "holiday",
        "journey",
        "adventure",
        "destination",
        "place",
        "tour",
        "city",
        "country",
        "go to",
        "travel to",
      ];
      if (!keywords.some((keyword) => messageText.includes(keyword))) {
        const botMessage = {
          _id: new Date().getTime() + 1,
          text: "I can help you create a travel itinerary. Just let me know the destination and duration of your trip. Please provide the travel destination and the duration of your trip in the format: 'Travel to Destination for X days'.",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "Travel Bot",
          },
        };
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, botMessage)
        );
        return;
      }

      // Extract travel destination and duration from user input
      const match = messageText.match(
        /(?:to|in)\s*([^0-9]+)(?:\s*for\s*(\d+)\s*)?(?:days|day)/
      );

      const destination = match ? match[1].trim() : "";

      const duration = match ? parseInt(match[2]) : 0;

      if (!destination || duration <= 0) {
        // Handle incorrect input
        const botMessage = {
          _id: new Date().getTime() + 1,
          text: "Sorry, I couldn't understand your input. Please provide the travel destination and the duration of your trip in the format: 'Travel to Destination for X days'.",
          createdAt: new Date(),
          user: {
            _id: 3,
            name: "Travel Bot",
          },
        };
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, botMessage)
        );
        return;
      }

      setIsGeneratingItinerary(true);

      // Use OpenAI API to generate a response for travel itinerary
      const itinerary = await createTravelItinerary(
        destination,
        duration,
        apiKey
      );

      setIsGeneratingItinerary(false);

      const botMessage = {
        _id: `bot-${new Date().getTime()}`,
        text: itinerary,
        createdAt: new Date(),
        user: {
          _id: 4,
          name: "Travel Bot",
        },
      };

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, botMessage)
      );

      // Process the itinerary text to extract day-by-day details
      const daysPattern = /Day\s+(\d+):\s+(.*?)(?=(?:Day\s+\d+|$))/gs;
      let dayMatches;
      const dayDetails = [];

      while ((dayMatches = daysPattern.exec(itinerary)) !== null) {
        const dayNumber = parseInt(dayMatches[1]);
        const activities = dayMatches[2]
          .split(/\n/)
          .filter((activity) => activity.trim() !== "")
          .map((activity) => activity.trim());
        dayDetails.push({ dayNumber, activities });
      }

      // Create the newItinerary object with extracted data
      const newItinerary = {
        destination,
        duration,
        days: dayDetails,
        text: itinerary,
      };

      // Dispatch to Redux (if needed)
      dispatch(updateItinerary(newItinerary));

      // Check if the user wants to save the itinerary in Firebase
      Alert.alert("Save Itinerary", "Do you want to save this itinerary?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Save",
          onPress: async () => {
            // Save the newItinerary to Firestore with UID
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

            // Get the UID of the signed-in user
            const user = auth.currentUser;
            const uid = user ? user.uid : null;

            // Add UID to the newItinerary object
            const newItineraryWithUID = { ...newItinerary, uid };

            await addDoc(itinerariesCollection, newItineraryWithUID);

            // Navigate to HomeScreen with newItinerary data
            navigation.navigate("Home", { newItinerary });
          },
        },
      ]);
    } catch (error) {
      setIsGeneratingItinerary(false);
      console.log(error);
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <View style={styles.hello}>
          <Text style={[styles.hello1, styles.hello1Clr]}>ItineraChat</Text>
          <Image
            style={styles.helloChild}
            resizeMode="cover"
            source={require("../../assets/Frame.png")} // Replace with the actual image path
          />
        </View>
      </View>
      {isGeneratingItinerary ? (
        <View style={styles.generating}>
          <Text style={styles.generatingText}>
            Generating itinerary, please wait...
          </Text>
        </View>
      ) : (
        <GiftedChat
          messages={messages}
          onSend={(newMessages) => handleSend(newMessages)}
          user={{
            _id: 1,
          }}
          renderSend={(props) => {
            const { text, user, onSend } = props;
            return (
              <TouchableOpacity
                onPress={() => {
                  if (text && onSend) {
                    onSend(
                      {
                        text: text.trim(),
                        user: user,
                      },
                      true
                    );
                  }
                }}
                style={styles.customSend}
              >
                <Ionicons name="ios-send-sharp" size={30} color="#22DD85" />
              </TouchableOpacity>
            );
          }}
          renderInputToolbar={(props) => (
            <InputToolbar
              {...props}
              containerStyle={{
                backgroundColor: "#2E2E2E",
                borderTopColor: "#2E2E2E",
                borderRadius: 10,
              }}
            />
          )}
          renderTime={(props) => (
            <Time
              {...props}
              timeTextStyle={{
                left: {
                  color: "black",
                },
                right: {
                  color: "white",
                },
              }}
            />
          )}
          renderComposer={(props) => (
            <Composer
              {...props}
              textInputStyle={{
                backgroundColor: "#555555",
                borderRadius: 5,
                color: "white",
                paddingTop: 10,
                paddingLeft: 10,
                marginRight: 10,
              }}
              placeholder={`"Travel to ______ for __ days..."`}
            />
          )}
          const
          renderBubble={(props) => (
            <Bubble
              {...props}
              wrapperStyle={{
                right: {
                  borderRadius: 10,
                  backgroundColor: "#07363F",
                },
                left: {
                  borderRadius: 10,
                  backgroundColor: "#ccc",
                },
              }}
              containerToPreviousStyle={{
                right: { borderRadius: 10 },
                left: { borderRadius: 10 },
              }}
              containerToNextStyle={{
                right: { borderRadius: 10 },
                left: { borderRadius: 10 },
              }}
              containerStyle={{
                right: { borderRadius: 10 },
                left: { borderRadius: 10 },
              }}
            />
          )}
          renderAvatar={() => null}
        />
      )}
      {!isKeyboardVisible && <BottomNavigation />}
    </View>
  );
};

/* eslint-disable prettier/prettier */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: "black",
  },
  generating: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  generatingText: {
    color: "white",
    textAlign: "center",
    fontFamily: "Poppins-Medium",
    fontSize: windowWidth * 0.045,
  },
  backgroundContainer: {
    flex: 0.18,
    alignContent: "center",
    left: windowWidth * 0.16,
  },

  hello1Clr: {
    color: "#fff",
    textAlign: "center",
  },
  hello1: {
    fontSize: windowWidth * 0.095,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 54,
    color: "#fff",
    top: 0,
    margin: 5,
    position: "absolute",
  },
  helloChild: {
    top: windowHeight * 0.015,
    left: windowWidth * 0.565,
    width: 60,
    height: 50,
    position: "absolute",
  },
  hello: {
    top: windowHeight * 0.065,
    width: 400,
    height: 190,
    left: 0,
    position: "absolute",
  },
  customSend: {
    marginBottom: 5,
    marginRight: 5,
  },
});

export default ChatScreen;
