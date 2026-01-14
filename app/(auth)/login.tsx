import { StyleSheet, Text, View, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";


type UserRow = {
  userID: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  role: string;
  bio: string;
  canDrive: number;
  prefersSameGender: number;
  smokingAllowed: number;
  
};


export default function login() { 

  const { user, login } = useAuth();

  const [showPassword, setShowPassword] = useState(false)

  const[form, setForm] = useState({

        email: '',
        password: '',

    })

    const db = useSQLiteContext();

    const handleSubmit = async () => {

      try {

        if(!form.email || !form.password) {

        Alert.alert("Error", "Please enter both an email and password.");
        return;

      } 

      // retrieve from the DB
      const user = await db.getFirstAsync<UserRow>(`SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND password = ?`, [form.email, form.password]);

      if(!user) {

        Alert.alert("Login Failed", "Invalid email or password - please try again.");
        return;

      }

      console.log('LOGGED IN USER:', user);

      login({
        userID: user.userID,
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        role: user.role,
        bio: user.bio,
        canDrive: user.canDrive,
        prefersSameGender: user.prefersSameGender,
        smokingAllowed: user.smokingAllowed,
      });

      router.replace('/(tabs)/myJourneys');

      } catch (error: unknown) {

          console.error(error);

          const message = error instanceof Error ? error.message: 'An error occurred while adding the user.';

          Alert.alert('Error', message);
      }

      };

      const register = async () => { router.replace("/(auth)/register") }

    return (

    <View style={styles.container}>

      <AntDesign name="car" size={96} color="rgba(11, 161, 226, 1)"/>
      <Text style={styles.title}>UUCarShare</Text>
      
      <ScrollView style={styles.form}>
    

        <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        autoCorrect={false}
        autoCapitalize='none'
        onChangeText={(text) => setForm({ ...form, email: text })}
        />

        <TextInput
        style={styles.input}
        placeholder="Password"
        value={form.password}
        autoCorrect={false}
        autoCapitalize='none'
        secureTextEntry = {!showPassword}
        onChangeText={(text) => setForm({ ...form, password: text })}
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

      </ScrollView>
      
      <Pressable
      style={({ pressed }) => [styles.button, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}

      onPress={handleSubmit}

      >  
      {({ pressed }) => (
      <Text style={[styles.buttonText, pressed && { color: "white" }]}>Login</Text>
      )}
      </Pressable>

      <Pressable
      style={({ pressed }) => [styles.registerButton, pressed && { backgroundColor: "rgba(98, 98, 98, 1)"}]}
      onPress={register}
      >  
      {({ pressed }) => (
      <Text style={[styles.buttonText, pressed && { color: "white" }]}>Register</Text>
      )}
      </Pressable>

      <Pressable
      onPress={ () => router.replace("/(auth)/forgotPassword")}
      >  
      {({ pressed }) => (
      <Text style={[styles.buttonText, pressed && { color: "Black" }]}>Forgot Password</Text>
      )}
      </Pressable>


    </View>

    );
}

const styles = StyleSheet.create({

  container: {

    alignItems: "center",
    marginTop: 40

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

  registerButton: {

    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(168, 168, 168, 0.2)",
    width: 100,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,

  },

  forgotPasswordButton: {

    alignItems: "center",
    alignSelf: "center",
    width: 100,
    borderRadius: 5,
    padding: 10,

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