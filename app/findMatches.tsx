import { StyleSheet, View, Text, ActivityIndicator, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";

type Journey = {
  journeyID: number;
  userID: number;
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

type JourneyWithUserAndDistance = Journey & {
  firstName: string;
  originDistance: number;
  destinationDistance: number;
};




export default function FindMatches() {
  const { journeyID } = useLocalSearchParams<{ journeyID: string }>();
  const db = useSQLiteContext();
  const { user } = useAuth();

  const [journey, setJourney] = useState<Journey | null>(null);
  const [matches, setMatches] = useState<JourneyWithUserAndDistance[]>([]);
  const [loading, setLoading] = useState(true);

  const haversineKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const toRad = (v: number) => (v * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(a));
  };


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

        const RADIUS_KM = 5;

        // Rough bounding box deltas
        const LAT_DELTA = RADIUS_KM / 111;
        const LNG_DELTA =
        RADIUS_KM /
        (111 * Math.cos(selectedJourney.originLatitude * Math.PI / 180));

        setJourney(selectedJourney);

        const TIME_WINDOW_MINUTES = 30;

        console.log("Executing match query WITHOUT acos");
        // Get matching journeys
        const results = await db.getAllAsync<Journey & { firstName: string }>(
        `
        SELECT
          j.*,
          u.firstName
        FROM journeys j
        JOIN users u ON u.userID = j.userID
        WHERE
          j.userID != ?
          AND j.date = ?

          AND ABS(
            (
              CAST(substr(j.departingAt, 1, 2) AS INTEGER) * 60 +
              CAST(substr(j.departingAt, 4, 2) AS INTEGER)
            ) -
            (
              CAST(substr(?, 1, 2) AS INTEGER) * 60 +
              CAST(substr(?, 4, 2) AS INTEGER)
            )
          ) <= ?

          -- Origin bounding box
          AND j.originLatitude BETWEEN ? AND ?
          AND j.originLongitude BETWEEN ? AND ?

          -- Destination bounding box
          AND j.destinationLatitude BETWEEN ? AND ?
          AND j.destinationLongitude BETWEEN ? AND ?
        `,
        [
          user!.userID,
          selectedJourney.date,
          selectedJourney.departingAt,
          selectedJourney.departingAt,
          TIME_WINDOW_MINUTES,

          selectedJourney.originLatitude - LAT_DELTA,
          selectedJourney.originLatitude + LAT_DELTA,
          selectedJourney.originLongitude - LNG_DELTA,
          selectedJourney.originLongitude + LNG_DELTA,

          selectedJourney.destinationLatitude - LAT_DELTA,
          selectedJourney.destinationLatitude + LAT_DELTA,
          selectedJourney.destinationLongitude - LNG_DELTA,
          selectedJourney.destinationLongitude + LNG_DELTA,
        ]
        );



        const enriched = results
        .map((j) => {
          const originDistance = haversineKm(
            selectedJourney.originLatitude,
            selectedJourney.originLongitude,
            j.originLatitude,
            j.originLongitude
          );

          const destinationDistance = haversineKm(
            selectedJourney.destinationLatitude,
            selectedJourney.destinationLongitude,
            j.destinationLatitude,
            j.destinationLongitude
          );

          return {
            ...j,
            originDistance,
            destinationDistance,
          };
        })
        .filter(
          (j) =>
            j.originDistance <= RADIUS_KM &&
            j.destinationDistance <= RADIUS_KM
        )
        .sort((a, b) => a.originDistance - b.originDistance);

      setMatches(enriched);


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
              <Text>Driver: {match.firstName}</Text>
              <Text>Origin: {match.origin}</Text>
              <Text>Origin Distance: {match.originDistance.toFixed(2)} km</Text>
              <Text>Destination: {match.destination}</Text>
              <Text>Departing At: {match.departingAt}</Text>
              <Text>Must Arrive At: {match.mustArriveAt}</Text>
              <Text>Date: {match.date}</Text>

              <Pressable
              style={({ pressed }) => [styles.requestButton, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}
              >

                {({ pressed }) => (
                <Text style={[styles.buttonText, pressed && { color: "white" }]}>Send Request</Text>
                )}
              </Pressable>

            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && { backgroundColor: "rgba(98, 98, 98, 1)"}]}
        onPress={() => router.replace('/(tabs)/myJourneys')}
      
      >
      {({ pressed }) => (
      <Text style={[styles.buttonText, pressed && { color: "white" }]}>Back to My Journeys</Text>
      )}
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

    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(168, 168, 168, 0.2)",
    width: 150,
    borderRadius: 5,
    padding: 10,
    marginBottom: 100,

  },

  matchResults: {

    borderTopWidth: 1,
    paddingTop: 20,
    marginBottom: 20,
    marginTop: 20,
    width: 320,
    alignContent: "center",

  },

  matchCard: {
    
    marginBottom: 10,
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