import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Button,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Swipeout from "react-native-swipeout";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

const ItineraryItem = ({ item, onPress, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDestination, setNewDestination] = useState(item.destination);
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
            borderRadius: 25, // Set the borderRadius here
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 15,
          }}
          // onPress={() => onDelete(item.id)}
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
            borderRadius: 25, // Set the borderRadius here
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 18,
            paddingTop: 5,
          }}
          // onPress={startEditing}
        >
          <Feather name="edit" size={28} color="white" />
        </View>
      ),
      backgroundColor: "transparent",
      onPress: startEditing,
    },
  ];

  return (
    <Swipeout
      right={swipeoutBtns}
      autoClose={true}
      backgroundColor="transparent"
    >
      <TouchableOpacity style={styles.itineraryItem} onPress={onPress}>
        <LinearGradient
          colors={["rgba(7, 54, 63, 1)", "rgba(10, 46, 53, 1)"]}
          style={styles.linearGradient}
        >
          <View style={styles.iconAndHeader}>
            <Image
              style={styles.locationFilledIcon}
              source={require("../assets/location-filled.png")}
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
                  autoFocus // Automatically focus on input when in edit mode
                />
              ) : (
                <Text style={styles.destinationText}>
                  {capitalizeFirstLetter(newDestination)}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <Text
            style={styles.duration}
          >{`Duration: ${item.duration} days`}</Text>
          <Text style={styles.viewDetails}>View Details</Text>
        </LinearGradient>
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
    marginBottom: 15,
    borderRadius: 25,
    overflow: "hidden",
  },
  linearGradient: {
    paddingTop: 0,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  editableDestinationContainer: {
    flex: 1, // Take up available space
  },
  editableDestination: {
    fontSize: 35,
    fontWeight: "700",
    fontFamily: "Overpass-Bold",
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    paddingRight: 10,
    color: "rgba(34, 221, 133, 1)",
  },
  destinationText: {
    fontSize: 35,
    fontWeight: "700",
    fontFamily: "Overpass-Bold",
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 6,
    paddingLeft: 0,
    paddingRight: 10,
    color: "rgba(34, 221, 133, 1)",
  },
  duration: {
    fontSize: 22,
    fontWeight: "500",
    height: 26,
    width: 215,
    color: "rgba(255, 255, 255, 1)",
    fontFamily: "Overpass-SemiBold",
  },
  locationFilledIcon: {
    width: 30,
    height: 33,
    marginBottom: -5,
    marginRight: 3,
  },
  viewDetails: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    paddingTop: 20,
    fontFamily: "Overpass-Medium",
  },
});

export default ItineraryItem;
