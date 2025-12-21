import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useAuth } from "@/context/AuthContext";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { Switch } from 'react-native';
import type { AuthUser } from "@/context/AuthContext";


export default function editProfile() {

    const[form, setForm] = useState({

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

    })

    const db = useSQLiteContext();

    const { user, login } = useAuth();

    useEffect(() => {

        if(user) {

            setForm({

                email: user.email ?? '',
                password: user.password ?? '',
                firstName: user.firstName ?? '',
                lastName: user.lastName ?? '',
                gender: user.gender ?? '',
                role: user.role ?? '',
                bio: user.bio ?? '',
                canDrive: user.canDrive === 1,
                prefersSameGender: user.prefersSameGender === 1,
                smokingAllowed: user.smokingAllowed === 1,

            })

        }

    }, [user]);

    const validEmail = (value: string): boolean => {

      return /^[A-Za-z0-9._%+-]+@ulster\.ac\.uk$/.test(value);

    }

    const validPassword = (value: string): boolean => {

      return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

    }

    const saveChanges = async () => {

      try {

        // ensure no inputs are empty
        if(!form.email || !form.password || !form.firstName || !form.lastName || !form.gender || !form.role) {

          throw new Error('No fields can be empty.');

        } else if (!validEmail(form.email)) {

          throw new Error("Email must end with @ulster.ac.uk");

        } else if (!validPassword(form.password)) {

          throw new Error("Password does not meet requirements - must be at least 8 characters and contain 1 capital letter, 1 number and 1 special character");

        }

        await db.runAsync (

          'UPDATE users SET email = ?, password = ?, firstName = ?, lastName = ?, gender = ?, role = ?, bio = ?, canDrive = ?, prefersSameGender = ?, smokingAllowed = ? WHERE userID = ?', [form.email, form.password, form.firstName, form.lastName, form.gender, form.role, form.bio, form.canDrive ? 1 : 0, form.prefersSameGender ? 1 : 0, form.smokingAllowed ? 1 : 0, user!.userID]

        )

      const updatedUser = await db.getFirstAsync<AuthUser>(
        'SELECT * FROM users WHERE userID = ?',
        [user!.userID]
      );

      if (updatedUser) {
        login(updatedUser); // refresh AuthContext

        Alert.alert("Alert", "Changes Saved!")
        router.replace('/(tabs)/profile')

      }
      
      
      } catch (error: unknown) {

        console.error(error);

        const message = error instanceof Error ? error.message: 'An error occurred while adding the user.';

        Alert.alert('Error', message);

      }

    }

    return (

        <View style={styles.container}>
        
            <Text style={styles.title}>Edit Profile</Text>

            <ScrollView style={styles.form}>
                
            
                <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                />

                <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
                />
            
                <TextInput
                style={styles.input}
                value={form.firstName}
                onChangeText={(text) => setForm({ ...form, firstName: text })}
                />
            
                <TextInput
                style={styles.input}
                value={form.lastName}
                onChangeText={(text) => setForm({ ...form, lastName: text })}
                />
            
                <TextInput
                style={styles.input}
                value={form.gender}
                onChangeText={(text) => setForm({ ...form, gender: text })}
                />
            
                <TextInput
                style={styles.input}
                value={form.role}
                onChangeText={(text) => setForm({ ...form, role: text })}
                />

                <TextInput
                style={styles.input}
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
                  <Text>Prefers Same Gender</Text>
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




            </ScrollView>
        
        
            <Pressable
            style={({ pressed }) => [styles.button, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}
    
            onPress={saveChanges}
    
            >  
            {({ pressed }) => (
            <Text style={[styles.buttonText, pressed && { color: "white" }]}>Save Changes</Text>
            )}
            </Pressable>
    
            <Pressable
            style={({ pressed }) => [styles.registerButton, pressed && { backgroundColor: "rgba(98, 98, 98, 1)"}]}
            onPress={() => router.replace('/(tabs)/profile')}
            >  
            {({ pressed }) => (
            <Text style={[styles.buttonText, pressed && { color: "white" }]}>Back to Profile</Text>
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

    input: {

    borderWidth: 1,
    borderColor: "gray",
    margin: 5,
 
  },

    form: {

    backgroundColor: "white",
    borderRadius: 10,
    width: 300,
    marginTop: 20,
    marginBottom: 20,
    padding: 15,

  },

    buttonText: {

    color: "rgba(11, 161, 226, 1)",

  },

  button: {

    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(11, 161, 226, 0.2)",
    width: 120,
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

  },

  switchRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginVertical: 10,
}


});