import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
} from "react-native";

import MessageBubble from "../components/MessageBubble";

import {
  connectSocket,
  sendMessage,
  onReceiveMessage,
  offReceiveMessage,
} from "../services/socket";

export default function ChatScreen({ route }) {
  const { user, selectedUserId } = route.params;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const flatListRef = useRef();

  useEffect(() => {
    connectSocket(user);

    onReceiveMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    loadMessages();

    return () => {
      offReceiveMessage();
    };
  }, []);

  const loadMessages = async () => {
    try {
      const res = await fetch(
        `http://YOUR_IP:5000/api/messages/${user._id}/${selectedUserId}`
      );
      const data = await res.json();
      setMessages(data);

      setTimeout(scrollToBottom, 300);
    } catch (err) {
      console.log("Error loading messages", err);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const msg = {
      senderId: user._id,
      receiverId: selectedUserId,
      message: input,
      senderRole: user.role,
    };

    sendMessage(msg);

    // 🔥 instant UI update (no delay)
    setMessages((prev) => [...prev, msg]);

    setInput("");
    scrollToBottom();
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View style={styles.container}>
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwn={item.senderId === user._id}
          />
        )}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={styles.input}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
  },

  sendBtn: {
    backgroundColor: "#4CAF50",
    marginLeft: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 20,
  },
});