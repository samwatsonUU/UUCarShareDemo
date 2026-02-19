import { StyleSheet, View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";

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

export default function () {

    const { requestID } = useLocalSearchParams<{ requestID: string }>();
    const numericRequestID = Number(requestID);
    const db = useSQLiteContext();
    const [request, setRequest] = useState<Request | null>(null);
    const [message, setMessage] = useState("");

    const approve = async () => {




// Message to confirm status is updated
// Status Before

const result1 = await db.getFirstAsync(
    `SELECT status FROM requests WHERE requestID = ?`,
    [requestID]
) as { status: string } | undefined;

if (result1) {
    console.log('Status Before:', `${result1.status}`);
} else {
    console.log(`No request found for ID: ${requestID}`);
}

// End message


        await db.runAsync(

            `UPDATE requests SET status = ? WHERE requestID = ?`, ["Approved", numericRequestID]

        ); 



// Message to confirm status is updated
// Status after

const result2 = await db.getFirstAsync(
    `SELECT status FROM requests WHERE requestID = ?`,
    [requestID]
) as { status: string } | undefined;

if (result2) {
    console.log('Status After:', `${result2.status}`);
} else {
    console.log(`No request found for ID: ${requestID}`);
}

// End message





        Alert.alert("Success", "Request approved!");
        router.replace("/(tabs)/inbox");

    }

    const deny = async () => {

// Message to confirm status is updated
// Status Before

const result1 = await db.getFirstAsync(
    `SELECT status FROM requests WHERE requestID = ?`,
    [requestID]
) as { status: string } | undefined;

if (result1) {
    console.log('Status Before:', `${result1.status}`);
} else {
    console.log(`No request found for ID: ${requestID}`);
}

// End message


        await db.runAsync(

            `UPDATE requests SET status = ? WHERE requestID = ?`, ["Denied", numericRequestID]

        ); 



// Message to confirm status is updated
// Status after

const result2 = await db.getFirstAsync(
    `SELECT status FROM requests WHERE requestID = ?`,
    [requestID]
) as { status: string } | undefined;

if (result2) {
    console.log('Status After:', `${result2.status}`);
} else {
    console.log(`No request found for ID: ${requestID}`);
}

// End message





        Alert.alert("Success", "Request has been denied!");
        router.replace("/(tabs)/inbox");


    }

    useEffect(() => {
            const loadData = async () => {
                try {
        
                    // Selected request
                    const selectedRequest = await db.getFirstAsync<Request>(
    
                    " SELECT r.*, j.*, u.firstName FROM requests r JOIN journeys j ON r.journeyID = j.journeyID JOIN users u ON r.requesterID = u.userID WHERE requestID = ?",
    
                    [requestID]
                    );
                
        
                    if (!selectedRequest) {
        
                        setRequest(null);
                        return;
        
                    }
    
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
                </View>
            )}

            <View style={styles.messageContainer}>
                <Text style={styles.messageLabel}>
                    Message to requester:
                </Text>

                <TextInput
                    style={styles.messageInput}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="e.g. Hi, I can/cannot carpool with yo!."
                    multiline
                    maxLength={150}
                    textAlignVertical="top"
                />

                <Text style={styles.charCount}>
                    {message.length} / 150
                </Text>

            </View>

            <Pressable
                onPress={approve}
            ><Text>Approve Request</Text></Pressable>
            <Pressable
                onPress={deny}
            ><Text>Deny Request</Text></Pressable>
        
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

})