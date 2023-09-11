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
    navigation.navigate("Home");
  };
  return (
    <ImageBackground
      source={require("../assets/unsplashrajnd0b3hdw.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.iphone14Pro}>
        <Text style={styles.bonVoyageIn}>Bon Voyage in Style</Text>
        <Text style={styles.letTheClassicContainer}>
          <Text style={styles.letTheClassic}>
            {`Let the classic American riverboat transport you to `}
          </Text>
          <Text style={styles.newAdventures}>New Adventures — </Text>
          <Text style={styles.letTheClassic}>and back in time.</Text>
        </Text>

        <View
          style={[
            styles.ellipseParent,
            styles.groupChildLayout,
            styles.centeredAtBottom,
          ]}
        >
          <TouchableOpacity
            underlayColor="transparent" // This sets the background color when pressed
            // onPress={() => {
            //   navigation.navigate("Home");
            //   // Handle button press here
            // }}
            onPress={handleStartClick}
          >
            <Image
              style={[styles.groupChild, styles.groupChildLayout]}
              resizeMode="cover"
              source={require("../assets/ellipse-2.png")}
            />
            <Image
              style={styles.groupItem}
              resizeMode="cover"
              source={require("../assets/ellipse-1.png")}
            />
            <Text style={[styles.start, styles.startTypo]}>Start</Text>
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
  groupChildPosition: {
    left: 0,
    top: 0,
  },
  startTypo: {
    fontSize: 30,
    position: "absolute",
  },

  unsplashrajnd0b3hdwIcon: {
    zIndex: -1,
  },
  bonVoyageIn: {
    top: 115,
    left: 34,
    fontSize: 62,
    fontFamily: "Submaster",
    width: 340,
    textAlign: "left",
    color: "white",
    position: "absolute",
  },
  letTheClassic: {
    fontSize: 17,
    fontFamily: "Poppins-Medium",
    color: "white",
  },
  newAdventures: {
    fontSize: 17,
    fontFamily: "Poppins-Medium",
    color: "#fee53f",
  },
  letTheClassicContainer: {
    top: 255,
    left: 34,
    width: 320,
    textAlign: "left",
  },
  groupChild: {
    opacity: 0.7,
    left: 0,
    top: 0,
  },
  groupChildLayout: {
    height: 130,
    width: 130,
    position: "absolute",
  },
  groupItem: {
    top: 10,
    left: 13,
    width: 105,
    height: 105,
    position: "absolute",
  },
  start: {
    top: 40,
    left: 25,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
    width: 79,
    height: 38,
  },
  ellipseParent: {
    position: "absolute",
  },
  centeredAtBottom: {
    alignItems: "center", // Center horizontally
    top: windowHeight * 0.85,
    left: windowWidth * 0.2,
  },
});

export default IPhone14Pro;
