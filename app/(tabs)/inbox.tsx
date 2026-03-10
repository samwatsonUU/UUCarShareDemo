import { StyleSheet, View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useState, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "@/context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';
import { router } from "expo-router";

type Request = {

  requestID: number;
  requesterID: number;
  recipientID: number;
  message: string;
  requester?: string;
  recipient?: string;
  origin?: string;
  destination?: string;
  date: string;
  departingAt: string;
  mustArriveAt: string;
  status: string;

};

export default function Inbox() {
  const db = useSQLiteContext();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"received" | "sent">("received");
  const [messages, setMessages] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});

  const reviewScore = async (userID: number) => {
    try {
      const result = await db.getFirstAsync<{ total: number; count: number }>(
        `SELECT SUM(rating) as total, COUNT(*) as count FROM reviews WHERE revieweeID = ?`,
        [userID]
      );

      if (!result || result.count === 0) return 0;

      const average = Number((result.total / result.count).toFixed(1));

      return average;

    } catch (err) {
      console.error("Review score error", err);
      return 0;
    }
  };

  const loadMessages = async () => {

    setIsLoading(true);

    try {
      let query = "";
      if (viewMode === "received") {
        query = `
          SELECT r.*,
                j.*,
                u.firstName AS requester
          FROM requests r
          JOIN journeys j ON r.journeyID = j.journeyID
          JOIN users u ON r.requesterID = u.userID
          WHERE r.recipientID = ?
          AND r.status = ?
          ORDER BY r.requestID DESC
        `;
      } else {
        query = `
          SELECT r.*,
                 j.*,
                 u.firstName AS recipient
          FROM requests r
          JOIN journeys j ON r.journeyID = j.journeyID
          JOIN users u ON r.recipientID = u.userID
          WHERE r.requesterID = ?
          ORDER BY r.requestID DESC
        `;
      }

      const results = await db.getAllAsync<Request>(query, [user!.userID, "Pending"]);
      setMessages(results);

      const ratingMap: { [key: number]: number } = {};

      for (const msg of results) {
        const userID =
          viewMode === "received"
            ? msg.requesterID
            : msg.recipientID;

        const score = await reviewScore(userID);
        ratingMap[userID] = score ?? 0;
      }

setRatings(ratingMap);

      
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [viewMode, user?.userID])
  );

  if (isLoading) return <ActivityIndicator size="large" color="#007AFF" />;

  return (
    <View style={styles.container}>

      {/* Toggle between recieved and sent rquests*/}
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

          // if the user is currently viewing recieved requests
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
