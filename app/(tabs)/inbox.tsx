import { Platform, StyleSheet, View, Text, Pressable, FlatList } from 'react-native';

import { exampleMessages } from "@/data/exampleMessages"

export default function Inbox() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Inbox</Text>
      <View style={styles.messageDisplay}>
        <FlatList
              data={exampleMessages}
              renderItem={({item}) =>

                <Pressable style={({ pressed }) => [styles.message, pressed && { backgroundColor: "rgba(133, 221, 255, .5)"}]}>
                  <Text style={styles.messageHeader}>{item.messageSender}</Text>
                  <Text style={styles.messageBody}>{item.messageBody}</Text>
                  <Text style={styles.messageTime}>{item.messageTimestamp}</Text>
                </Pressable>}

              keyExtractor={exampleJourney => exampleJourney.messageID.toString()}
              showsVerticalScrollIndicator={false}>    
        </FlatList>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {

    alignItems: "center",
    marginTop: 40,

  },

  title: {

    fontSize: 48,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderColor: "rgba(11, 161, 226, 1)",

  },

  messageDisplay: {

    width: 350,

  },

  messageTime: {

    color: "gray",
    fontSize: 12,
    textAlign: "right",

  },

  messageHeader: {

    fontSize: 16,
    fontWeight: "bold",

  },

  messageBody: {

    marginTop: 10,
    marginBottom: 10,
    textAlign: "justify"

  },
   

  message: {

    backgroundColor: "white",
    marginTop: 20,
    padding: 10,
    borderRadius: 10,

  }

})