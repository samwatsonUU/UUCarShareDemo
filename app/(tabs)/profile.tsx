import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useAuth } from "@/context/AuthContext";
import { useState, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router, useNavigation } from "expo-router";
import { Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { AuthUser } from "@/context/AuthContext";
import { Picker } from '@react-native-picker/picker';  

type UserForm = {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  gender: string,
  role: string,
  bio: string,
  canDrive: boolean,
  prefersSameGender: boolean,
  smokingAllowed: boolean
}

export default function Profile() {

  const db = useSQLiteContext();
  const { user, login, logout } = useAuth();
  const navigation = useNavigation();

  const logoutUser = () => {
      logout();
      router.replace('/(auth)/login');
    }

  const [form, setForm] = useState<UserForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    gender: '',
    role: '',
    bio: '',
    canDrive: false,
    prefersSameGender: false,
    smokingAllowed: false
  });

  const [initialForm, setInitialForm] = useState<UserForm | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /** --- Load user from DB --- */
  const loadUser = async () => {
    if (!user?.userID) return;
    try {
      setIsLoading(true);
      const results = await db.getAllAsync<AuthUser>(
        "SELECT * FROM Users WHERE userID = ?", [user.userID]
      );
      if (results.length > 0) {
        const u = results[0];
        const userForm: UserForm = {
          email: u.email ?? '',
          password: u.password ?? '',
          firstName: u.firstName ?? '',
          lastName: u.lastName ?? '',
          gender: u.gender ?? '',
          role: u.role ?? '',
          bio: u.bio ?? '',
          canDrive: u.canDrive === 1,
          prefersSameGender: u.prefersSameGender === 1,
          smokingAllowed: u.smokingAllowed === 1
        };
        setForm(userForm);
        setInitialForm(userForm); // keep a copy for change detection
      }
    } catch (err) {
      console.error("Database error", err);
    } finally {
      setIsLoading(false);
    }
  };

useFocusEffect(
  useCallback(() => {
    loadUser(); // load when screen is focused
  }, [user])
);


  /** --- Validate --- */
  const validEmail = (value: string) => /^[A-Za-z0-9._%+-]+@ulster\.ac\.uk$/.test(value);
  const validPassword = (value: string) => /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

  /** --- Save changes --- */
  const saveChanges = async () => {
    try {
      if (!form.email || !form.password || !form.firstName || !form.lastName || !form.gender || !form.role) {
        throw new Error('No fields can be empty.');
      } else if (!validEmail(form.email)) {
        throw new Error("Email must end with @ulster.ac.uk");
      } else if (!validPassword(form.password)) {
        throw new Error("Password must be 8+ chars, 1 uppercase, 1 number, 1 special char");
      }

      await db.runAsync(
        'UPDATE users SET email = ?, password = ?, firstName = ?, lastName = ?, gender = ?, role = ?, bio = ?, canDrive = ?, prefersSameGender = ?, smokingAllowed = ? WHERE userID = ?',
        [
          form.email,
          form.password,
          form.firstName,
          form.lastName,
          form.gender,
          form.role,
          form.bio,
          form.canDrive ? 1 : 0,
          form.prefersSameGender ? 1 : 0,
          form.smokingAllowed ? 1 : 0,
          user!.userID
        ]
      );

      const updatedUser = await db.getFirstAsync<AuthUser>(
        'SELECT * FROM users WHERE userID = ?',
        [user!.userID]
      );

      if (updatedUser) {
        login(updatedUser); // refresh AuthContext
        Alert.alert("Success", "Changes Saved!");
        loadUser(); // reload and reset initialForm
      }

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred.';
      Alert.alert('Error', message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        {/** Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={form.email} onChangeText={text => setForm({...form, email: text})} />
        </View>

        {/** Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={form.password} secureTextEntry onChangeText={text => setForm({...form, password: text})} />
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

        {/** Bio */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput style={[styles.input, { height: 80 }]} multiline value={form.bio} onChangeText={text => setForm({...form, bio: text})} />
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
