import { Platform, StyleSheet, View, Text, Pressable, TextInput } from 'react-native';

export default function AddJopurney() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Add a Journey</Text>

      <View style={styles.form}>

        <View style={styles.inputGroup}><Text style={styles.label}>Origin:</Text><TextInput placeholder='e.g. Eglinton' style={styles.input}></TextInput></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Destination:</Text><TextInput placeholder='e.g. Magee' style={styles.input}></TextInput></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Departing At:</Text><TextInput placeholder='e.g. 08:00' style={styles.input}></TextInput></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Must Arrive At:</Text><TextInput placeholder='e.g. 09:00' style={styles.input}></TextInput></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Date:</Text><TextInput placeholder='e.g. 09/12/2025' style={styles.input}></TextInput></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Smoking Allowed?</Text><TextInput placeholder='e.g. Yes/No' style={styles.input}></TextInput></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Preferred Gender:</Text><TextInput placeholder='e.g. Male/Female' style={styles.input}></TextInput></View>

      </View>

      <Pressable style={({ pressed }) => [styles.button, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}>
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

    marginTop: 40,
    backgroundColor: "white",
    borderRadius: 10,
    width: 340

  },

  inputGroup: {

    padding: 10,
    flexDirection: "row",
    alignItems: "center",

  },

  label: {

    fontWeight: "bold",
    flexBasis: 140,
    paddingRight: 10,

  },

  input: {

    color: "gray",
    borderWidth: 1,
    padding: 5,
    flex: 1,
    borderRadius: 5

  },

  button: {

    marginTop: 40,
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