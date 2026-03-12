
/*

  Request inbox screen

  This screen shows journey requests related to the logged-in user

  The user can toggle between viewing requests that they have sent, and requests they have
  recieved from other users

  The user has a toggle to switch between viewing recieved and sent requests

  For recieved requests, the user has the option to approve or deny

  Approving a request makes that user it appear in the passenger list of the journey they
  were approved for

*/

import { StyleSheet, View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useState, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "@/context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';
import { router } from "expo-router";
import { getUserReviewScore } from "@/services/reviewService";
import { getReceivedRequests, getSentRequests } from "@/services/requestService";
import type { InboxRequest } from "@/services/requestService";

export default function Inbox() {

  // Shared DB connection
  const db = useSQLiteContext();

  // Current logged-in user
  const { user } = useAuth();

  // Controls if the user is viewing recieved or sent messages
  const [viewMode, setViewMode] = useState<"received" | "sent">("received");

  // Results set containing messages relevant for sent/recieved 
  const [messages, setMessages] = useState<InboxRequest[]>([]);

  // Maps user IDs to review scores so ratings can be shown beside user names
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});

  const [isLoading, setIsLoading] = useState(false);

  // Load request data for inbox and fetch ratings for the other users 
  const loadMessages = async () => {
    if (!user?.userID) return;

    setIsLoading(true);

    try {
      const results =
        viewMode === "received"
          ? await getReceivedRequests(db, user.userID)
          : await getSentRequests(db, user.userID);

      setMessages(results);

      const ratingMap: { [key: number]: number } = {};

      // Build a lookup of review scores for the other user in each request
      for (const msg of results) {
        const userID =
          viewMode === "received"
            ? msg.requesterID
            : msg.recipientID;

        const score = await getUserReviewScore(db, userID);
        ratingMap[userID] = score ?? 0;
      }

      setRatings(ratingMap);

    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh the inbox whenever this screen regains focus or the view mode changes
  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [viewMode, user?.userID])
  );

  if (isLoading) return <ActivityIndicator size="large" color="#007AFF" />;

  return (
    <View style={styles.container}>

      {/* Toggle between received requests and sent requests */}
      <View style={styles.toggleContainer}>

        <Pressable
          style={[styles.toggleButton, viewMode === "received" && styles.toggleButtonActive]}
          onPress={() => setViewMode("received")}
        >
          <Text style={[styles.toggleText, viewMode === "received" && styles.toggleTextActive]}>Received</Text>

        </Pressable>

        <Pressable
          style={[styles.toggleButton, viewMode === "sent" && styles.toggleButtonActive]}
          onPress={() => setViewMode("sent")}
        >

          <Text style={[styles.toggleText, viewMode === "sent" && styles.toggleTextActive]}>Sent</Text>

        </Pressable>
      </View>

      <FlatList
        style={styles.messageDisplay}
        data={messages}
        keyExtractor={(item) => item.requestID.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => 

          // If the user is currently viewing received requests
          viewMode === "received" ? (


            <Pressable
              style={({ pressed }) => [styles.message, pressed && { backgroundColor: "rgba(133, 221, 255, .5)" }]}
              
              onPress={ () => 
                router.push({

                  pathname: "/requestResponse",
                  params: { requestID: item.requestID.toString() },

                })
              }
              
            >
              <Text style={styles.messageHeader}>{item.requester} ⭐ {ratings[item.requesterID]?.toFixed(1) ?? "0.0"}</Text>
              <Text>Date: {item.date}</Text>
              <Text>Origin: {item.origin}</Text>
              <Text>Destination: {item.destination}</Text>
              <Text style={styles.messageBody}>Message: {item.message}</Text>
            </Pressable>

          // else, if they are viewing requests sent to other users
          ) : (

          <View style={styles.message}>
            <Text style={styles.messageHeader}>{item.recipient}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Origin: {item.origin}</Text>
            <Text>Destination: {item.destination}</Text>
            <Text>Status: {item.status}</Text>
            <Text style={styles.messageBody}>Message: {item.message}</Text>
          </View>

        )}
        // Shown when no requests exist for the selected inbox view
        ListEmptyComponent={<Text>Nothing here for now!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 10
  },

  messageDisplay: {
    width: 350,
    marginBottom: 40
  },

  messageTime: { 
    color: "gray",
    fontSize: 12,
    textAlign: "right" 
  },

  messageHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10, 
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
    borderRadius: 10
  },

  toggleContainer: { 
    flexDirection: "row", 
    marginTop: 15, 
    marginBottom: 10, 
    backgroundColor: "#E6F4FA", 
    borderRadius: 25, 
    padding: 4
  },

  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20
  },

  toggleButtonActive: {
    backgroundColor: "rgba(11, 161, 226, 1)"
  },

  toggleText: {
    color: "rgba(11, 161, 226, 1)",
    fontWeight: "600"
  },

  toggleTextActive: { 
    color: "white"
  },

  cancelButton : {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(201, 24, 24, 0.55)",
    width: 180,
    borderRadius: 5,
    padding: 10,
    margin: 20,
  },
  
  cancelButtonText : {
    color: "rgb(0, 0, 0)",
  },
});
