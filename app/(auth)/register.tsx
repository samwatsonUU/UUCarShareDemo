import { StyleSheet, Text, View, ScrollView, Pressable, Alert, TextInput, Switch } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { Picker } from '@react-native-picker/picker';  

export default function register() { 

  const[form, setForm] = useState({

        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        gender: '',
        role: '',
        bio: '',
        canDrive: false,
        prefersSameGender: false,
        smokingAllowed: false

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

    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async () => {


      try {

            // ensure no inputs are empty
            if(!form.email || !form.password || !form.confirmPassword || !form.firstName || !form.lastName || !form.gender || !form.role || !form.bio) {

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

                'INSERT INTO users (email, password, firstName, lastName, gender, role, bio, canDrive, prefersSameGender, smokingAllowed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [form.email, form.password, form.firstName, form.lastName, form.gender, form.role, form.bio, form.canDrive, form.prefersSameGender, form.smokingAllowed]

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
              bio: '',
              canDrive: false,
              prefersSameGender: false,
              smokingAllowed: false,

            });
        
        } catch (error: unknown) {

            console.error(error);

            const message = error instanceof Error ? error.message: 'An error occurred while adding the user.';

            Alert.alert('Error', message);
        }
      };

      const returnToMenu = async () => { router.replace("/(auth)/login") }

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

        <TextInput
        style={styles.input}
        placeholder="Bio"
        value={form.bio}
        onChangeText={(text) => setForm({ ...form, bio: text })}
        />

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
      onPress={returnToMenu}
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