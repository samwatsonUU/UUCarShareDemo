import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { RefreshControl } from "react-native";
import { useEffect, useState } from "react";


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

  const [User, setUser] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const db = useSQLiteContext();
  const { user, logout } = useAuth();
  
  useEffect(() => {
    if (user?.userID) {
      loadUsers();
    }
  }, [user]);


  const loadUsers = async () => {
  
      try {
  
          setIsLoading(true);
  
          const results = await db.getAllAsync<User>(
            "SELECT * FROM Users WHERE userID = ?", [user!.userID]
          );
  
          setUser(results)
  
      } catch (error) {
  
          console.error("Database error", error);
  
      } finally {
  
          setIsLoading(false);
  
      }
  
  };

  const logoutUser = () => {

    logout();
    router.replace('/(auth)/login')

  }
  
  
  return (

    <View style={styles.container}>

      <FlatList
      style={styles.list}
      data={User}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadUsers} tintColor="#007AFF" />}
      keyExtractor={(item) => item.userID.toString()}
      renderItem={({ item }) => (
        <View style={styles.journeyContainer}>
          <Text>Email: {item.email}</Text>
          <Text>First Name: {item.firstName}</Text>
          <Text>Last Name: {item.lastName}</Text>
          <Text>Password: {item.password}</Text>
          <Text>Gender: {item.gender}</Text>
          <Text>Role: {item.role}</Text>
          <Text>Bio: {item.bio}</Text>
          <Text>Can Drive: {item.canDrive}</Text>
          <Text>Prefers Same Gender: {item.prefersSameGender}</Text>
          <Text>Smoking Allowed: {item.smokingAllowed}</Text>
        </View>
        )}
      ListEmptyComponent={<Text>You haven't added any journeys - go to the "Add A Journey" screen to do so.</Text>}
      />

      <Pressable style={({ pressed }) => [styles.button, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}
        onPress={ () => router.push('/editProfile')}>
        {({ pressed }) => (
          <Text style={[styles.buttonText, pressed && { color: "white" }]}>Edit Profile</Text>
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.logoutButton, pressed && { backgroundColor: "rgba(11, 161, 226, 1)"}]}
        onPress={logoutUser}  
      >
        {({ pressed }) => (
          <Text style={[styles.buttonText, pressed && { color: "white" }]}>Logout</Text>
        )}
        
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {

    alignItems: "center",

  },

  title: {

    fontSize: 48,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderColor: "rgba(11, 161, 226, 1)",

  },

  profileInfo: {

    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 10,
    width: 340

  },

  infoGroup: {

    padding: 10,
    flexDirection: "row",
    alignItems: "center",

  },

  label: {

    fontWeight: "bold",
    flexBasis: 150,
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

    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(11, 161, 226, 0.2)",
    width: 100,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,

  },

  buttonText: {

    color: "rgba(11, 161, 226, 1)",

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

    list: {

    width: 320,
    marginTop: 20,

  },

  journeyContainer: {

    marginBottom: 20,
    padding: 20,
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: 15,

  },
   
})