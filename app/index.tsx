import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";


export default function index() { 

    const {isLoggedIn } = useAuth();

    return isLoggedIn ? <Redirect href="/(tabs)/myJourneys" /> : <Redirect href="/(auth)/login" />

}