import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

import { useSelector } from "react-redux";
import BottomNavigation from "../../components/BottomNavigation";

const ItineraryDetailsScreen = ({ route }) => {
  const { itinerary } = route.params;

  if (!itinerary) {
    return <Text>Loading...</Text>;
  }

  const renderDayItem = ({ item }) => {
    const onPress = () => {
      // Handle press event for a day item
      console.log("Day item pressed:", item);
    };

    const activities = item.activities.map((activity) =>
      activity.startsWith("-") ? activity.slice(1).trim() : activity
    );

    return (
      <TouchableOpacity style={styles.itineraryItem} onPress={onPress}>
        <LinearGradient
          colors={["rgba(7, 54, 63, 1)", "rgba(10, 46, 53, 1)"]}
          style={styles.linearGradient}
        >
          <View style={styles.iconAndHeader}>
            <Text style={styles.header}>{`Day ${item.dayNumber}`}</Text>
          </View>
          {item.activities.map((activity, activityIndex) => (
            <Text style={styles.itineraryDetails} key={activityIndex}>{`${
              activity.startsWith("-") ? activity.slice(1).trim() : activity
            }${
              activityIndex !== item.activities.length - 1 ? "\n" : ""
            }`}</Text>
          ))}
        </LinearGradient>
      </TouchableOpacity>
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
