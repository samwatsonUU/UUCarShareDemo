import { StyleSheet, Text, View, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";

export default function register() { 

  const[form, setForm] = useState({

        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        gender: '',
        role: '',

    })

    const db = useSQLiteContext();

    const validEmail = (value: string): boolean => {

      return /^[A-Za-z0-9._%+-]+@ulster\.ac\.uk$/.test(value);

    }

    const validPassword = (value: string): boolean => {

      return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

    }

    const emailInUse = async (email: string): Promise<boolean> => {

      const rows = await db.getAllAsync(

      'SELECT 1 FROM users WHERE email = ? LIMIT 1', form.email
      
      );

      return rows.length > 0;

    };

    const handleSubmit = async () => {


      try {

            // ensure no inputs are empty
            if(!form.email || !form.password || !form.confirmPassword || !form.firstName || !form.lastName || !form.gender || !form.role) {

              throw new Error('All fields are required');
                
            } else if (await emailInUse(form.email)) {         

              throw new Error("Email provided is already in use - use \"Reset Password\" instead.");

            } else if (!validEmail(form.email)) {

              throw new Error("Email must end with @ulster.ac.uk");

            } else if (!validPassword(form.password)) {

              throw new Error("Password does not meet requirements - must be at least 8 characters and contain 1 capital letter, 1 number and 1 special character");

            } else if (form.password != form.confirmPassword) {

              throw new Error('Passwords do not match');

            }

            // insert data into the database
            await db.runAsync(

                'INSERT INTO users (email, password, firstName, lastName, gender, role, bio, canDrive, prefersSameGender, smokingAllowed) VALUES (?, ?, ?, ?, ?, ?, "test", 0, 0, 0)',
                [form.email, form.password, form.firstName, form.lastName, form.gender, form.role]

            );

            const rows = await db.getAllAsync('SELECT * FROM users');
            console.log('USERS TABLE CONTENTS:', JSON.stringify(rows, null, 2));
            
            Alert.alert(
              'Success',
              `You have been registered successfully, ${form.firstName}!`
            );

            setForm({

              email: '',
              password: '',
              confirmPassword: '',
              firstName: '',
              lastName: '',
              gender: '',
              role: '',

            });
        
        } catch (error: unknown) {

            console.error(error);

            const message = error instanceof Error ? error.message: 'An error occurred while adding the user.';

            Alert.alert('Error', message);
        }
      };

      const returnToMenu = async () => { router.replace("/(auth)/login") }

    return (

    <View style={styles.container}>

      <AntDesign name="car" size={96} color="rgba(11, 161, 226, 1)"/>
      <Text style={styles.title}>UUCarShare</Text>
      
      <ScrollView style={styles.form}>
    

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
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(text) => setForm({ ...form, password: text })}
        />

        <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={form.confirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
        />


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

        <TextInput
        style={styles.input}
        placeholder="Gender"
        value={form.gender}
        onChangeText={(text) => setForm({ ...form, gender: text })}
        />

        <TextInput
        style={styles.input}
        placeholder="Role"
        value={form.role}
        onChangeText={(text) => setForm({ ...form, role: text })}
        />

      </ScrollView>
      
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
      onPress={returnToMenu}
      >  
      {({ pressed }) => (
      <Text style={[styles.buttonText, pressed && { color: "white" }]}>Back to Login</Text>
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
    width: 120,
    borderRadius: 5,
    padding: 10,

  }

})