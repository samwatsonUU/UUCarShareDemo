import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { FlatList } from 'react-native';
import { exampleJourneys } from "@/data/exampleJourneys"
import { Button } from '@react-navigation/elements';

export default function MyJourneys() {
  return (
    <View style={styles.container}>
      <AntDesign name="car" size={96} color="rgba(11, 161, 226, 1)"/>
      <Text style={styles.title}>My Journeys</Text>
      <FlatList
        data={exampleJourneys}
        renderItem={({item}) =>
          <View style={styles.journeyContainer}>
            <Text style={styles.item}>
              {item.origin}{" -> "}{item.destination}{"  |  Date: "}{item.date}{"\nDeparting at: "}{item.departingAt}{"  |  Must arrive at: "}{item.mustArriveAt}
            </Text>
            
            <Pressable style={({ pressed }) => [styles.findMatchesButton, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}>
              {({ pressed }) => (
              <Text style={[styles.buttonText, pressed && { color: "white" }]}>Find matches</Text>
              )}
            </Pressable>
          </View>}
        keyExtractor={exampleJourney => exampleJourney.journeyId.toString()}
        showsVerticalScrollIndicator={false}>    
      </FlatList>
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

  item: {

    

  },

  journeyContainer: {

    marginTop: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 15,

  },

  findMatchesButton: {

    marginTop: 10,
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(11, 161, 226, 0.2)",
    width: "40%",
    borderRadius: 5

  },

  buttonText: {

    color: "rgba(11, 161, 226, 1)",

  }

})