import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert, Text, Pressable } from 'react-native'
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "@/context/AuthContext";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function AddJourney() {

  const[form, setForm] = useState({

        origin: '',
        originLatitude: null as number | null,
        originLongitude: null as number | null,

        destination: '',
        destinationLatitude: null as number | null,
        destinationLongitude: null as number | null,

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

            } else if(form.originLatitude === null || form.originLongitude === null || form.destinationLatitude === null || form.destinationLongitude === null) {

              throw new Error("Please select both an origin and a destination from the suggestions list.")

            }


            console.log('Journey about to be inserted:', {
            userID: user!.userID,
            origin: form.origin,
            originLatitude: form.originLatitude,
            originLongitude: form.originLongitude,
            destination: form.destination,
            destinationLatitude: form.destinationLatitude,
            destinationLongitude: form.destinationLongitude,
            departingAt: form.departingAt,
            mustArriveAt: form.mustArriveAt,
            date: form.date,
            status: 'test'
            });



            // insert data into the database
            await db.runAsync(

                'INSERT INTO journeys (userID, origin, originLatitude, originLongitude, destination, destinationLatitude, destinationLongitude, departingAt, mustArriveAt, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "test")',
                [user!.userID, form.origin, form.originLatitude, form.originLongitude, form.destination, form.destinationLatitude, form.destinationLongitude, form.departingAt, form.mustArriveAt, form.date]

            );

            console.log('New Journey:', form.origin + " to " + form.destination);

            Alert.alert('Success', 'Journey added successfully!');
            setForm({

              origin: '',
              originLatitude: null,
              originLongitude: null,

              destination: '',
              destinationLatitude: null,
              destinationLongitude: null,

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

      <View
        style={styles.form}
      >

        <View style={styles.inputGroup}>
          
        <Text style={styles.label}>Origin</Text>

          <View style={{ zIndex: 1000, elevation: 1000 }}>
            <GooglePlacesAutocomplete
              placeholder="E.g. Eglinton"
              fetchDetails={true}

              // onPress={(data) =>
                // setForm({ ...form, origin: data.description })
              // }

              onPress={(data, details) => {


                if(!details) return;

                setForm({
                  ...form,
                  origin: data.description,
                  originLatitude: details.geometry.location.lat,
                  originLongitude: details.geometry.location.lng,
                });

              }}


              query={{
                key: "AIzaSyBf_wr99NS_hcYHspoUxdKuv-NdRXzDgQs",
                language: "en",
              }}
              textInputProps={{
                value: form.origin,
                onChangeText: (text) =>
                  setForm({ ...form, origin: text }),
              }}
              styles={{
                container: { flex: 0 },
                textInput: styles.input,
                listView: {
                  backgroundColor: "white",
                  zIndex: 1000,
                },
              }}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>

          <Text style={styles.label}>Destination</Text>

          <View style={{ zIndex: 1000, elevation: 1000 }}>
            <GooglePlacesAutocomplete
              placeholder="E.g. Magee"
              fetchDetails={true}

              // onPress={(data) =>
                // setForm({ ...form, destination: data.description })
              // }

              onPress={(data, details) => {


                if(!details) return;

                setForm({
                  ...form,
                  destination: data.description,
                  destinationLatitude: details.geometry.location.lat,
                  destinationLongitude: details.geometry.location.lng,
                });

              }}

              query={{
                key: "AIzaSyBf_wr99NS_hcYHspoUxdKuv-NdRXzDgQs",
                language: "en",
              }}
              textInputProps={{
                value: form.destination,
                onChangeText: (text) =>
                  setForm({ ...form, destination: text }),
              }}
              styles={{
                container: { flex: 0 },
                textInput: styles.input,
                listView: {
                  backgroundColor: "white",
                  zIndex: 1000,
                },
              }}
            />
          </View>

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

      </View>

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
    margin: 5,

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