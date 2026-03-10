import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";

export default function Review() {

    const db = useSQLiteContext();

    const { journeyID } = useLocalSearchParams<{ journeyID: string }>();

    const { revieweeID } = useLocalSearchParams<{ revieweeID: string }>();

    const { user } = useAuth();

    const [rating, setRating] = useState(0);

    const addReview = async () => {

        await db.runAsync(

            'INSERT INTO reviews (reviewerID, revieweeID, journeyID, rating) VALUES (?, ?, ?, ?)',
            [
                user!.userID,
                Number(revieweeID),
                Number(journeyID),
                rating
            ]
        )

        const rows = await db.getAllAsync('SELECT * FROM reviews');
        console.log('! -- REVIEWS -- ! TABLE CONTENTS:', JSON.stringify(rows, null, 2));

        Alert.alert("Success", "Review Submitted!");
        router.replace("/(tabs)/myJourneys");
    }

    return (
        <View>

            <Text style={styles.header}>
                How many stars would you give this user?
            </Text>

            <View style={styles.starRow}>

                {[1,2,3,4,5].map((star) => (

                    <Pressable
                        key={star}
                        onPress={() => {
                            if (rating === star) {
                                setRating(0);
                            } else {
                                setRating(star);
                            }
                        }}
                    >

                        <FontAwesome
                            name={star <= rating ? "star" : "star-o"}
                            size={48}
                            color="rgb(255,230,0)"
                        />

                    </Pressable>

                ))}

            </View>

            <Pressable 
                style={({ pressed }) => [
                    styles.submitButton,
                    pressed && { backgroundColor: "rgba(11, 161, 226, 1)" }
                ]}
                onPress={addReview}
            >

                <Text>Submit Review</Text>

            </Pressable>

            <Pressable 
                style={({ pressed }) => [
                    styles.reportButton,
                    pressed && { backgroundColor: "rgb(255, 0, 0)" }
                ]}
                onPress= { () => {
                    
                    Alert.alert(
                        "Success",
                        "This user has been reported to our team.",
                        [
                            {
                            text: "OK",
                            onPress: () => router.replace("/(tabs)/myJourneys")
                            }
                        ]
                    );
                }}
            >
                <Text>Report User</Text>

            </Pressable>                

        </View>
    )
}

const styles = StyleSheet.create({

    header: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 20,
        marginBottom: 20
    },

    starRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10
    },

    submitButton: {
        marginTop: 20,
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "rgba(11, 161, 226, 0.2)",
        width: 120,
        borderRadius: 5,
        padding: 10,
    },

    reportButton: {

        marginTop: 20,
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "rgba(201, 24, 24, 0.55)",
        width: 120,
        borderRadius: 5,
        padding: 10,

    }

});