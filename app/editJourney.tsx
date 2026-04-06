
/*
  Journey editing screen

  This screen loads an existing journey using the journeyID passed through navigation.

  It retrieves that journey's current data, displays it in editable fields,
  and saves any changes back to the database when the user presses Save Changes.

  As in addJourney.tsx, the origin and destination fields use Google Places
  Autocomplete so coordinate values can also be stored.
*/

import { StyleSheet, Text, View, Keyboard, Pressable, Alert } from 'react-native';
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getJourneyById, updateJourney, deleteJourneyById } from "@/services/journeyService";

export default function EditJourney() {

  // Shared DB connection
  const db = useSQLiteContext();

  // Journey identifier passed from the previous screen so the correct record can be edited
  const { journeyID } = useLocalSearchParams<{ journeyID: string }>();

  // Tracks which autocomplete field is active so its suggestion list appears above other elements
  const [activeAutocomplete, setActiveAutocomplete] = useState<"origin" | "destination" | null>(null);

  // Control visibility of the time/date picker components
  const [showDepartingPicker, setShowDepartingPicker] = useState(false);
  const [showArrivingPicker, setShowArrivingPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Google Places API key used by the autocomplete location inputs
  const API_KEY = "AIzaSyBf_wr99NS_hcYHspoUxdKuv-NdRXzDgQs";

  // Stores the editable journey values, including both display text and coordinates
  const [form, setForm] = useState({
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

  // Validate the edited journey values, format them for storage,
  // and update the existing database record
  const saveChanges = async () => {

    try {

      // Ensure all fields have been completed
      if(!form.origin || !form.destination || !form.departingAt || !form.mustArriveAt || !form.date) {

        throw new Error('All fields are required');
          
      // Ensure the edited locations were selected from autocomplete suggestions  
      } else if(form.originLatitude === null || form.originLongitude === null || form.destinationLatitude === null || form.destinationLongitude === null) {

        throw new Error("Please select both an origin and a destination from the suggestions list.")

      // Ensure departing at time is before must arrive at time  
      } else if(form.mustArriveAt < form.departingAt) {

        throw new Error("Departure Time must be before Must Arrive At time.")

      }

      // Format Date objects into DB string format
      const formattedDate = form.date.toLocaleDateString("en-GB");
      const formattedDepartingAt = form.departingAt.toTimeString().slice(0, 5);
      const formattedMustArriveAt = form.mustArriveAt.toTimeString().slice(0, 5);

      // Update the existing journey record with the edited values
      await updateJourney(db, Number(journeyID), {
        origin: form.origin,
        originLatitude: form.originLatitude,
        originLongitude: form.originLongitude,
        destination: form.destination,
        destinationLatitude: form.destinationLatitude,
        destinationLongitude: form.destinationLongitude,
        departingAt: formattedDepartingAt,
        mustArriveAt: formattedMustArriveAt,
        date: formattedDate,
      });

      Alert.alert("Success", "Changes Saved!");

      // Return the user to their journey list after saving
      router.replace("/(tabs)/myJourneys");

    } catch (error: unknown) {

      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while updating the journey.";

      Alert.alert("Error", message);
    }
  };

  // Delete the current journey after user confirmation
  const deleteJourney = () => {

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this journey?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            await deleteJourneyById(db, Number(journeyID));
            Alert.alert("Success", "Journey deleted");
            router.replace("/(tabs)/myJourneys");
          },
        },
      ],
      { cancelable: true }
    );
    
  };

  // Load the current journey details when the screen opens
  useEffect(() => {

    if (!journeyID) return;

    const loadJourney = async () => {

      try {

          const result = await getJourneyById(db, Number(journeyID));

          if (result) {

            // Parse stored HH:mm time strings into hour/minute values
            const [depHour, depMin] = result.departingAt.split(":").map(Number);
            const [arrHour, arrMin] = result.mustArriveAt.split(":").map(Number);

            // Parse the stored dd/mm/yyyy string into a JavaScript Date
            const [day, month, year] = result.date.split("/").map(Number);
            const dateObj = new Date(year, month - 1, day);

            // Rebuild full Date objects so the picker controls can display and edit them
            const departingDate = new Date(dateObj);
            departingDate.setHours(depHour, depMin, 0, 0);
            const arrivingDate = new Date(dateObj);
            arrivingDate.setHours(arrHour, arrMin, 0, 0);

            // Populate the form with the existing journey values
            setForm({
              origin: result.origin ?? '',
              originLatitude: result.originLatitude ?? null,
              originLongitude: result.originLongitude ?? null,
              destination: result.destination ?? '',
              destinationLatitude: result.destinationLatitude ?? null,
              destinationLongitude: result.destinationLongitude ?? null,
              departingAt: departingDate,
              mustArriveAt: arrivingDate,
              date: dateObj,
            });
          }

      } catch (error) {

          console.error("Failed to load journey", error);

      }
    };
  
    loadJourney();

  }, [journeyID]);

  return (
  
    // Dismiss the keyboard and close autocomplete focus when the user taps outside the form
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
                    placeholder="E.g. Eglinton"
                    fetchDetails={true}
                    debounce={300}
                    minLength={2}
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
                      key: API_KEY,
                      language: "en",
                    }}
                    textInputProps={{
                      value: form.origin,
                      onFocus: () => setActiveAutocomplete("origin"),
                      onBlur: () => setActiveAutocomplete(null),
                      onChangeText: (text) =>
                        setForm({
                          ...form,
                          origin: text,
                          originLatitude: null,
                          originLongitude: null,
                        }),
                    }}
                    styles={{
                      container: { flex: 0 },
                      textInput: styles.input,
                      listView: {
                        position: "absolute",
                        top: 45,           
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
                  placeholder="E.g. Magee"
                  fetchDetails={true}
                  debounce={300}
                  minLength={2}
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
                    key: API_KEY,
                    language: "en",
                  }}
                  textInputProps={{
                    value: form.destination,
                    onFocus: () => setActiveAutocomplete("destination"),
                    onBlur: () => setActiveAutocomplete(null),
                    onChangeText: (text) =>
                        setForm({
                          ...form,
                          destination: text,
                          destinationLatitude: null,
                          destinationLongitude: null,
                        }),
                  }}
                  styles={{
                    container: { flex: 0 },
                    textInput: styles.input,
                    listView: {
                      position: "absolute",
                      top: 45,           
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
                <Pressable
                  style={[styles.input, { justifyContent: "center", height: 44 }]}
                  onPress={() => setShowDepartingPicker(true)}
                >
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
                <Pressable
                  style={[styles.input, { justifyContent: "center", height: 44 }]}
                  onPress={() => setShowArrivingPicker(true)}
                >
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
                <Pressable
                  style={[styles.input, { justifyContent: "center", height: 44 }]}
                  onPress={() => setShowDatePicker(true)}
                >
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
            style={({ pressed }) => [styles.saveChangesButton, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}
    
            onPress={saveChanges}
    
            >  
            {({ pressed }) => (
            <Text style={[styles.buttonText, pressed && { color: "white" }]}>Save Changes</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && { backgroundColor: "rgb(237, 14, 14)"}]}
    
            onPress={deleteJourney}
    
            >  
            {({ pressed }) => (
            <Text style={[styles.deleteButtonText, pressed && { color: "white" }]}>Delete This Journey</Text>
            )}
          </Pressable>
            
        </View>

      </Pressable>
  )
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

  buttonText: {
    color: "rgba(11, 161, 226, 1)",
  },

  deleteButtonText: {
    color: "rgb(0, 0, 0)",
  },

  saveChangesButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(11, 161, 226, 0.2)",
    width: 120,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },

  deleteButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(201, 24, 24, 0.55)",
    width: 180,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },

});
