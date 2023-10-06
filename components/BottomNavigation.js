import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const BottomNavigation = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Home")}
      >
        <Icon name="home" size={30} color="rgba(247, 255, 136, 1)" />
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Chat")}
      >
        <Icon name="add-circle" size={30} color="rgba(34, 221, 133, 1)" />
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Social")}
      >
        <Icon name="location-sharp" size={30} color="rgba(245, 98, 98,1)" />
        <Text style={styles.buttonText}>Feed</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Profile")}
      >
        <Icon name="person" size={30} color="rgba(188, 165, 237, 1)" />
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 3, // Add space at the top
    paddingBottom: 20, // Remove extra space at the bottom
    backgroundColor: "black",
  },
  button: {
    alignItems: "center",
  },
  buttonText: {
    color: "white",
  },
});

export default BottomNavigation;
