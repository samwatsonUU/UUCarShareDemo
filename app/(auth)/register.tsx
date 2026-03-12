
/*

  Registration screen for the application

  This screen collects user details/preferences and validates them

  If data is not acceptable, the user is alerted to make changes

  If data supplied satisfies all validation rules, a new user record is created

*/

import { StyleSheet, Text, View, ScrollView, Pressable, Alert, TextInput, Switch } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { Picker } from '@react-native-picker/picker';  
import { emailExists, createUser } from "@/services/userService";

export default function Register() {

  // Form to store all values entered into the registration screen's inputs
  const [form, setForm] = useState({

    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    gender: '',
    role: '',
    canDrive: false,
    prefersSameGender: false,
    smokingAllowed: false

  })

  // Shared SQLite DB
  const db = useSQLiteContext();

  // Function to enforce UU email addresses are only allowed
  const validEmail = (value: string): boolean => {

    return /^[A-Za-z0-9._%+-]+@ulster\.ac\.uk$/.test(value);

  }

  // Function to ensure passwords are complex enough
  // Must be at least 8 characters and contain a number, special character and capital letter
  const validPassword = (value: string): boolean => {

    return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

  }

  // Controls if text in the password field is visible
  const [showPassword, setShowPassword] = useState(false)

  // Validates the data entered into the form, checks if the provided email is already 
  // associated with an account, and creates a new user record
  const handleSubmit = async () => {
    try {

      // Trim the text fields to remove unecesssary whitespace
      const email = form.email.trim();
      const firstName = form.firstName.trim();
      const lastName = form.lastName.trim();

      // Ensure all fields have values
      if (!email || !form.password || !form.confirmPassword || !firstName || !lastName || !form.gender || !form.role) {
        throw new Error("All fields are required");
      }

      // Prevent multiple accounts being created using the same email address
      if (await emailExists(db, email)) {
        throw new Error('Email provided is already in use - use "Reset Password" instead.');
      }

      // Esnure an UU email address has been provided
      if (!validEmail(email)) {
        throw new Error("Email must end with @ulster.ac.uk");
      }

      // Ensure entered password meets required complexity rules
      if (!validPassword(form.password)) {
        throw new Error(
          "Password does not meet requirements - must be at least 8 characters and contain 1 capital letter, 1 number and 1 special character"
        );
      }

      // Ensure the user has confirmed thier password correctly
      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Create a new user account with the supplied information
      // Booleans are converted to numbers (if toggled 1, if not 0)
      await createUser(db, {
        email,
        password: form.password,
        firstName,
        lastName,
        gender: form.gender,
        role: form.role,
        canDrive: Number(form.canDrive),
        prefersSameGender: Number(form.prefersSameGender),
        smokingAllowed: Number(form.smokingAllowed),
      });

      // Inform the user they have registered successfully
      Alert.alert(
        "Success",
        `You have been registered successfully, ${firstName}!`
      );

      // Reset the form after successful account creation
      setForm({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        gender: "",
        role: "",
        canDrive: false,
        prefersSameGender: false,
        smokingAllowed: false,
      });

    } catch (error: unknown) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while registering the user.";

      Alert.alert("Error", message);
    }
  };

  // return the user to the login screen when called
  const returnToLogin = async () => { router.replace("/(auth)/login") }

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      <AntDesign name="car" size={96} color="rgba(11, 161, 226, 1)"/>

      <Text style={styles.title}>UUCarShare</Text>
      
      <View style={styles.form}>

        <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
        />

        <TextInput
        style={styles.input}
        placeholder="Password"
        value={form.password}
        secureTextEntry = {!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(text) => setForm({ ...form, password: text })}
        />

        <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={form.confirmPassword}
        secureTextEntry = {!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
        />

        <Pressable
          style={({ pressed }) => [styles.buttonHoldToShow, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}
          onPressIn={() => setShowPassword(true)}
          onPressOut={() => setShowPassword(false)}
        >  

          {({ pressed }) => (
          <Text style={[styles.buttonText, pressed && { color: "white" }]}>Hold to Show</Text>
          )}

        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={form.firstName}
          onChangeText={(text) => setForm({ ...form, firstName: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={form.lastName}
          onChangeText={(text) => setForm({ ...form, lastName: text })}
        />

        <View style={styles.pickerContainer}>

          <Picker
            selectedValue={form.gender}
            onValueChange={(value) => setForm({ ...form, gender: value})}
          >

            <Picker.Item label="Select Gender..." value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />

          </Picker>

        </View>

        <View style={styles.pickerContainer}>

          <Picker
            selectedValue={form.role}
            onValueChange={(value) => setForm({ ...form, role: value})}
          >

            <Picker.Item label="Select Role..." value="" />
            <Picker.Item label="Student" value="Student" />
            <Picker.Item label="Staff" value="Staff" />

          </Picker>

        </View>

        <View style={styles.switchRow}>

          <Text>Can Drive</Text>

          <Switch
            value={form.canDrive}
            onValueChange={(value) =>
              setForm({ ...form, canDrive: value })
            }
          />

        </View>

        <View style={styles.switchRow}>

          <Text>Match with same gender only</Text>

          <Switch
            value={form.prefersSameGender}
            onValueChange={(value) =>
              setForm({ ...form, prefersSameGender: value })
            }
          />

        </View>

        <View style={styles.switchRow}>

          <Text>Smoking Allowed</Text>

          <Switch
            value={form.smokingAllowed}
            onValueChange={(value) =>
              setForm({ ...form, smokingAllowed: value })
            }
          />

        </View>

      </View>
      
      <Pressable
        style={({ pressed }) => [styles.button, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}
        onPress={handleSubmit}
      >  
        {({ pressed }) => (
        <Text style={[styles.buttonText, pressed && { color: "white" }]}>Register</Text>
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.registerButton, pressed && { backgroundColor: "rgba(98, 98, 98, 1)"}]}
        onPress={returnToLogin}
      >  
        {({ pressed }) => (
        <Text style={[styles.buttonText, pressed && { color: "white" }]}>Back to Login</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    marginTop: 40,
    marginBottom: 40
  },

  content: {
    alignItems: "center",
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
    backgroundColor: "white",
    borderRadius: 10,
    width: 300,
    marginTop: 20,
    marginBottom: 20,
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

  },

  button: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(11, 161, 226, 0.2)",
    width: 100,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },

  registerButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(168, 168, 168, 0.2)",
    width: 120,
    borderRadius: 5,
    padding: 10,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    margin: 5,
    borderRadius: 4,
    overflow: 'hidden',
  },

  buttonHoldToShow: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(11, 161, 226, 0.2)",
    width: 140,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10
  }
})