import { StyleSheet, View, Text, ActivityIndicator, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";

type Journey = {
  journeyID: number;
  userID: string;
  origin: string;
  originLatitude: number,
  originLongitude: number,
  destination: '',
  destinationLatitude: number,
  destinationLongitude: number,
  departingAt: string;
  mustArriveAt: string;
  date: string;
  status: string;
};

export default function FindMatches() {
  const { journeyID } = useLocalSearchParams<{ journeyID: string }>();
  const db = useSQLiteContext();
  const { user } = useAuth();

  const [journey, setJourney] = useState<Journey | null>(null);
  const [matches, setMatches] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {

        // Selected journey
        const selectedJourney = await db.getFirstAsync<Journey>(
          "SELECT * FROM journeys WHERE journeyID = ?",
          [journeyID]
        );
        

         if (!selectedJourney) {

          setJourney(null);
          setMatches([]);
          return;

        }

        setJourney(selectedJourney);

        const TIME_WINDOW_MINUTES = 30;

        // Get matching journeys
        const results = await db.getAllAsync<Journey>(
        `SELECT * FROM journeys WHERE userID != ? AND date = ? AND ABS(
          (
            CAST(substr(departingAt, 1, 2) AS INTEGER) * 60 +
            CAST(substr(departingAt, 4, 2) AS INTEGER)
          ) -
          (
            CAST(substr(?, 1, 2) AS INTEGER) * 60 +
            CAST(substr(?, 4, 2) AS INTEGER)
          )) <= ? AND originLatitude = ? AND originLongitude = ? AND destinationLatitude = ? AND destinationLongitude = ?`,
        
            [
              user!.userID,
              selectedJourney.date,
              selectedJourney.departingAt,
              selectedJourney.departingAt,
              TIME_WINDOW_MINUTES,
              selectedJourney.originLatitude,
              selectedJourney.originLongitude,
              selectedJourney.destinationLatitude,
              selectedJourney.destinationLongitude
            ]
        );

        setMatches(results);

      } catch (err) {
        console.error("Failed to data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [journeyID]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Matches</Text>

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

      <ScrollView style={styles.matchResults}>
         {matches.length === 0 ? (
          <Text style={styles.emptyText}>No matching journeys found.</Text>
        ) : (
          matches.map((match) => (
            <View key={match.journeyID} style={styles.matchCard}>
              <Text>Origin: {match.origin}</Text>
              <Text>Destination: {match.destination}</Text>
              <Text>Departing At: {match.departingAt}</Text>
              <Text>Must Arrive At: {match.mustArriveAt}</Text>
              <Text>Date: {match.date}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        style={styles.backButton}
        onPress={() => router.replace('/(tabs)/myJourneys')}
      
      >

        <Text>Back to My Journeys</Text>

      </Pressable>
      
    </View>
  );
}

const styles = StyleSheet.create({

    container: {

    flex: 1,
    alignItems: "center",
    marginTop: 40

  },

  title: {

    fontSize: 24,
    borderBottomWidth: 2,
    borderColor: "rgba(11, 161, 226, 1)",

  },

    subtitle: {
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

    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 100,

  },

  matchResults: {

    borderWidth: 1,
    marginBottom: 20,
    marginTop: 20,
    width: 320,
    alignContent: "center",

  },

  matchCard: {
    
    marginBottom: 10,
    backgroundColor: "rgba(124,124,124,0.15)",
    borderRadius: 10,

  },

  emptyText: {

    textAlign: "center",
    marginTop: 20,

  },
})