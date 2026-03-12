
/*

  Screen to facilitate journey management

  This screen displays the user's created journeys and any journeys they have requested and
  been approved to join as a participating passenger

  The user is able to toggle between viewing created journeys and joined journeys using a
  toggle

  For thier created journeys, users have options to find matches, edit the journey, and
  view any passengers that they have approved for their journey

  For joined journies, users have the option to cancel or review their driver

*/

import { StyleSheet, Text, View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { FlatList } from 'react-native';
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { RefreshControl } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { router } from "expo-router";
import { hasUserReviewedJourney, getJourneyDateTime } from "@/services/reviewService";
import { hasJourneyOccurred } from "@/utils/journeyUtils";
import { cancelRequest } from "@/services/requestService";
import { getOwnedJourneys, getJoinedJourneys } from "@/services/journeyService";
import type { OwnedJourney, JoinedJourney } from "@/services/journeyService";

export default function MyJourneys() {

  // Shared DB connection
  const db = useSQLiteContext();

  // Current logged-in user
  const { user } = useAuth();

  // Represents the list of journeys currently shown to the user
  // Could either be the user's created journeys (owned journeys)
  // or journeys they have joined (joined journeys)
  const [Journeys, setJourneys] = useState<(OwnedJourney | JoinedJourney)[]>([]);

  // Controls wether the user sees owned journeys or joined journeys
  const [viewMode, setViewMode] = useState<"myJourneys" | "joined">("myJourneys");

  const [isLoading, setIsLoading] = useState(false);

  // Allows a passenger to review a driver if they have not already reviewed this journey
  // and the journey has already taken place
  const review = async (journeyID: number, revieweeID: number) => {
    if (!user?.userID) return;

    const alreadyReviewed = await hasUserReviewedJourney(
      db,
      journeyID,
      user.userID
    );

    if (alreadyReviewed) {
      Alert.alert("Error", "You have already reviewed this driver for this journey.");
      return;
    }

    const journeyInfo = await getJourneyDateTime(db, journeyID);

    if (!journeyInfo) return;

    // Prevent reviews being submitted before the journey date/time has passed
    if (!hasJourneyOccurred(journeyInfo.date, journeyInfo.departingAt)) {
      Alert.alert("Error", "Cannot review a journey that hasn't occurred yet.");
      return;
    }

    // Navigate to the review screen with journeyID and driver's userID (revieweeID)
    router.push({
      pathname: "/review",
      params: {
        journeyID: journeyID.toString(),
        revieweeID: revieweeID.toString(),
      },
    });
  };

  // Allows a passenger to withdraw from a journey they have joined
  const cancelParticipation = (requestID: number) => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to stop participating in this journey?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelRequest(db, requestID);

              Alert.alert("Success", "Journey cancelled");

              // Refresh the list so the cancelled journey is removed from the UI
              loadJourneys();
            } catch (error) {
              console.error("Cancel request error", error);
              Alert.alert("Error", "Could not cancel participation.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Loads the correct journey dataset based on the currently selected view mode
  const loadJourneys = async () => {

    setIsLoading(true);

    try {

      if (viewMode === "myJourneys") {

        // Fetch journeys created by the current user
        const result = await getOwnedJourneys(db, user!.userID);
        setJourneys(result);

      } else {

        // Fetch journeys the current user has joined as a passenger
        const result = await getJoinedJourneys(db, user!.userID);
        setJourneys(result);

      }

    } catch (error) {

      console.error("Database error", error);

    } finally {

      setIsLoading(false);

    }

  };

  // Reload journeys whenever the user switches between the two view modes
  useEffect(() => {

    loadJourneys();
    
  }, [viewMode]);

  // Reload journeys whenever the screen regains focus after navigation,
  // so related changes made on other screens are reflected immediately
  useFocusEffect(

    useCallback(() => {

      loadJourneys();

    }, [])

  )


  if (isLoading) {

      return <ActivityIndicator size="large" color="#0000ff" />

  }

  return (

    <View style={styles.container}>

    {/* Toggle between recieved and sent rquests*/}
    <View style={styles.toggleContainer}>

      <Pressable
        style={[styles.toggleButton, viewMode === "myJourneys" && styles.toggleButtonActive]}
        onPress={() => setViewMode("myJourneys")}
      >
        <Text style={[styles.toggleText, viewMode === "myJourneys" && styles.toggleTextActive]}>My Journeys</Text>

      </Pressable>

      <Pressable
        style={[styles.toggleButton, viewMode === "joined" && styles.toggleButtonActive]}
        onPress={() => setViewMode("joined")}
      >

        <Text style={[styles.toggleText, viewMode === "joined" && styles.toggleTextActive]}>Joined Journeys</Text>

      </Pressable>
    </View>

      <FlatList
            style={styles.list}
            data={Journeys}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={loadJourneys} tintColor="#007AFF" />
            }
            keyExtractor={(item) => item.journeyID.toString()}
            renderItem={({ item }) => {

              if (viewMode === "myJourneys") {

                const journey = item as OwnedJourney;

                return (
                  <View style={styles.journeyContainer}>

                    <Text>Origin: {journey.origin}</Text>
                    <Text>Destination: {journey.destination}</Text>
                    <Text>Departing At: {journey.departingAt}</Text>
                    <Text>Must Arrive At: {journey.mustArriveAt}</Text>
                    <Text>Date: {journey.date}</Text>

                    <Pressable
                      style={({ pressed }) => [
                        styles.findMatchesButton,
                        pressed && { backgroundColor: "rgba(11, 161, 226, 1)" }
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/findMatches",
                          params: { journeyID: journey.journeyID.toString() },
                        })
                      }
                    >
                      {({ pressed }) => (
                        <Text style={[styles.buttonText, pressed && { color: "white" }]}>
                          Find Matches
                        </Text>
                      )}
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && { backgroundColor: "rgb(77, 77, 77)" }
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/editJourney",
                          params: { journeyID: journey.journeyID.toString() },
                        })
                      }
                    >
                      {({ pressed }) => (
                        <Text style={[styles.buttonText, pressed && { color: "white" }]}>
                          Edit Journey
                        </Text>
                      )}
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && { backgroundColor: "rgb(77, 77, 77)" }
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/passengers",
                          params: { journeyID: journey.journeyID.toString() },
                        })
                      }
                    >
                      {({ pressed }) => (
                        <Text style={[styles.buttonText, pressed && { color: "white" }]}>
                          View Passengers
                        </Text>
                      )}
                    </Pressable>

                  </View>
                );

              } else {

                const journey = item as JoinedJourney;

                return (
                  <View style={styles.journeyContainer}>

                    <Text>Driver: {journey.firstName}</Text>
                    <Text>Origin: {journey.origin}</Text>
                    <Text>Destination: {journey.destination}</Text>
                    <Text>Departing At: {journey.departingAt}</Text>
                    <Text>Must Arrive At: {journey.mustArriveAt}</Text>
                    <Text>Date: {journey.date}</Text>

                    <Pressable
                      style={({ pressed }) => [
                        styles.findMatchesButton,
                        pressed && { backgroundColor: "rgba(11, 161, 226, 1)" }
                      ]}
                      onPress={() => review(journey.journeyID, journey.recipientID)}
                    >
                      {({ pressed }) => (
                        <Text style={[styles.buttonText, pressed && { color: "white" }]}>
                          Review Driver
                        </Text>
                      )}
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && { backgroundColor: "rgb(77, 77, 77)" }
                      ]}
                      onPress={() => cancelParticipation(journey.requestID)}
                    >
                      {({ pressed }) => (
                        <Text style={[styles.buttonText, pressed && { color: "white" }]}>
                          Cancel
                        </Text>
                      )}
                    </Pressable>

                  </View>
                );

              }

            }}
            ListEmptyComponent={<Text>Nothing here for now!</Text>}
        />

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

  list: {
    width: 320,
    marginTop: 20,
  },

  journeyContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: 15,
  },

  findMatchesButton: {
    marginTop: 10,
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(11, 161, 226, 0.2)",
    width: 140,
    borderRadius: 5,
    padding: 10,
  },

  secondaryButton: {
    marginTop: 10,
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(124, 124, 124, 0.2)",
    width: 140,
    borderRadius: 5,
    padding: 10,
  },

  buttonText: {
    color: "rgba(11, 161, 226, 1)",
  },

  toggleContainer: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: "#E6F4FA",
    borderRadius: 25,
    padding: 4,
  },

  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },

  toggleButtonActive: {
    backgroundColor: "rgba(11, 161, 226, 1)",
  },

  toggleText: {
    color: "rgba(11, 161, 226, 1)",
    fontWeight: "600",
  },

  toggleTextActive: {
    color: "white",
  },
});