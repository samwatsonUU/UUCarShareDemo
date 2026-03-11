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

type PassengerWithReviewScore = Passenger & {
  reviewScore: number,
}

export default function Passengers() {

    const db = useSQLiteContext();
    const [Users, setUsers] = useState<PassengerWithReviewScore[]>([]);
    const { journeyID } = useLocalSearchParams<{ journeyID: string }>();
    const { user } = useAuth();

    const loadUsers = async () => {
        try {
            const result = await getPassengersForJourney(db, Number(journeyID));

            const usersWithScores: PassengerWithReviewScore[] = await Promise.all(
            result.map(async (item) => {
                const reviewScore = await getUserReviewScore(db, item.userID);

                return {
                ...item,
                reviewScore,
                };
            })
            );

            setUsers(usersWithScores);
        } catch (error) {
            console.error("Database error", error);
        }
    };

    useEffect(() => {

        loadUsers();

    }, []);

    const review = async (journeyID: number, revieweeID: number) => {
    if (!user?.userID) return;

    const alreadyReviewed = await hasUserReviewedJourney(
        db,
        journeyID,
        user.userID
    );

    if (alreadyReviewed) {
        Alert.alert("Error", "You have already reviewed this passenger for this journey.");
        return;
    }

    const journeyInfo = await getJourneyDateTime(db, journeyID);

    if (!journeyInfo) return;

    if (!hasJourneyOccurred(journeyInfo.date, journeyInfo.departingAt)) {
        Alert.alert("Error", "Cannot review a journey that hasn't occurred yet.");
        return;
    }

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

                                <Text style={styles.nameLabel}>{item.firstName} {item.lastName} ⭐ {item.reviewScore.toFixed(1)}</Text>
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