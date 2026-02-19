import { StyleSheet, View, Text, Pressable, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "@/context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';
import { router } from "expo-router";

type Request = {
  requestID: number;
  message: string;
  requester?: string;
  recipient?: string;
  origin?: string;
  destination?: string;
  date: string;
  departingAt: string;
  mustArriveAt: string;

};

export default function Inbox() {
  const db = useSQLiteContext();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"received" | "sent">("received");
  const [messages, setMessages] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cancelRequest = async (requestID: number) => {

    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this request?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            await db.runAsync(
              "DELETE FROM requests WHERE requestID = ?",
              [requestID]
            );

          setMessages(prev =>
            prev.filter(item => item.requestID !== requestID)
          );

          Alert.alert("Success", "Request cancelled");
          },
        },
      ],
      { cancelable: true }
    );

  }

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
              <Text style={styles.messageHeader}>{item.requester}</Text>
              <Text>Origin: {item.origin}</Text>
              <Text>Destination: {item.destination}</Text>
              <Text>Date: {item.date}</Text>
              <Text>Departing At: {item.date}</Text>
              <Text>Must Arrive At: {item.date}</Text>
              <Text style={styles.messageBody}>Message: {item.message}</Text>
            </Pressable>








          // else, if they are viewing requests sent to other users
          ) : (

          <View style={styles.message}>
            <Text style={styles.messageHeader}>{item.recipient}</Text>
            <Text>Origin: {item.origin}</Text>
            <Text>Destination: {item.destination}</Text>
            <Text style={styles.messageBody}>Message: {item.message}</Text>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && { backgroundColor: "rgb(237, 14, 14)"}]}
      
              onPress={() => cancelRequest(item.requestID)}
      
              >  
              {({ pressed }) => (
              <Text style={[styles.cancelButtonText, pressed && { color: "white" }]}>Cancel Request</Text>
              )}
            </Pressable>




          </View>

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
