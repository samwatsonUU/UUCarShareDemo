
/*

    Entry point of the application

    If the user has previously logged into the application, redirect to myJourneys.tsx

    Else, redirect to login.tsx

*/

import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";


export default function index() { 

    const {isLoggedIn } = useAuth();

    return isLoggedIn ? <Redirect href="/(tabs)/myJourneys" /> : <Redirect href="/(auth)/login" />

}