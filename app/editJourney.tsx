import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useAuth } from "@/context/AuthContext";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { Switch } from 'react-native';
import type { AuthUser } from "@/context/AuthContext";
import { useLocalSearchParams } from "expo-router";


export default function editJourney() {

    const { journeyID } = useLocalSearchParams<{ journeyID: string }>();

    const db = useSQLiteContext();

    const[form, setForm] = useState({

        journeyID: '',
        userID: '',
        origin: '',
        destination: '',
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

            }

            await db.runAsync (

            'UPDATE journeys SET origin = ?, destination = ?, departingAt = ?, mustArriveAt = ?, date = ?, status = ? WHERE journeyID = ?', [form.origin, form.destination, form.departingAt, form.mustArriveAt, form.date, form.status, journeyID]

            )

            Alert.alert("Alert", "Changes Saved!")
            router.replace('/(tabs)/myJourneys')

        } catch (error: unknown) {

            console.error(error);

            const message = error instanceof Error ? error.message: 'An error occurred while updating the journey.';

            Alert.alert('Error', message);

        }

    }

    const deleteJourney = async () => {

        await db.runAsync (

        'DELETE FROM journeys WHERE journeyID = ?', [journeyID]

        )

        Alert.alert("Alert", "Journey Deleted!")
        router.replace('/(tabs)/myJourneys')

    }

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
                        destination: result.destination ?? '',
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
    
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

            <Text style={styles.title}>Edit a Journey</Text>

            <View style={styles.form}>
                   
                <View style={styles.inputGroup}>

                    <Text style={styles.label}>Origin</Text>

                    <TextInput
                    style={styles.input}
                    value={form.origin}
                    onChangeText={(text) => setForm({ ...form, origin: text })}
                    />
            
                </View>

                <View style={styles.inputGroup}>

                    <Text style={styles.label}>Destination</Text>

                    <TextInput
                    style={styles.input}
                    value={form.destination}
                    onChangeText={(text) => setForm({ ...form, destination: text })}
                    />
            
                </View>

                <View style={styles.inputGroup}>

                    <Text style={styles.label}>Departing At</Text>

                    <TextInput
                    style={styles.input}
                    value={form.departingAt}
                    onChangeText={(text) => setForm({ ...form, departingAt: text })}
                    />
            
                </View>

                <View style={styles.inputGroup}>

                    <Text style={styles.label}>Must Arrive At</Text>

                    <TextInput
                    style={styles.input}
                    value={form.mustArriveAt}
                    onChangeText={(text) => setForm({ ...form, mustArriveAt: text })}
                    />

                </View>

                <View style={styles.inputGroup}>

                    <Text style={styles.label}>Date</Text>

                    <TextInput
                    style={styles.input}
                    value={form.date}
                    onChangeText={(text) => setForm({ ...form, date: text })}
                    />

                </View>

                <View style={styles.inputGroup}>

                    <Text style={styles.label}>Status</Text>

                    <TextInput
                    style={styles.input}
                    value={form.status}
                    onChangeText={(text) => setForm({ ...form, status: text })}
                    />

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

            <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { backgroundColor: "rgba(98, 98, 98, 1)"}]}
            onPress={() => router.replace('/(tabs)/myJourneys')}
            >  
            {({ pressed }) => (
            <Text style={[styles.buttonText, pressed && { color: "white" }]}>Back to My Journeys</Text>
            )}
            
            </Pressable>

        </ScrollView>

    )

}

const styles = StyleSheet.create({

    container: {
    flex: 1,
    marginTop: 40,
    },

    contentContainer: {
    alignItems: "center",
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
    flexGrow: 1,

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

  switchRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginVertical: 10,
},

  inputGroup: {

    padding: 15,
  
  },

  label: {

    fontWeight: "bold",
    paddingBottom: 10

  },


})