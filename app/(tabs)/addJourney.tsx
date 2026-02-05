import { useState } from "react";
import { View, TextInput, StyleSheet, Alert, Text, Pressable, Keyboard } from 'react-native'
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "@/context/AuthContext";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import DateTimePicker from "@react-native-community/datetimepicker";


export default function AddJourney() {

  const[form, setForm] = useState({

        origin: '',
        originLatitude: null as number | null,
        originLongitude: null as number | null,

        destination: '',
        destinationLatitude: null as number | null,
        destinationLongitude: null as number | null,

        departingAt: null as Date | null,
        mustArriveAt: null as Date | null,
        date: null as Date | null,

    })

    const [showDepartingPicker, setShowDepartingPicker] = useState(false);
    const [showArrivingPicker, setShowArrivingPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [activeAutocomplete, setActiveAutocomplete] = useState<"origin" | "destination" | null>(null);

    const db = useSQLiteContext();

    const { user } = useAuth();

    const handleSubmit = async () => {

        try {

            // ensure no inputs are empty
            if(!form.origin || !form.destination || !form.departingAt || !form.mustArriveAt || !form.date) {

              throw new Error('All fields are required');
                
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

            const formattedDate = form.date.toLocaleDateString("en-GB");

            const formattedDepartingAt = form.departingAt.toTimeString().slice(0, 5);

            const formattedMustArriveAt = form.mustArriveAt.toTimeString().slice(0, 5);


            // insert data into the database
            await db.runAsync(

              'INSERT INTO journeys (userID, origin, originLatitude, originLongitude, destination, destinationLatitude, destinationLongitude, departingAt, mustArriveAt, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "Pending")',
              [
                user!.userID,
                form.origin,
                form.originLatitude,
                form.originLongitude,
                form.destination,
                form.destinationLatitude,
                form.destinationLongitude,
                formattedDepartingAt,
                formattedMustArriveAt,
                formattedDate
              ]

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

              departingAt: null,
              mustArriveAt: null,
              date: null,

            });
        
        } catch (error: unknown) {

            console.error(error);

            const message = error instanceof Error ? error.message: 'An error occurred while adding the user.';

            Alert.alert('Error', message);
        }
      };

  return (


    <Pressable
    style={{ flex: 1 }}
    onPress={() => {
      Keyboard.dismiss();
      setActiveAutocomplete(null);
    }}
    >
      <View style={styles.container}>

        <View style={styles.form}>

          <View style={styles.inputGroup}>
            
          <Text style={styles.label}>Origin</Text>

            <View
              style={[
                styles.inputWrapper,
                {
                  zIndex: activeAutocomplete === "origin" ? 3000 : 1,
                  elevation: activeAutocomplete === "origin" ? 3000 : 1,
                },
              ]}
            >
              <GooglePlacesAutocomplete
                placeholder=""
                fetchDetails={true}

                onPress={(data, details) => {

                  if(!details) return;

                  setActiveAutocomplete(null);

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
                  onFocus: () => setActiveAutocomplete("origin"),
                  onBlur: () => setActiveAutocomplete(null),
                  onChangeText: (text) =>
                  setForm({ ...form, origin: text }),
                }}
                styles={{
                  container: { flex: 0 },
                  textInput: {
                    height: 44,
                    paddingVertical: 0,
                    paddingHorizontal: 10,
                    borderWidth: 1,
                    borderColor: "gray",
                    margin: 10,
                  },
                  listView: {
                    position: "absolute",
                    top: 44,
                    left: 0,
                    right: 0,
                    zIndex: 2000,
                  },
                }}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>

            <Text style={styles.label}>Destination</Text>

            <View
              style={[
                styles.inputWrapper,
                {
                  zIndex: activeAutocomplete === "destination" ? 3000 : 1,
                  elevation: activeAutocomplete === "destination" ? 3000 : 1,
                },
              ]}
            >

              <GooglePlacesAutocomplete
                placeholder=""
                fetchDetails={true}

                onPress={(data, details) => {

                  if(!details) return;

                  setActiveAutocomplete(null);

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
                  onFocus: () => setActiveAutocomplete("destination"),
                  onBlur: () => setActiveAutocomplete(null),
                  onChangeText: (text) =>
                    setForm({ ...form, destination: text }),
                }}
                  styles={{
                    container: { flex: 0 },
                    textInput: {
                      height: 44,
                      paddingVertical: 0,  
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: "gray",
                      margin: 10,
                    },
                    listView: {
                      position: "absolute",
                      top: 44,
                      left: 0,
                      right: 0,
                      zIndex: 2000,
                    },
                  }}
              />
            </View>

          </View>

          <View style={styles.inputGroup}>

            <Text style={styles.label}>Departing At</Text>

            <View style={styles.inputWrapper}>

              <Pressable style={[styles.input, { justifyContent: "center" }]} onPress={() => setShowDepartingPicker(true)}>
                <Text>
                  {form.departingAt
                    ? form.departingAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Select time"}
                </Text>
              </Pressable>

              {showDepartingPicker && (
                <DateTimePicker
                  value={form.departingAt ?? new Date()}
                  mode="time"
                  display="clock"
                  is24Hour
                  onChange={(e, selected) => {
                    setShowDepartingPicker(false);
                    if (selected) setForm({ ...form, departingAt: selected });
                  }}
                />
              )}

            </View>

          </View>

          <View style={styles.inputGroup}>

            <Text style={styles.label}>Must Arrive At</Text>

            <View style={styles.inputWrapper}>

              <Pressable style={[styles.input, { justifyContent: "center" }]} onPress={() => setShowArrivingPicker(true)}>
                <Text>
                  {form.mustArriveAt
                    ? form.mustArriveAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Select time"}
                </Text>
              </Pressable>

              {showArrivingPicker && (
                <DateTimePicker
                  value={form.mustArriveAt ?? new Date()}
                  mode="time"
                  display="clock"
                  is24Hour
                  onChange={(e, selected) => {
                    setShowArrivingPicker(false);
                    if (selected) setForm({ ...form, mustArriveAt: selected });
                  }}
                />
              )}

            </View>

          </View>

          <View style={styles.inputGroup}>

            <Text style={styles.label}>Date</Text>

            <View style={styles.inputWrapper}>
              <Pressable style={[styles.input, { justifyContent: "center" }]} onPress={() => setShowDatePicker(true)}>
                <Text>
                  {form.date
                    ? form.date.toLocaleDateString("en-GB")
                    : "Select date"}
                </Text>
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={form.date ?? new Date()}
                mode="date"
                display="calendar"
                onChange={(e, selected) => {
                  setShowDatePicker(false);
                  if (selected) setForm({ ...form, date: selected });
                }}
              />
            )}


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

    </Pressable>

  );  


  
}

const styles = StyleSheet.create({

  container: {

    alignItems: "center",

  },

  title: {

    fontSize: 24,
    borderBottomWidth: 2,
    borderColor: "rgba(11, 161, 226, 1)",

  },

  form: {

    borderRadius: 10,
    width: 320,
    

  },

  inputGroup: {

    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,

  },

  label: {

    width: 90,
    fontWeight: "bold",

  },

  input: {

    height: 44,
    borderWidth: 1,
    borderColor: "gray",
    backgroundColor: "white",
    margin: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
    borderRadius: 5,

  },


  inputWrapper: {

    flex: 1,

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