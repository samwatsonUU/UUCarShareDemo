import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

type User = {
  userID: number,
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  gender: string,
  role: string,
  bio: string,
  canDrive: number,
  prefersSameGender: number,
  smokingAllowed: number
}

export default function Profile() {

  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const db = useSQLiteContext();
  const { user, logout } = useAuth();

  useEffect(() => {
    if(user?.userID) {
      loadUser();
    }
  }, [user]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const results = await db.getAllAsync<User>(
        "SELECT * FROM Users WHERE userID = ?", [user!.userID]
      );
      if(results.length > 0) setUserData(results[0]);
    } catch (error) {
      console.error("Database error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    logout();
    router.replace('/(auth)/login');
  }

  if (!userData) {
    return <Text style={{ marginTop: 20 }}>Loading profile...</Text>
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.form}>

        {/** Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userData.email}</Text>
        </View>

        {/** Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <Text style={styles.value}>{userData.password}</Text>
        </View>

        {/** First Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <Text style={styles.value}>{userData.firstName}</Text>
        </View>

        {/** Last Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <Text style={styles.value}>{userData.lastName}</Text>
        </View>

        {/** Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>{userData.gender}</Text>
        </View>

        {/** Role */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{userData.role}</Text>
        </View>

        {/** Bio */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <Text style={[styles.value, { flex: 1, flexWrap: 'wrap' }]}>{userData.bio}</Text>
        </View>

        {/** Can Drive */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Can Drive</Text>
          <Switch value={userData.canDrive === 1} disabled />
        </View>

        {/** Same Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Same Gender</Text>
          <Switch value={userData.prefersSameGender === 1} disabled />
        </View>

        {/** Smoking Allowed */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Smoking</Text>
          <Switch value={userData.smokingAllowed === 1} disabled />
        </View>

      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { backgroundColor: "rgba(11, 161, 226, 1)" }
        ]}
        onPress={() => router.push('/editProfile')}
      >
        {({ pressed }) => (
          <Text style={[styles.buttonText, pressed && { color: "white" }]}>
            Edit Profile
          </Text>
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && { backgroundColor: "rgba(11, 161, 226, 1)" }
        ]}
        onPress={logoutUser}
      >
        {({ pressed }) => (
          <Text style={[styles.buttonText, pressed && { color: "white" }]}>
            Logout
          </Text>
        )}
      </Pressable>

    </ScrollView>
  )
}

const styles = StyleSheet.create({

  container: {
    alignItems: "center",
    paddingBottom: 40,
  },

  form: {
    borderRadius: 10,
    width: 320,
    marginTop: 20,
    padding: 10,
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

  value: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },

  button: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(11, 161, 226, 0.2)",
    width: 100,
    borderRadius: 5,
    padding: 10,
    marginTop: 20,
  },

  logoutButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(124, 124, 124, 0.2)",
    width: 100,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },

  buttonText: {
    color: "rgba(11, 161, 226, 1)",
  },

});
