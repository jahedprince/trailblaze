import { getApps, initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import React from "react";
import { getAuth } from "firebase/auth";

// import * as React from "react";

import { useFonts } from "expo-font";
import { View, Text, Pressable, TouchableOpacity } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";
import HomeScreen from "./screens/MainAppFlow/HomeScreen";
import ItineraryDetailsScreen from "./screens/MainAppFlow/ItineraryDetailsScreen";
import ChatScreen from "./screens/MainAppFlow/ChatScreen";
import IPhone14Pro6 from "./screens/IPhone14Pro6";
import MyProfile from "./screens/MyProfile";
import BottomNavigation from "./components/BottomNavigation";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import SignIn from "./screens/SignIn";
import SignUp from "./screens/SignUp";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const Stack = createStackNavigator();

const store = createStore(rootReducer, applyMiddleware(thunk));

const App = () => {
  const [hideSplashScreen, setHideSplashScreen] = React.useState(true);
  // prettier-ignore
  const [fontsLoaded, error] = useFonts({
    "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
    "Overpass-SemiBold": require("./assets/fonts/Overpass-SemiBold.ttf"),
    "Overpass-Bold": require("./assets/fonts/Overpass-Bold.ttf"),
    "Submaster": require("./assets/fonts/Submaster.ttf"),
    "Overpass-Medium": require("./assets/fonts/Overpass-Medium.ttf"),
    "Overpass-Regular": require("./assets/fonts/Overpass-Regular.ttf"),
  });

  if (!fontsLoaded && !error) {
    return null;
  }

  // screenOptions={{ headerShown: false }}

  return (
    <Provider store={store}>
      <NavigationContainer>
        {hideSplashScreen ? (
          <Stack.Navigator>
            <Stack.Screen
              name="IPhone14Pro6"
              component={IPhone14Pro6}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="ItineraryDetails"
              component={ItineraryDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Profile"
              component={MyProfile}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="signin"
              component={SignIn}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="signup"
              component={SignUp}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />

            <Stack.Screen
              name="ItineraryDetails"
              component={ItineraryDetailsScreen}
            />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Profile" component={MyProfile} />
            <Stack.Screen
              name="signin"
              component={SignIn}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="signup"
              component={SignUp}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </Provider>
  );
};

export default App;

export { auth };
