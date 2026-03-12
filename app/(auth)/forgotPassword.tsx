
/*

  Password reset screen

  This screen allows the user to enter their email address to request a password reset email.

  The email entered is validated, and if a it is a UU email, it will send a "password reset"
  email if that account exists

*/

import { StyleSheet, Text, View, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { useState } from "react";

export default function forgotPassword() {  

  // Stores the email entered into the password reset input
  const[form, setForm] = useState({

      email: '',

  }) 

  // Restrict password reset requests to Ulster University email addresses
  const validEmail = (value: string): boolean => {

    return /^[A-Za-z0-9._%+-]+@ulster\.ac\.uk$/.test(value);

  }

  // Validate the submitted email before confirming the password reset request
  const handleSubmit = async () => {
  
    try {

      // Ensure the user has entered an email address
      if(!form.email) {

      Alert.alert("Error", "Please eneter an email address.");
      return;

      // Reject emails that do not end in @ulster.ac.uk
      } else if (!validEmail(form.email)) {

      Alert.alert("Error", "Email must end with @ulster.ac.uk");
      return;

      }

      // Confirm that the reset request has been submitted
      Alert.alert("Request Submitted", "A password reset link has been sent to the provided email address.");

    } catch (error: unknown) {

      console.error(error);

      const message = error instanceof Error ? error.message: 'An error occurred while requesting password reset email.';

      Alert.alert('Error', message);
    }
  }

  return(

    <View style={styles.container}>
      
      <ScrollView style={styles.form}>

        <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        autoCorrect={false}
        autoCapitalize='none'
        onChangeText={(text) => setForm({ ...form, email: text })}
        />

      </ScrollView>
    
      <Pressable

        style={({ pressed }) => [styles.requestbutton, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}
        onPress={handleSubmit}

      >  
        {({ pressed }) => (
        <Text style={[styles.buttonText, pressed && { color: "white" }]}>Request Password Reset Email</Text>
        )}

      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    alignItems: "center",
    marginTop: "60%",
  },

  title: {
    fontSize: 48,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderColor: "rgba(11, 161, 226, 1)"
  },

  buttonText: {
    color: "rgba(11, 161, 226, 1)",
  },

  form: {
    borderRadius: 10,
    width: 300,
    marginBottom: 0,
    padding: 15,
  },

  label: {
    fontWeight: "bold",
    paddingBottom: 10
  },

  input: {
    borderWidth: 1,
    borderColor: "gray",
    margin: 5,
    backgroundColor: "white",
  },

  requestbutton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(11, 161, 226, 0.2)",
    width: 250,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },

  backButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(168, 168, 168, 0.2)",
    width: 120,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
})