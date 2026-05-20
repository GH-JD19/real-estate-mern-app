import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MessageBubble({ message, isOwn }) {
  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.rightContainer : styles.leftContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwn ? styles.rightBubble : styles.leftBubble,
        ]}
      >
        <Text style={styles.text}>{message.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    paddingHorizontal: 10,
  },

  leftContainer: {
    alignItems: "flex-start",
  },

  rightContainer: {
    alignItems: "flex-end",
  },

  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 10,
  },

  leftBubble: {
    backgroundColor: "#e5e5e5",
  },

  rightBubble: {
    backgroundColor: "#4CAF50",
  },

  text: {
    color: "#000",
  },
});