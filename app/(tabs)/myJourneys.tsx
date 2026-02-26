import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { FlatList } from 'react-native';
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { RefreshControl } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { router } from "expo-router";


type Journey = {
  journeyID: number;
  userID: string;
  origin: string;
  destination: string;
  departingAt: string;
  mustArriveAt: string;
  date: string;
  status: string;
};

export default function MyJourneys() {


  const [Journeys, setJourneys] = useState<Journey[]>([]);
  const [viewMode, setViewMode] = useState<"myJourneys" | "joined">("myJourneys");
  const [isLoading, setIsLoading] = useState(false);
  const db = useSQLiteContext();
  const { user } = useAuth();

  const loadUsers = async () => {

    setIsLoading(true);

      try {

        let query = "";
        if (viewMode === "myJourneys") {
          query = "SELECT * FROM journeys WHERE userID = ? ORDER BY journeyID DESC", [user!.userID]         

        } else {

          // pull journeys where the user has sent a request, and it has been approved
          // query = "SELECT * FROM journeys WHERE userID = ? ORDER BY journeyID DESC", [user!.userID]
          query = "SELECT r.*, j.* FROM requests r JOIN journeys j on r.journeyID = j.journeyID WHERE r.requesterID = ? AND r.status = ?"

        }

        const results = await db.getAllAsync<Journey>(query, [user!.userID, "Approved"]);

          setJourneys(results)

      } catch (error) {

          console.error("Database error", error);

      } finally {

          setIsLoading(false);

      }

  };

  useEffect(() => {

      loadUsers();

  }, []);



  useFocusEffect(

    useCallback(() => {

      loadUsers();

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
                <RefreshControl refreshing={isLoading} onRefresh={loadUsers} tintColor="#007AFF" />
            }
            keyExtractor={(item) => item.journeyID.toString()}
            renderItem={({ item }) =>
              
              // if the user is currently viewing their own added journeys
              
              viewMode === "myJourneys" ? (

                <View style={styles.journeyContainer}>

                    <Text>Origin: {item.origin}</Text>
                    <Text>Destination: {item.destination}</Text>
                    <Text>Departing At: {item.departingAt}</Text>
                    <Text>Must Arrive At: {item.mustArriveAt}</Text>
                    <Text>Date: {item.date}</Text>

                    <Pressable style={({ pressed }) => [styles.findMatchesButton, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}

                      onPress={() =>
                        router.push({
                          pathname: "/findMatches",
                          params: { journeyID: item.journeyID.toString() },
                        })
                      } 
                    >

                      {({ pressed }) => (
                      <Text style={[styles.buttonText, pressed && { color: "white" }]}>Find Matches</Text>
                      )}
                    </Pressable>

                    <Pressable style={({ pressed }) => [styles.editJourneyButton, pressed && { backgroundColor: "rgb(77, 77, 77)"}]}
                      onPress={ () => 
                        router.push({

                          pathname: "/editJourney",
                          params: { journeyID: item.journeyID.toString() },

                        })
                      }>

                      {({ pressed }) => (
                      <Text style={[styles.buttonText, pressed && { color: "white" }]}>Edit Journey</Text>
                      )}
                    </Pressable>

                </View>

              // else, if the user is currently viewing journeys that they have requested participation in and have been approved for
              ) : (


              <Text>AHAHAHA</Text>




            )}
            ListEmptyComponent={<Text>You haven't added any journeys yet, go to "Add A Journey" to start carpooling!</Text>}
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
    width: 120,
    borderRadius: 5,
    padding: 10,
    
  },

  editJourneyButton: {

    marginTop: 10,
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(124, 124, 124, 0.2)",
    width: 120,
    borderRadius: 5,
    padding: 10,
    
  },

  buttonText: {

    color: "rgba(11, 161, 226, 1)",

  },



  toggleContainer: { flexDirection: "row", marginTop: 15, marginBottom: 10, backgroundColor: "#E6F4FA", borderRadius: 25, padding: 4 },
  toggleButton: { paddingVertical: 8, paddingHorizontal: 24, borderRadius: 20 },
  toggleButtonActive: { backgroundColor: "rgba(11, 161, 226, 1)" },
  toggleText: { color: "rgba(11, 161, 226, 1)", fontWeight: "600" },
  toggleTextActive: { color: "white" },


})