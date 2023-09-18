import * as React from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { FontFamily, Color } from "../GlobalStyles";
import { useNavigation } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const IPhone14Pro = () => {
  const navigation = useNavigation();

  const handleStartClick = () => {
    navigation.navigate("signin");
  };

  return (
    <ImageBackground
      source={require("../assets/unsplashrajnd0b3hdw.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.iphone14Pro}>
        <View style={styles.textContainer}>
          <Text style={styles.bonVoyageIn}>TrailBlaze</Text>
          <View style={styles.letTheClassicContainer}>
            <Text style={styles.letTheClassic}>
              Your Personalized Journey Planner
            </Text>
            <Text style={styles.newAdventures}> – Where Adventure Begins,</Text>
            <Text style={styles.letTheClassic}> Memories Never End!</Text>
          </View>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.centeredAtBottom}>
          <TouchableOpacity
            underlayColor="transparent"
            onPress={handleStartClick}
          >
            <View style={styles.circleContainer}>
              <View style={styles.circle1}></View>
              <View style={styles.circle2}></View>
              <Text style={[styles.start, styles.startTypo]}>Start</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },

  container: {
    flex: 1,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: {
    alignItems: "flex-start",
    marginLeft: windowWidth * 0.075,
    marginTop: windowHeight * 0.15,
  },
  bonVoyageIn: {
    fontSize: windowWidth * 0.16, // Responsive font size
    fontFamily: "Submaster",
    color: "white",
  },
  letTheClassicContainer: {
    marginTop: 10, // Add top margin as needed
  },
  letTheClassic: {
    fontSize: windowWidth * 0.04, // Responsive font size
    fontFamily: "Poppins-Medium",
    color: "white",
  },
  newAdventures: {
    fontSize: windowWidth * 0.04, // Responsive font size
    fontFamily: "Poppins-Medium",
    color: "#fee53f",
  },
  unsplashrajnd0b3hdwIcon: {
    zIndex: -1,
  },
  centeredAtBottom: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
  },
  circleContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%", // Take up the full height of the parent
  },

  circle1: {
    width: "55%", // Adjust the percentage width as needed
    aspectRatio: 1, // Maintain aspect ratio for a circle
    borderRadius: "75%", // Set a large border radius for a circle
    backgroundColor: "#EFEFEF",
  },

  circle2: {
    width: "45%", // Adjust the width to make it smaller
    height: "57%",
    borderRadius: "60%",
    backgroundColor: "black",
    marginTop: windowHeight * -0.125, // Adjust this value to center Circle 2
    position: "absolute",
  },

  start: {
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  startTypo: {
    fontSize: windowWidth * 0.075, // Responsive font size
    position: "absolute",
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
  },

  iphone14Pro: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});

export default IPhone14Pro;
