
/*

    Entry point of the application

    If the user has previously logged into the application, redirect to myJourneys.tsx

    Else, redirect to login.tsx

*/

import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";


export default function Index() { 

    // Read the current auth state from authContext
    const {isLoggedIn } = useAuth();

    // Send the user to the appropriate screen
    // If isLoggedIn is true, go to myJourneys, else go to login
    return isLoggedIn 
        ? <Redirect href="/(tabs)/myJourneys" />
        : <Redirect href="/(auth)/login" />

}