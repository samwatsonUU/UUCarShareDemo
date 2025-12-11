import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';

export default function Profile() {
  return (
<View style={styles.container}>

      <Text style={styles.title}>My Profile</Text>

      <View style={styles.profileInfo}>

        <View style={styles.infoGroup}><Text style={styles.label}>First Name:</Text><Text>Sam</Text></View>
        <View style={styles.infoGroup}><Text style={styles.label}>Last Name:</Text><Text>Watson</Text></View>
        <View style={styles.infoGroup}><Text style={styles.label}>Email Address:</Text><Text>Watson-S28@ulster.ac.uk</Text></View>
        <View style={styles.infoGroup}><Text style={styles.label}>Vehicle Registration:</Text><Text>DN13 HRE</Text></View>

      </View>

      <Pressable style={({ pressed }) => [styles.button, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}>
        {({ pressed }) => (
          <Text style={[styles.buttonText, pressed && { color: "white" }]}>Edit Profile</Text>
        )}
      </Pressable>

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

  profileInfo: {

    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    width: 340

  },

  infoGroup: {

    padding: 10,
    flexDirection: "row",
    alignItems: "center",

  },

  label: {

    fontWeight: "bold",
    flexBasis: 150,
    paddingRight: 10,

  },

  input: {

    color: "gray",
    borderWidth: 1,
    padding: 5,
    flex: 1,
    borderRadius: 5

  },

  button: {

    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(11, 161, 226, 0.2)",
    width: 100,
    borderRadius: 5,
    padding: 10

  },

  buttonText: {

    color: "rgba(11, 161, 226, 1)",

  }
   
})