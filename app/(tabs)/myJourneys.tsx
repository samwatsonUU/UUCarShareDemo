import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { FlatList } from 'react-native';
import { exampleJourneys } from "@/data/exampleJourneys"
import { Button } from '@react-navigation/elements';
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { RefreshControl } from "react-native";

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
  const [isLoading, setIsLoading] = useState(false);
  const db = useSQLiteContext();

  const loadUsers = async () => {

      try {

          setIsLoading(true);

          const results = await db.getAllAsync<Journey>(
            "SELECT * FROM journeys ORDER BY journeyID DESC"
          );

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

  if (isLoading) {

      return <ActivityIndicator size="large" color="#0000ff" />

  }

  return (

    <View style={styles.container}>

      <AntDesign name="car" size={96} color="rgba(11, 161, 226, 1)"/>
      <Text style={styles.title}>My Journeys</Text>

      <FlatList
            style={styles.list}
            data={Journeys}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={loadUsers} tintColor="#007AFF" />
            }
            keyExtractor={(item) => item.journeyID.toString()}
            renderItem={({ item }) => (
                <View style={styles.journeyContainer}>
                    {/* <Text>{item.journeyID}</Text> */}
                    {/* <Text>{item.userID}</Text> */}
                    <Text>Origin: {item.origin}</Text>
                    <Text>Destination: {item.destination}</Text>
                    <Text>Departing At: {item.departingAt}</Text>
                    <Text>Must Arrive At: {item.mustArriveAt}</Text>
                    <Text>Date: {item.date}</Text>

                    <Pressable style={({ pressed }) => [styles.findMatchesButton, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}>
                      {({ pressed }) => (
                      <Text style={[styles.buttonText, pressed && { color: "white" }]}>Find matches</Text>
                      )}
                    </Pressable>

                </View>
            )}
            ListEmptyComponent={<Text>You haven't added any journeys - go to the "Add A Journey" screen to do so.</Text>}
        />

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

    fontSize: 48,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderColor: "rgba(11, 161, 226, 1)"

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

  buttonText: {

    color: "rgba(11, 161, 226, 1)",

  }

})