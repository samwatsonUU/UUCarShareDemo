import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert, Text, Pressable, ScrollView } from 'react-native'
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "@/context/AuthContext";

export default function AddJourney() {

  const[form, setForm] = useState({

        origin: '',
        destination: '',
        departingAt: '',
        mustArriveAt: '',
        date: ''

    })

    const validTime = (value: string): boolean => {

      return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

    }

    const validDate = (value: string): boolean => {

      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;

      const [day, month, year] = value.split('/').map(Number);
      const date = new Date(year, month - 1, day);

      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );

    };


    const db = useSQLiteContext();

    const { user } = useAuth();

    const handleSubmit = async () => {

        try {

            // ensure no inputs are empty
            if(!form.origin || !form.destination || !form.departingAt || !form.mustArriveAt || !form.date) {

              throw new Error('All fields are required');
                
            } else if(!validTime(form.departingAt) || !validTime(form.mustArriveAt)) {

              throw new Error('Check time format');

            } else if(!validDate(form.date)) {

              throw new Error('Check date format');

            }

            // insert data into the database
            await db.runAsync(

                'INSERT INTO journeys (userID, origin, destination, departingAt, mustArriveAt, date, status) VALUES (?, ?, ?, ?, ?, ?, "test")',
                [user!.userID, form.origin, form.destination, form.departingAt, form.mustArriveAt, form.date]

            );

            console.log('New Journey:', form.origin + " to " + form.destination);

            Alert.alert('Success', 'Journey added successfully!');
            setForm({

              origin: '',
              destination: '',
              departingAt: '',
              mustArriveAt: '',
              date: ''

            });
        
        } catch (error: unknown) {

            console.error(error);

            const message = error instanceof Error ? error.message: 'An error occurred while adding the user.';

            Alert.alert('Error', message);
        }
      };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Add a Journey</Text>

      <ScrollView style={styles.form}>

        <View style={styles.inputGroup}>

          <Text style={styles.label}>Origin</Text>

          <TextInput
            style={styles.input}
            placeholder="E.g. Eglinton"
            value={form.origin}
            onChangeText={(text) => setForm({ ...form, origin: text })}
          />

        </View>

        <View style={styles.inputGroup}>

          <Text style={styles.label}>Destination</Text>

          <TextInput
            style={styles.input}
            placeholder="E.g. Magee"
            value={form.destination}
            onChangeText={(text) => setForm({ ...form, destination: text })}
          />

        </View>

        <View style={styles.inputGroup}>

          <Text style={styles.label}>Departing At</Text>

          <TextInput
            style={styles.input}
            placeholder="08:00"
            value={form.departingAt}
            onChangeText={(text) => setForm({ ...form, departingAt: text })}
          />

        </View>

        <View style={styles.inputGroup}>

          <Text style={styles.label}>Must Arrive At</Text>

          <TextInput
            style={styles.input}
            placeholder="09:00"
            value={form.mustArriveAt}
            onChangeText={(text) => setForm({ ...form, mustArriveAt: text })}
          />

        </View>

        <View style={styles.inputGroup}>

          <Text style={styles.label}>Date</Text>

          <TextInput
            style={styles.input}
            placeholder="01/01/1900"
            value={form.date}
            onChangeText={(text) => setForm({ ...form, date: text })}
          />

        </View>

      </ScrollView>

      <Pressable
      style={({ pressed }) => [styles.button, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}
      onPress={handleSubmit}
      >  
        {({ pressed }) => (
        <Text style={[styles.buttonText, pressed && { color: "white" }]}>Add Journey</Text>
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

  form: {

    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    width: 320,

  },

  inputGroup: {

    padding: 15,
  
  },

  label: {

    fontWeight: "bold",
    paddingBottom: 10

  },

  input: {

    borderWidth: 1,
    borderColor: "gray",

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