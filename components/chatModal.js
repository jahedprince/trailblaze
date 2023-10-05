import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const ChatModal = ({ sharedItineraryId }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const currentUser = getAuth().currentUser;

  useEffect(() => {
    const db = getFirestore();

    // Reference to the chat room document
    const chatRoomRef = doc(
      db,
      "sharedItineraries",
      sharedItineraryId,
      "chat",
      "chatRoom"
    );

    // Subscribe to real-time updates for chat messages
    const unsubscribeChatMessages = onSnapshot(
      collection(chatRoomRef, "messages"),
      (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          messages.push(doc.data());
        });
        setChatMessages(messages);
      }
    );

    return () => {
      // Clean up the listener when the component unmounts
      unsubscribeChatMessages();
    };
  }, [sharedItineraryId]);

  const sendMessage = async () => {
    if (newMessageText.trim() === "") return;

    const db = getFirestore();
    const chatRoomRef = doc(
      db,
      "sharedItineraries",
      sharedItineraryId,
      "chat",
      "chatRoom"
    );
    const messagesCollectionRef = collection(chatRoomRef, "messages");

    // Use collection.add() to add a new message with an auto-generated ID
    await addDoc(messagesCollectionRef, {
      text: newMessageText,
      senderId: currentUser.uid,
      timestamp: new Date(),
    });

    // Clear the input field after sending the message
    setNewMessageText("");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messageContainer}>
        {chatMessages.map((message, index) => (
          <View key={index} style={styles.message}>
            <Text style={styles.sender}>{message.senderId}</Text>
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessageText}
          onChangeText={(text) => setNewMessageText(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  messageContainer: {
    flex: 1,
    padding: 10,
  },
  message: {
    marginBottom: 10,
  },
  sender: {
    fontWeight: "bold",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ChatModal;
