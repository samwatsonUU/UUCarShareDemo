import { StyleSheet, Text, View, Keyboard, Pressable, TextInput, Alert } from 'react-native';
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function editJourney() {

    const { journeyID } = useLocalSearchParams<{ journeyID: string }>();

    const [activeAutocomplete, setActiveAutocomplete] = useState<"origin" | "destination" | null>(null);

    const db = useSQLiteContext();

    const[form, setForm] = useState({

        journeyID: '',
        userID: '',

        origin: '',
        originLatitude: null as number | null,
        originLongitude: null as number | null,

        destination: '',
        destinationLatitude: null as number | null,
        destinationLongitude: null as number | null,

        departingAt: '',
        mustArriveAt: '',
        date: '',
        status: ''

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

    const saveChanges = async () => {

        try {

            // ensure no inputs are empty
            if(!form.origin || !form.destination || !form.departingAt || !form.mustArriveAt || !form.date || !form.status) {

            throw new Error('No fields can be empty.');

            } else if (!validTime(form.departingAt) || !validTime(form.mustArriveAt)) {

            throw new Error("Check Time Format");

            } else if (!validDate(form.date)) {

            throw new Error("Check Date Format");

            }  else if(form.originLatitude === null || form.originLongitude === null || form.destinationLatitude === null || form.destinationLongitude === null) {

              throw new Error("Please select both an origin and a destination from the suggestions list.")

            }

            console.log('Journey about to be updated:', {
            userID: form.userID,
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

            await db.runAsync (

            'UPDATE journeys SET origin = ?, originLatitude = ?, originLongitude = ?, destination = ?, destinationLatitude = ?, destinationLongitude = ?, departingAt = ?, mustArriveAt = ?, date = ?, status = ? WHERE journeyID = ?', [form.origin, form.originLatitude, form.originLongitude, form.destination, form.destinationLatitude, form.destinationLongitude, form.departingAt, form.mustArriveAt, form.date, form.status, journeyID]

            )

            Alert.alert("Alert", "Changes Saved!")
            router.replace('/(tabs)/myJourneys')

        } catch (error: unknown) {

            console.error(error);

            const message = error instanceof Error ? error.message: 'An error occurred while updating the journey.';

            Alert.alert('Error', message);

        }

    }

    // const deleteJourney = async () => {

    //     await db.runAsync (

    //     'DELETE FROM journeys WHERE journeyID = ?', [journeyID]

    //     )

    //     Alert.alert("Alert", "Journey Deleted!")
    //     router.replace('/(tabs)/myJourneys')

    // }

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

                    setForm({

                        journeyID: result.journeyID.toString(),
                        userID: result.userID ?? '',

                        origin: result.origin ?? '',
                        originLatitude: result.originLatitude ?? 0,
                        originLongitude: result.originLongitude ?? 0,

                        destination: result.destination ?? '',
                        destinationLatitude: result.destinationLatitude ?? 0,
                        destinationLongitude: result.destinationLongitude ?? 0,
                        
                        departingAt: result.departingAt ?? '',
                        mustArriveAt: result.mustArriveAt ?? '',
                        date: result.date ?? '',
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

                  <TextInput
                  style={styles.input}
                  value={form.departingAt}
                  onChangeText={(text) => setForm({ ...form, departingAt: text })}
                  />

                  </View>
          
              </View>

              <View style={styles.inputGroup}>

                  <Text style={styles.label}>Must Arrive At</Text>

                  <View style={styles.inputWrapper}>

                  <TextInput
                  style={styles.input}
                  value={form.mustArriveAt}
                  onChangeText={(text) => setForm({ ...form, mustArriveAt: text })}
                  />

                  </View>

              </View>

              <View style={styles.inputGroup}>

                  <Text style={styles.label}>Date</Text>

                  <View style={styles.inputWrapper}>

                  <TextInput
                  style={styles.input}
                  value={form.date}
                  onChangeText={(text) => setForm({ ...form, date: text })}
                  />

                  </View>

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
    marginTop: 40,

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

    borderWidth: 1,
    borderColor: "gray",
    backgroundColor: "white",
    margin: 5,
 
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

  backButton: {

    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(168, 168, 168, 0.2)",
    width: 180,
    borderRadius: 5,
    padding: 10,
    marginBottom: 50,

  },

})