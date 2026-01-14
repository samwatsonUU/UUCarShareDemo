import { Platform, StyleSheet, View, Text, Pressable, FlatList } from 'react-native';
import { useState } from "react";
import { receivedMessages } from "@/data/receivedMessages";
import { sentMessages } from "@/data/sentMessages";

export default function Inbox() {

  const [viewMode, setViewMode] = useState<"received" | "sent">("received");

  const dataToRender = viewMode === "received" ? receivedMessages : sentMessages;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Inbox</Text>













      {/* Toggle */}
            <View style={styles.toggleContainer}>
              <Pressable
                style={[
                  styles.toggleButton,
                  viewMode === "received" && styles.toggleButtonActive
                ]}
                onPress={() => setViewMode("received")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    viewMode === "received" && styles.toggleTextActive
                  ]}
                >
                  Received
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.toggleButton,
                  viewMode === "sent" && styles.toggleButtonActive
                ]}
                onPress={() => setViewMode("sent")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    viewMode === "sent" && styles.toggleTextActive
                  ]}
                >
                  Sent
                </Text>
              </Pressable>
            </View>






























      <View style={styles.messageDisplay}>
        <FlatList
          data={dataToRender}
          keyExtractor={(item) => item.messageID.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.message,
                pressed && { backgroundColor: "rgba(133, 221, 255, .5)" }
              ]}
            >
              <Text style={styles.messageHeader}>
                {viewMode === "received"
                  ? item.messageSender
                  : item.messageRecipient}
              </Text>

              <Text style={styles.messageBody}>{item.messageBody}</Text>

              <Text style={styles.messageTime}>{item.messageTimestamp}</Text>
            </Pressable>
          )}
        />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {

    alignItems: "center",
    marginTop: 40,

  },

  title: {

    fontSize: 48,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderColor: "rgba(11, 161, 226, 1)",

  },

  messageDisplay: {

    width: 350,

  },

  messageTime: {

    color: "gray",
    fontSize: 12,
    textAlign: "right",

  },

  messageHeader: {

    fontSize: 16,
    fontWeight: "bold",

  },

  messageBody: {

    marginTop: 10,
    marginBottom: 10,
    textAlign: "justify"

  },
   

  message: {

    backgroundColor: "white",
    marginTop: 20,
    padding: 10,
    borderRadius: 10,

  },

    toggleContainer: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: "#E6F4FA",
    borderRadius: 25,
    padding: 4,
  },

  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },

  toggleButtonActive: {
    backgroundColor: "rgba(11, 161, 226, 1)",
  },

  toggleText: {
    color: "rgba(11, 161, 226, 1)",
    fontWeight: "600",
  },

  toggleTextActive: {
    color: "white",
  },

})