import { StyleSheet, Text, View, ScrollView, Pressable, TextInput } from 'react-native';
import { useAuth } from "@/context/AuthContext";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";

export default function editProfile() {

    const[form, setForm] = useState({

        email: '',
        password: '',
        firstName: '',
        lastName: '',
        gender: '',
        role: '',

    })

    const db = useSQLiteContext();

    const { user } = useAuth();

    useEffect(() => {

        if(user) {

            setForm({

                email: user.email ?? '',
                password: user.password ?? '',
                firstName: user.firstName ?? '',
                lastName: user.lastName ?? '',
                gender: user.gender ?? '',
                role: user.role ?? '',

            })

        }

    }, [user]);

    const validEmail = (value: string): boolean => {

      return /^[A-Za-z0-9._%+-]+@ulster\.ac\.uk$/.test(value);

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




            </ScrollView>
        
        
            <Pressable
            style={({ pressed }) => [styles.button, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}
    
            // onPress={handleSubmit}
    
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

  }

});