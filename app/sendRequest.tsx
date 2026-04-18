
/*

    Send request screen

    This screen enables the user to send a carpoll request to another user for any journey they have matched with

    A short message (up to 150 chars) is required

*/

import { StyleSheet, View, Text, TextInput, Pressable, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { createRequest } from "@/services/requestService";
import { getJourneyWithDriverName } from "@/services/journeyService";
import type { JourneyWithDriverName } from "@/services/journeyService";

export default function SendRequest() {

    // Shared SQLite database connection
    const db = useSQLiteContext();

    // Logged-in user sending the request
    const { user } = useAuth();

    // Journey ID passed through navigation
    const { journeyID } = useLocalSearchParams<{ journeyID: string }>();

    // Journey ID passed through navigation
    const { passengerSourceJourneyID } = useLocalSearchParams<{ passengerSourceJourneyID: string }>();

    // Stores the selected journey details
    const [journey, setJourney] = useState<JourneyWithDriverName | null>(null);

    // Stores the message entered by the user
    const [message, setMessage] = useState("");

    // Numeric conversions of journeyID and passengerSourceJourneyID
    const numericJourneyID = Number(journeyID);
    const numericPassengerSourceJourneyID = Number(passengerSourceJourneyID);

    // Load the selected journey when the screen opens
    useEffect(() => {

        const loadData = async () => {

            try {
    
                // Retrieve the selected journey along with the driver's name
                const selectedJourney = await getJourneyWithDriverName(db, numericJourneyID);
                
                // If no journey is found, clear the state
                if (!selectedJourney) {
    
                    setJourney(null);
                    return;
    
                }

                // Save the journey details into component state
                setJourney(selectedJourney);

            } catch (err) {

                console.error("Failed to data", err);
                setJourney(null);

            }
        };

        loadData();

    }, [journeyID]);

    return (

        <View style={styles.container}>
            <Text style={styles.subtitle}>Details of the journey you are requesting:</Text>

            {journey && (
                <View style={styles.journeyCard}>

                    <Text>Driver: {journey.firstName}</Text>
                    <Text>Origin: {journey.origin}</Text>
                    <Text>Destination: {journey.destination}</Text>
                    <Text>Departing At: {journey.departingAt}</Text>
                    <Text>Must Arrive At: {journey.mustArriveAt}</Text>
                    <Text>Date: {journey.date}</Text>
                </View>
            )}

            <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>
                    Message to driver:
                </Text>

                <TextInput
                    style={styles.messageInput}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="e.g. Hi, I live near your route and would love to carpool."
                    multiline
                    maxLength={150}
                    textAlignVertical="top"
                />

                <Text style={styles.charCount}>
                    {message.length} / 150
                </Text>

            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.sendButton,
                    pressed && { backgroundColor: "rgba(11, 161, 226, 1)" },
                ]}
                onPress={async () => {
                    if (!journey) return;

                    // Require a non-empty message before sending
                    if (message.trim() === "") {

                        Alert.alert('Error', 'Add a message')
                        return

                    }

                    console.log("Sending request:", {
                    journeyID: journey.journeyID,
                    fromUserID: user!.userID,
                    message,
                    });

                    await createRequest(
                        db,
                        user!.userID,
                        journey.userID,
                        journey.journeyID,
                        message.trim(),
                        numericPassengerSourceJourneyID
                    );
                    
                    Alert.alert(
                    'Success',
                    `You have sent a request to ${journey.firstName}, go to your inbox to view it!`
                    );

                    router.back();

                }}
                >
                {({ pressed }) => (
                    <Text style={[styles.sendButtonText, pressed && { color: "white" }]}>
                    Send Request
                    </Text>
                )}
            </Pressable>
        </View>
    )}

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

    sendButton: {
        marginTop: 20,
        backgroundColor: "rgba(11, 161, 226, 0.2)",
        padding: 12,
        borderRadius: 8,
        width: 160,
        alignItems: "center",
    },

    sendButtonText: {
        color: "rgba(11, 161, 226, 1)",
        fontSize: 16,
    },
})