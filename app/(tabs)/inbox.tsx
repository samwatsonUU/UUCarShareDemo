import { StyleSheet, View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "@/context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';

type Request = {
  requestID: number;
  message: string;
  requester?: string;
  recipient?: string;
  origin?: string;
  destination?: string;
};

export default function Inbox() {
  const db = useSQLiteContext();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"received" | "sent">("received");
  const [messages, setMessages] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

      const results = await db.getAllAsync<Request>(query, [user!.userID]);
      setMessages(results);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [viewMode, user]);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [viewMode, user])
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
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.message, pressed && { backgroundColor: "rgba(133, 221, 255, .5)" }]}
          >
            <Text style={styles.messageHeader}>
              {viewMode === "received" ? item.requester : item.recipient}
            </Text>
            <Text>Origin: {item.origin}</Text>
            <Text>Destination: {item.destination}</Text>
            <Text style={styles.messageBody}>Message: {item.message}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text>No messages found.</Text>}
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

  messageTime: { color: "gray", fontSize: 12, textAlign: "right" },
  messageHeader: { fontSize: 16, fontWeight: "bold" },
  messageBody: { marginTop: 10, marginBottom: 10, textAlign: "justify" },
  message: { backgroundColor: "white", marginTop: 20, padding: 10, borderRadius: 10 },
  toggleContainer: { flexDirection: "row", marginTop: 15, marginBottom: 10, backgroundColor: "#E6F4FA", borderRadius: 25, padding: 4 },
  toggleButton: { paddingVertical: 8, paddingHorizontal: 24, borderRadius: 20 },
  toggleButtonActive: { backgroundColor: "rgba(11, 161, 226, 1)" },
  toggleText: { color: "rgba(11, 161, 226, 1)", fontWeight: "600" },
  toggleTextActive: { color: "white" },

});
