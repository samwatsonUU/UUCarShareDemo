import { StyleSheet, Text, View, Keyboard, Pressable, TextInput, Alert } from 'react-native';
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

export default function editJourney() {

  const { journeyID } = useLocalSearchParams<{ journeyID: string }>();

  const [activeAutocomplete, setActiveAutocomplete] = useState<"origin" | "destination" | null>(null);

  const db = useSQLiteContext();

  const [showDepartingPicker, setShowDepartingPicker] = useState(false);
  const [showArrivingPicker, setShowArrivingPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);


  const[form, setForm] = useState({

    journeyID: '',
    userID: '',

    origin: '',
    originLatitude: null as number | null,
    originLongitude: null as number | null,

    destination: '',
    destinationLatitude: null as number | null,
    destinationLongitude: null as number | null,

    departingAt: null as Date | null,
    mustArriveAt: null as Date | null,
    date: null as Date | null,
    status: ''

  })

  const saveChanges = async () => {
    try {

      // Basic required field check
      if (
        !form.origin ||
        !form.destination ||
        !form.departingAt ||
        !form.mustArriveAt ||
        !form.date ||
        !form.status
      ) {
        throw new Error("No fields can be empty.");
      }

      if (
        form.originLatitude === null ||
        form.originLongitude === null ||
        form.destinationLatitude === null ||
        form.destinationLongitude === null
      ) {
        throw new Error("Please select both an origin and a destination from the suggestions list.");
      }

      // Format Date objects into DB string format
      const formattedDate = form.date.toLocaleDateString("en-GB");
      const formattedDepartingAt = form.departingAt.toTimeString().slice(0, 5);
      const formattedMustArriveAt = form.mustArriveAt.toTimeString().slice(0, 5);

      await db.runAsync(
        `UPDATE journeys 
        SET origin = ?, 
            originLatitude = ?, 
            originLongitude = ?, 
            destination = ?, 
            destinationLatitude = ?, 
            destinationLongitude = ?, 
            departingAt = ?, 
            mustArriveAt = ?, 
            date = ?, 
            status = ?
        WHERE journeyID = ?`,
        [
          form.origin,
          form.originLatitude,
          form.originLongitude,
          form.destination,
          form.destinationLatitude,
          form.destinationLongitude,
          formattedDepartingAt,
          formattedMustArriveAt,
          formattedDate,
          form.status,
          journeyID
        ]
      );

      Alert.alert("Success", "Changes Saved!");
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
              await db.runAsync(
                "DELETE FROM journeys WHERE journeyID = ?",
                [journeyID]
              );

              Alert.alert("Success", "Journey deleted");
              router.replace("/(tabs)/myJourneys");
            },
          },
        ],
        { cancelable: true }
      );
      
    };

    useEffect(() => {

        if (!journeyID) return;

        const loadJourney = async () => {

            try {

                const result = await db.getFirstAsync<any> (

                    "SELECT * FROM journeys WHERE journeyID = ?", [journeyID]

                );

                if (result) {

                  const [depHour, depMin] = result.departingAt.split(":").map(Number);
                  const [arrHour, arrMin] = result.mustArriveAt.split(":").map(Number);

                  const [day, month, year] = result.date.split("/").map(Number);

                  const dateObj = new Date(year, month - 1, day);

                  const departingDate = new Date(dateObj);
                  departingDate.setHours(depHour, depMin, 0, 0);

                  const arrivingDate = new Date(dateObj);
                  arrivingDate.setHours(arrHour, arrMin, 0, 0);

                  setForm({
                    journeyID: result.journeyID.toString(),
                    userID: result.userID ?? '',

                    origin: result.origin ?? '',
                    originLatitude: result.originLatitude ?? null,
                    originLongitude: result.originLongitude ?? null,

                    destination: result.destination ?? '',
                    destinationLatitude: result.destinationLatitude ?? null,
                    destinationLongitude: result.destinationLongitude ?? null,

                    departingAt: departingDate,
                    mustArriveAt: arrivingDate,
                    date: dateObj,

                    status: result.status ?? ''
                  });
                }

            } catch (error) {

                console.error("Failed to load journey", error);

            }
        };
    
    loadJourney();
    }, [journeyID]);

    return (
    
      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
        Keyboard.dismiss();
        setActiveAutocomplete(null);
        }}
      >
          <View style={styles.container}>

            <Text style={styles.title}>Edit a Journey</Text>

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



              <View style={styles.inputGroup}>

                  <Text style={styles.label}>Status</Text>

                  <View style={styles.inputWrapper}>

                  <TextInput
                  style={styles.input}
                  value={form.status}
                  onChangeText={(text) => setForm({ ...form, status: text })}
                  />

                  </View>

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
