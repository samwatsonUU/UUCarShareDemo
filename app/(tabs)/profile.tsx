
/*

  User profile page and management screen

  This screen loads the current logged-in user's information and displays it

  It also allows the user to make changes and save them on the fly

  It is from here that the user can log out of thier account

*/

import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useAuth } from "@/context/AuthContext";
import { useState, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';  
import { getUserReviewScore } from "@/services/reviewService";
import { getUserById, updateUserProfile, emailExistsForOtherUser  } from "@/services/userService";

type UserForm = {
  email: string,
  firstName: string,
  lastName: string,
  gender: string,
  role: string,
  canDrive: boolean,
  prefersSameGender: boolean,
  smokingAllowed: boolean
}

export default function Profile() {

  // Shared DB connection
  const db = useSQLiteContext();

  // Current user plus login and logout options from AuthContext
  const { user, login, logout } = useAuth();

  // Stores the users rating score for display
  const [rating, setRating] = useState<number>(0);

  // Function that ends the user's current session and sends them back to the login screen
  const logoutUser = () => {
      logout();
      router.replace('/(auth)/login');
    }

  // Form with fields containing the user's information
  const [form, setForm] = useState<UserForm>({
    email: '',
    firstName: '',
    lastName: '',
    gender: '',
    role: '',
    canDrive: false,
    prefersSameGender: false,
    smokingAllowed: false
  });

  // Used to determine if the user's data has loaded from the DB
  const [isLoading, setIsLoading] = useState(false);

  // Function to load the user's average rating from the reviews table
  const loadRating = async () => {

    if (!user?.userID) return;

    const score = await getUserReviewScore(db, user.userID);

    setRating(score ?? 0);

  };

  // Load the users details from the DB and map them to the form's fields
  const loadUser = async () => {
    if (!user?.userID) return;

    try {
      setIsLoading(true);

      const loadedUser = await getUserById(db, user.userID);

      if (!loadedUser) return;

      const userForm: UserForm = {
        email: loadedUser.email ?? '',
        firstName: loadedUser.firstName ?? '',
        lastName: loadedUser.lastName ?? '',
        gender: loadedUser.gender ?? '',
        role: loadedUser.role ?? '',
        canDrive: loadedUser.canDrive === 1,
        prefersSameGender: loadedUser.prefersSameGender === 1,
        smokingAllowed: loadedUser.smokingAllowed === 1
      };

      setForm(userForm);
    } catch (err) {
      console.error("Database error", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh profile details and rating whenever the screen becomes active again
  useFocusEffect(
    useCallback(() => {
      loadUser(); // load when screen is focused
      loadRating();
    }, [user])
  );


  // Restrict profile email updates to Ulster University email addresses
  const validEmail = (value: string) => /^[A-Za-z0-9._%+-]+@ulster\.ac\.uk$/.test(value);

  // Validate and save the edited profile details back to the database
  const saveChanges = async () => {
    if (!user?.userID) return;

    try {
      const email = form.email.trim();
      const firstName = form.firstName.trim();
      const lastName = form.lastName.trim();

       // Prevent incomplete profile updates
      if (!email || !firstName || !lastName || !form.gender || !form.role) {
        throw new Error("No fields can be empty.");
      }

      // Email must end in @ulster.ac.uk
      if (!validEmail(email)) {
        throw new Error("Email must end with @ulster.ac.uk");
      }

      // Prevent multiple accounts being created using the same email address
      if (await emailExistsForOtherUser (db, email, user.userID)) {
        throw new Error('Email provided is already in use.');
      }

      // Persist the updated profile values to the database
      await updateUserProfile(db, user.userID, {
        email,
        firstName,
        lastName,
        gender: form.gender,
        role: form.role,
        canDrive: Number(form.canDrive),
        prefersSameGender: Number(form.prefersSameGender),
        smokingAllowed: Number(form.smokingAllowed),
      });

      const updatedUser = await getUserById(db, user.userID);

      if (updatedUser) {
        // Update AuthContext so the session reflects user's new details
        login(updatedUser);
        Alert.alert("Success", "Changes Saved!");
        loadUser();
      }

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred.";
      Alert.alert("Error", message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>

        {/** Rating */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Rating</Text>
          <Text>⭐ {rating.toFixed(1)}</Text>
        </View>

        {/** Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={form.email} onChangeText={text => setForm({...form, email: text})} />
        </View>

        {/** First Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput style={styles.input} value={form.firstName} onChangeText={text => setForm({...form, firstName: text})} />
        </View>

        {/** Last Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput style={styles.input} value={form.lastName} onChangeText={text => setForm({...form, lastName: text})} />
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>

          <Text style={styles.label}>Gender</Text>

          <View style={styles.pickerContainer}>

            <Picker
              selectedValue={form.gender}
              onValueChange={(value) => setForm({ ...form, gender: value})}
            >

              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />

            </Picker>
          </View>
        </View>

        {/* Role */}
        <View style={styles.inputGroup}>

          <Text style={styles.label}>Role</Text>

          <View style={styles.pickerContainer}>

            <Picker
              selectedValue={form.role}
              onValueChange={(value) => setForm({ ...form, role: value})}
            >

              <Picker.Item label="Student" value="Student" />
              <Picker.Item label="Staff" value="Staff" />

            </Picker>
          </View>
        </View>

        {/** Can Drive */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Can Drive</Text>
          <Switch value={form.canDrive} onValueChange={value => setForm({...form, canDrive: value})} />
        </View>

        {/** Same Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Match with same gender only</Text>
          <Switch value={form.prefersSameGender} onValueChange={value => setForm({...form, prefersSameGender: value})} />
        </View>

        {/** Smoking */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Smoking Allowed</Text>
          <Switch value={form.smokingAllowed} onValueChange={value => setForm({...form, smokingAllowed: value})} />
        </View>
      </View>

      <Pressable style={({ pressed }) => [styles.button, pressed && { backgroundColor: "rgba(11, 161, 226, 1)" }]} onPress={saveChanges}>
        {({ pressed }) => <Text style={[styles.buttonText, pressed && { color: "white" }]}>Save</Text>}
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && { backgroundColor: "rgba(11, 161, 226, 1)" }
        ]}
        onPress={logoutUser}
      >
        {({ pressed }) => (
          <Text style={[styles.buttonText, pressed && { color: "white" }]}>
            Logout
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    alignItems: "center",
    paddingBottom: 40
  },

  form: {
    borderRadius: 10,
    width: 320,
    marginTop: 20
  },

  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10
  },

  label: {
    width: 90,
    fontWeight: "bold"
  },

  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "gray",
    backgroundColor: "white",
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderRadius: 5
  },

  button: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(11, 161, 226, 0.2)",
    width: 100,
    borderRadius: 5,
    padding: 10,
    marginTop: 20
  },
  
  buttonText: {
    color: "rgba(11, 161, 226, 1)"
  },

    logoutButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(124, 124, 124, 0.2)",
    width: 100,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },

  pickerContainer: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "gray",
    backgroundColor: "white",
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderRadius: 5
  },
});
