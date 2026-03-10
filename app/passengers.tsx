import { StyleSheet, Text, View, Pressable, FlatList, Alert } from 'react-native';
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";

type user = {

    userID: number,
    firstName: string,
    lastName: string,

}

type journeyDateTimeInfo = {

  date: string,
  departingAt: string,

}

export default function passengers() {

    const db = useSQLiteContext();
    const [Users, setUsers] = useState<(user)[]>([]); 
    const { journeyID } = useLocalSearchParams<{ journeyID: string }>();
    const { user } = useAuth();

    const loadUsers = async () => {
            
        try {

            const result = await db.getAllAsync<user>("SELECT u.userID, u.firstName, u.lastName FROM requests r JOIN users u ON u.userID = r.requesterID WHERE r.journeyID = ?", [journeyID]);
            setUsers(result);

        } catch (error) {

            console.error("Database error", error);

        } 

    };

    useEffect(() => {

        loadUsers();

    }, []);

      const review = async (journeyID: number, revieweeID: number) => {
    
        const alreadyReviewed = await db.getAllAsync (

            "SELECT * FROM reviews WHERE journeyID = ? AND reviewerID = ?", [journeyID, user!.userID]

        )

        if(alreadyReviewed.length > 0) {

            Alert.alert("Error", "You have already reviewed this passenger for this journey.");
            return;

        }

        const result = await db.getFirstAsync<journeyDateTimeInfo>(
          "SELECT date, departingAt FROM journeys WHERE journeyID = ?",
          [journeyID]
        );
    
        if (!result) return;
    
        const now = new Date();
        const today = now.toLocaleDateString("en-CA");
    
        // convert DB date DD/MM/YYYY -> YYYY-MM-DD
        const [day, month, year] = result.date.split("/");
        const dbDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    
        // convert times to minutes
        const [journeyHour, journeyMinute] = result.departingAt.split(":").map(Number);
        const journeyMinutes = journeyHour * 60 + journeyMinute;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
        console.log("DB date:", dbDate);
        console.log("Today:", today);
        console.log("Journey minutes:", journeyMinutes);
        console.log("Current minutes:", currentMinutes);
    
        if (dbDate > today || (dbDate === today && journeyMinutes > currentMinutes)) {
          Alert.alert("Error", "Cannot review a journey that hasn't occurred yet.");
          return;
        }
    
        router.push({
          pathname: "/review",
          params: {
            journeyID: journeyID.toString(),
            revieweeID: revieweeID.toString(),
          },
        });
    
      };

    return (

        <View style={styles.container}>

            <FlatList
                style={styles.list}
                data={Users}
                keyExtractor={(item) => item.userID.toString()}
                renderItem={({ item }) => {

                    return (

                        <View>
                            <View style={styles.passengerContainer}>

                                <Text style={styles.nameLabel}>{item.firstName} {item.lastName}</Text>
                                <Pressable 
                                
                                style={({ pressed }) => [
                                styles.reviewButton,
                                pressed && { backgroundColor: "rgba(11, 161, 226, 1)" }
                                ]}
                                
                                onPress={() => review(Number(journeyID), item.userID)}
                                
                                
                                ><Text>Review Passenger</Text></Pressable>

                            </View>
                        </View>
                    )
                }}
                ListEmptyComponent={<Text>Nothing here for now!</Text>}
            >
            </FlatList>
        </View>
    )
}

const styles = StyleSheet.create({


    container: {

        flex: 1,
        alignItems: "center",

    },

    list: {

        width: 320,
        marginTop: 20,

    },

    passengerContainer: {

        marginBottom: 20,
        padding: 20,
        backgroundColor: "rgb(255, 255, 255)",
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"

    },

    reviewButton: {

        backgroundColor: "rgba(11, 161, 226, 0.2)",
        borderRadius: 5,
        padding: 10,

    },

    nameLabel: {

        fontSize: 18,
        fontWeight: "800",

    },

})