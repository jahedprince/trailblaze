import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Button,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Swipeout from "react-native-swipeout";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { PIXABAY_API_KEY } from "@env";

const PIXABAY_API_KEY1 = PIXABAY_API_KEY;

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const ItineraryItem = ({
  item,
  onPress,
  onDelete,
  onEdit,
  usersRequestedCount,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDestination, setNewDestination] = useState(item.destination);
  const [backgroundImage, setBackgroundImage] = useState(null);

  // Function to capitalize the first letter
  const capitalizeFirstLetter = (text) => {
    const words = text.split(" ");
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );
    return capitalizedWords.join(" ");
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const saveEdit = () => {
    setIsEditing(false);
    onEdit(newDestination);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setNewDestination(item.destination);
  };

  const onDestinationPress = () => {
    if (!isEditing) {
      startEditing();
    }
  };

  const swipeoutBtns = [
    {
      component: (
        <View
          style={{
            backgroundColor: "#E92B2B",
            borderRadius: 25,
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <FontAwesome name="trash" size={30} color="white" />
        </View>
      ),
      backgroundColor: "transparent",
      onPress: () => {
        onDelete(item.id);
      },
    },
    {
      component: (
        <View
          style={{
            backgroundColor: "#357FEE",
            borderRadius: 25,
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 18,
            paddingTop: 5,
          }}
        >
          <Feather name="edit" size={28} color="white" />
        </View>
      ),
      backgroundColor: "transparent",
      onPress: startEditing,
    },
  ];

  // Fetch the background image from Pixabay based on the destination name
  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const response = await axios.get(
          `https://pixabay.com/api/?key=${PIXABAY_API_KEY1}&q=${encodeURIComponent(
            newDestination
          )}&image_type=photo&orientation=horizontal&safesearch=true` // Set safesearch to true
        );

        if (response.data.hits.length > 0) {
          const imageUrl = response.data.hits[0].largeImageURL;
          setBackgroundImage({ uri: imageUrl });
        } else {
          // Fallback to a default background image if no result is found
          setBackgroundImage("");
        }
      } catch (error) {
        console.error("Error fetching background image:", error);
        // Fallback to a default background image in case of an error
        setBackgroundImage("");
      }
    };

    fetchBackgroundImage();
  }, [newDestination]);

  return (
    <Swipeout
      right={swipeoutBtns}
      autoClose={true}
      backgroundColor="transparent"
    >
      <TouchableOpacity style={styles.itineraryItem} onPress={onPress}>
        <ImageBackground
          source={backgroundImage}
          style={styles.linearGradient}
          imageStyle={{ opacity: 0.6 }}
        >
          <View style={styles.iconAndHeader}>
            <Ionicons
              name="ios-location-sharp"
              size={30}
              color="rgba(255,255,255,0.7)"
              style={styles.locationFilledIcon}
            />
            <TouchableOpacity
              onPress={onDestinationPress}
              style={styles.editableDestinationContainer}
            >
              {isEditing ? (
                <TextInput
                  style={styles.editableDestination}
                  value={newDestination}
                  onChangeText={(text) => setNewDestination(text)}
                  onBlur={saveEdit}
                  autoFocus
                />
              ) : (
                <Text style={styles.destinationText}>
                  {capitalizeFirstLetter(newDestination)}
                </Text>
              )}
            </TouchableOpacity>
            {usersRequestedCount > 0 && ( // Conditionally render the badge
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{usersRequestedCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={styles.duration}
          >{`Duration: ${item.duration} days`}</Text>
          <Text style={styles.viewDetails}>View Details</Text>
        </ImageBackground>
      </TouchableOpacity>
    </Swipeout>
  );
};
const styles = StyleSheet.create({
  iconAndHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  itineraryItem: {
    marginBottom: windowWidth * 0.04,
    borderRadius: 25,
    overflow: "hidden",
  },
  linearGradient: {
    paddingTop: 0,
    paddingBottom: windowHeight * 0.01,
    paddingLeft: windowWidth * 0.04,
    paddingRight: windowWidth * 0.04,
    resizeMode: "cover",
    backgroundColor: "#07363F",
  },
  editableDestinationContainer: {
    flex: 1,
  },
  editableDestination: {
    fontSize: windowWidth * 0.085,
    fontFamily: "Overpass-Bold",
    marginTop: windowHeight * 0.01,
    paddingTop: windowWidth * 0.02,
    paddingBottom: windowWidth * 0.01,
    paddingLeft: 0,
    paddingRight: windowWidth * 0.01,
    color: "rgba(34, 221, 133, 1)",
  },
  destinationText: {
    fontSize: windowWidth * 0.085,
    fontFamily: "Overpass-Bold",
    marginTop: windowHeight * 0.01,
    paddingTop: windowWidth * 0.02,
    paddingBottom: windowWidth * 0.01,
    paddingLeft: 0,
    paddingRight: windowWidth * 0.01,
    color: "rgba(34, 221, 133, 1)",
  },
  duration: {
    fontSize: windowWidth * 0.055,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 1)",
    fontFamily: "Overpass-SemiBold",
    marginLeft: windowWidth * 0.01,
  },
  locationFilledIcon: {
    marginBottom: -5,
  },
  viewDetails: {
    fontSize: windowWidth * 0.045,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    paddingTop: windowHeight * 0.02,
    fontFamily: "Overpass-Medium",
  },
  badge: {
    position: "absolute",
    top: windowHeight * 0.015,
    right: windowWidth * 0,
    backgroundColor: "red", // Color for your badge
    borderRadius: 10,
    width: 20, // Adjust as needed
    height: 20, // Adjust as needed
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "white", // Color for your badge text
    fontSize: 12, // Adjust as needed
    fontWeight: "bold",
  },
});

export default ItineraryItem;
