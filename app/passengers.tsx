
/*

    Passenger list screen

    Displays all passengers that have been approved for a selected journey

    From this screen, the journey owner (the driver) is able to review their passengers

*/

import { StyleSheet, Text, View, Pressable, FlatList, Alert } from 'react-native';
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { getUserReviewScore, hasUserReviewedJourney, getJourneyDateTime } from "@/services/reviewService";
import { hasJourneyOccurred } from "@/utils/journeyUtils";
import { getPassengersForJourney } from "@/services/journeyService";
import type { Passenger } from "@/services/journeyService";

// Extends the Passenger type so each passenger can also store a review score
type PassengerWithReviewScore = Passenger & {
  reviewScore: number,
}

export default function Passengers() {

    // Shared SQLite database connection
    const db = useSQLiteContext();

    // Stores passengers plus their review scores for display
    const [Users, setUsers] = useState<PassengerWithReviewScore[]>([]);

    // Journey identifier passed through navigation
    const { journeyID } = useLocalSearchParams<{ journeyID: string }>();

    // Current logged-in user
    const { user } = useAuth();

    // Load all passengers for the selected journey, then fetch each passenger's review score
    const loadUsers = async () => {
        try {

            // Get all approved passengers linked to this journey
            const result = await getPassengersForJourney(db, Number(journeyID));

            // For each passenger, also retrieve their average review score
            const usersWithScores: PassengerWithReviewScore[] = await Promise.all(
            result.map(async (item) => {
                const reviewScore = await getUserReviewScore(db, item.userID);

                return {
                ...item,
                reviewScore,
                };
            })
            );

            // Store the final passenger list with scores
            setUsers(usersWithScores);
        } catch (error) {
            console.error("Database error", error);
        }
    };

    // Load passenger data when the screen first opens
    useEffect(() => {

        loadUsers();

    }, []);

    // Navigate to the review screen if the passenger is eligible to be reviewed
    const review = async (journeyID: number, revieweeID: number) => {
        if (!user?.userID) return;

        // Prevent duplicate reviews for the same journey
        const alreadyReviewed = await hasUserReviewedJourney(
            db,
            journeyID,
            user.userID
        );

        if (alreadyReviewed) {
            Alert.alert("Error", "You have already reviewed this passenger for this journey.");
            return;
        }

        // Load the journey's date and departure time
        const journeyInfo = await getJourneyDateTime(db, journeyID);

        if (!journeyInfo) return;

        // Prevent the user from reviewing before the journey has happened
        if (!hasJourneyOccurred(journeyInfo.date, journeyInfo.departingAt)) {
            Alert.alert("Error", "Cannot review a journey that hasn't occurred yet.");
            return;
        }

        // Open the review screen and pass the selected journey and passenger IDs
        router.push({
            pathname: "/review",
            params: {
            journeyID: journeyID.toString(),
            revieweeID: revieweeID.toString(),
            },
        });
    };

    return (

        <View style={styles.container}>

            <FlatList
                style={styles.list}
                data={Users}
                keyExtractor={(item) => item.userID.toString()}
                renderItem={({ item }) => {

                    return (

                        <View>
                            <View style={styles.passengerContainer}>

                                {/* Display the passenger's full name and average review score */}
                                <Text style={styles.nameLabel}>{item.firstName} {item.lastName} ⭐ {item.reviewScore.toFixed(1)}</Text>

                                {/* Button to leave a review for this passenger */}
                                <Pressable 
                                
                                style={({ pressed }) => [
                                styles.reviewButton,
                                pressed && { backgroundColor: "rgba(11, 161, 226, 1)" }
                                ]}
                                
                                onPress={() => review(Number(journeyID), item.userID)}
                                
                                
                                ><Text>Review Passenger</Text></Pressable>

                            </View>
                        </View>
                    )
                }}
                // Shown when no passengers are currently approved for the journey
                ListEmptyComponent={<Text>Nothing here for now!</Text>}
            >
            </FlatList>
        </View>
    )
}

const styles = StyleSheet.create({


    container: {

        flex: 1,
        alignItems: "center",

    },

    list: {

        width: 360,
        marginTop: 20,

    },

    passengerContainer: {

        marginBottom: 20,
        padding: 20,
        backgroundColor: "rgb(255, 255, 255)",
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"

    },

    reviewButton: {

        backgroundColor: "rgba(11, 161, 226, 0.2)",
        borderRadius: 5,
        padding: 10,

    },

    nameLabel: {

        fontSize: 16,
        fontWeight: "800",

    },

})