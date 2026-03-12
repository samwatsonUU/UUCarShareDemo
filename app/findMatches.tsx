import { StyleSheet, View, Text, ActivityIndicator, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { getUserReviewScore } from "@/services/reviewService";
import { getJourneyById } from "@/services/journeyService";
import type { Journey } from "@/services/journeyService";
import { findMatchingJourneys } from "@/services/matchingService";
import type { JourneyMatch } from "@/services/matchingService";

export default function FindMatches() {
  
  const db = useSQLiteContext();
  const { user } = useAuth();

  const { journeyID } = useLocalSearchParams<{ journeyID: string }>();
  const numericJourneyID = Number(journeyID);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [journey, setJourney] = useState<Journey | null>(null);
  const [matches, setMatches] = useState<JourneyMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {

  try {

    // Selected journey
    const selectedJourney = await getJourneyById(db, numericJourneyID);

      if (!selectedJourney) {
      setJourney(null);
      setMatches([]);
      return;
    }

    setJourney(selectedJourney);

    const matches = await findMatchingJourneys(
      db,
      selectedJourney,
      user!.userID,
      {
        smokingAllowed: user!.smokingAllowed,
        prefersSameGender: user!.prefersSameGender,
        role: user!.role,
        gender: user!.gender
      }
    );

    setMatches(matches);  

    const ratingMap: Record<number, number> = {};

    for (const match of matches) {
      const score = await getUserReviewScore(db, match.userID);
      ratingMap[match.userID] = score ?? 0;
    }

    setRatings(ratingMap);

    } catch (error) {

      console.error("Failed to data", error);
      
    } finally {

      setLoading(false);

    }
  };

  useFocusEffect(

      useCallback(() => {

      loadData(); // will run every time screen comes into focus
      
    }, [journeyID])
  );

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Showing all matches for the following journey:
      </Text>

      {journey && (
        <View style={styles.journeyCard}>
          <Text>Origin: {journey.origin}</Text>
          <Text>Destination: {journey.destination}</Text>
          <Text>Departing At: {journey.departingAt}</Text>
          <Text>Must Arrive At: {journey.mustArriveAt}</Text>
          <Text>Date: {journey.date}</Text>
        </View>
      )}

      <ScrollView style={styles.matchResults} showsVerticalScrollIndicator={false}>
         {matches.length === 0 ? (
          <Text style={styles.emptyText}>No matching journeys found.</Text>
        ) : (
          matches.map((match) => (
            <View key={match.journeyID} style={styles.matchCard}>
              <Text>Driver: {match.firstName} ⭐ {ratings[match.userID]?.toFixed(1) ?? "0.0"}</Text>
              <Text>Origin: {match.origin}</Text>
              <Text>Origin Distance: {match.originDistance.toFixed(2)} km</Text>
              <Text>Destination: {match.destination}</Text>
              <Text>Departing At: {match.departingAt}</Text>
              <Text>Must Arrive At: {match.mustArriveAt}</Text>
              <Text>Date: {match.date}</Text>

              <Pressable
                style={({ pressed }) => [styles.requestButton, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}
                onPress={ () => 
                  router.push({
                    pathname: "/sendRequest",
                    params: { journeyID: match.journeyID.toString() },
                  })
                }>
                  {({ pressed }) => (
                  <Text style={[styles.buttonText, pressed && { color: "white" }]}>
                  Send Request</Text>
                  )}
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>      
    </View>
  );
}

const styles = StyleSheet.create({

    container: {
    flex: 1,
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    borderBottomWidth: 2,
    borderColor: "rgba(11, 161, 226, 1)",
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

  backButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(168, 168, 168, 0.2)",
    width: 150,
    borderRadius: 5,
    padding: 10,
    marginBottom: 70,
  },

  matchResults: {
    borderTopWidth: 1,
    borderColor: "rgba(11, 161, 226, 0.2)",
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 60,
    marginTop: 20,
    width: 320,
    alignContent: "center",
  },

  matchCard: {
    marginBottom: 20,
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: 15,
    padding: 15,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "rgba(11, 161, 226, 1)",
  },

  requestButton: {
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "rgba(11, 161, 226, 0.2)",
    borderRadius: 5,
    padding: 10,
    width: 120,
    marginHorizontal: "auto",
  },

  requestButtonText: {
    color: "red",
  }
})