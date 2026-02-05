import { StyleSheet, View, Text, ActivityIndicator, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function sendRequest() {

  const { journeyID } = useLocalSearchParams<{ journeyID: string }>();

    return (

        <View>
            <Text>Hello there...</Text>
            <Text>General Kenobi...</Text>
            <Text>{journeyID}</Text>
        </View>

    )

}