
/*

    Request response screen

    This screen allows the recipient of a carpool request to view the message they have
    recieved, the details of the journey they want to join, and options to either approve
    or deny the request

*/

import { StyleSheet, View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { approveRequest, denyRequest } from "@/services/requestService";

// Type describing the request data loaded from the database query
type Request = {

    requestID: number;
    message: string;
    requester: string;
    origin?: string;
    destination?: string;
    date: string;
    departingAt: string;
    mustArriveAt: string;
    firstName: string;

}

export default function RequestResponse() {

    // Read the requestID passed through navigation parameters
    const { requestID } = useLocalSearchParams<{ requestID: string }>();

    // Convert the requestID from string to number for database use
    const numericRequestID = Number(requestID);

    // Shared SQLite database connection
    const db = useSQLiteContext();

    // Stores the selected request details
    const [request, setRequest] = useState<Request | null>(null);

    // Stores the optional response message typed by the user
    const [message, setMessage] = useState("");

    // Approves the selected request
    const approve = async () => {

        // Require a non-empty response message before approving
        if (message.trim() === "") {
            Alert.alert("Error", "Add a message.");
            return;
        }

        try {

            // Call the service function to approve the request
            await approveRequest(db, numericRequestID);

            // Notify the user and return them to the inbox
            Alert.alert("Success", "Request approved!");
            router.replace("/(tabs)/inbox");
        } catch (error) {
            console.error("Approve request error", error);
            Alert.alert("Error", "Could not approve the request.");
        }
    };

    // Denies the selected request
    const deny = async () => {

        // Require a non-empty response message before approving
        if (message.trim() === "") {
            Alert.alert("Error", "Add a message.");
            return;
        }

        try {
            // Call the service function to deny the request
            await denyRequest(db, numericRequestID);

            // Notify the user and return them to the inbox
            Alert.alert("Success", "Request has been denied!");
            router.replace("/(tabs)/inbox");
        } catch (error) {
            console.error("Deny request error", error);
            Alert.alert("Error", "Could not deny the request.");
        }
    };

    // Load the selected request details when the screen opens
    useEffect(() => {

            const loadData = async () => {

                try {
        
                    // Load selected request along with journey details and requester's details
                    const selectedRequest = await db.getFirstAsync<Request>(
    
                    "SELECT r.*, j.*, u.firstName FROM requests r JOIN journeys j ON r.journeyID = j.journeyID JOIN users u ON r.requesterID = u.userID WHERE r.requestID = ?",
                    [numericRequestID]
                    );
                
                    // If no request is found, clear the state
                    if (!selectedRequest) {
        
                        setRequest(null);
                        return;
        
                    }
    
                    // Store the retrieved request in state
                    setRequest(selectedRequest);
    
                } catch (err) {
    
                    console.error("Failed to data", err);
                    setRequest(null);
    
                }
            };
    
            loadData();
    
        }, [requestID]);

    return(

        <View style={styles.container}>

            <Text style={styles.subtitle}>Details of the request you are responding to:</Text>

            {request && (
                <View style={styles.journeyCard}>

                    <Text>Requester: {request.firstName}</Text>
                    <Text>Origin: {request.origin}</Text>
                    <Text>Destination: {request.destination}</Text>
                    <Text>Departing At: {request.departingAt}</Text>
                    <Text>Must Arrive At: {request.mustArriveAt}</Text>
                    <Text>Date: {request.date}</Text>
                    <Text>Request Message: {request.message}</Text>
                </View>
            )}

            <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>
                    Optional response message:
                </Text>

                <TextInput
                    style={styles.messageInput}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="e.g. Hi, I can/cannot carpool with you!"
                    multiline
                    maxLength={150}
                    textAlignVertical="top"
                />

                <Text style={styles.charCount}>
                    {message.length} / 150
                </Text>

            </View>

            <Pressable
                style={({ pressed }) => [styles.approveButton, pressed && { backgroundColor: "rgba(14, 237, 92, 0.97)"}]}
                onPress={approve}
            >{({ pressed }) => (
            <Text style={[styles.buttonText, pressed && { color: "white" }]}>Approve Request</Text>)}</Pressable>

            <Pressable
                style={({ pressed }) => [styles.denyButton, pressed && { backgroundColor: "rgb(255, 0, 0)"}]}
                onPress={deny}
            >{({ pressed }) => (
            <Text style={[styles.buttonText, pressed && { color: "white" }]}>Deny Request</Text>)}</Pressable>                
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },

    subtitle: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 10,
    },

    journeyCard: {
        width: 320,
        padding: 15,
        backgroundColor: "rgba(11, 161, 226, 0.26)",
        borderRadius: 25,
    },

    messageContainer: {
        width: 320,
        marginTop: 15,
    },

    messageLabel: {
        marginBottom: 5,
        fontSize: 14,
    },

    messageInput: {
        minHeight: 200,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.15)",
    },

    charCount: {
        alignSelf: "flex-end",
        marginTop: 5,
        fontSize: 12,
        color: "rgba(0,0,0,0.6)",
    },

    approveButton: {
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "rgba(24, 201, 24, 0.55)",
        width: 180,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },

    denyButton: {
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "rgba(201, 24, 24, 0.55)",
        width: 180,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },

    buttonText: {
        color: "rgb(0, 0, 0)",
    },
});