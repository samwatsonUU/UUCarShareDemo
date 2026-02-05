import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SQLiteProvider } from "expo-sqlite";
import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();


/*

export const unstable_settings = {
  anchor: '(tabs)',
};

*/

export default function RootLayout() {
  const colorScheme = useColorScheme();




  return (

    <SQLiteProvider
        databaseName="userDatabase.db"
        onInit={async (db) => {
          await db.execAsync(`

            CREATE TABLE IF NOT EXISTS users (
              userID INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT NOT NULL UNIQUE,
              password TEXT NOT NULL,
              firstName TEXT NOT NULL,
              lastName TEXT NOT NULL,
              gender TEXT NOT NULL,
              role TEXT NOT NULL,
              bio TEXT,
              canDrive INTEGER NOT NULL,
              prefersSameGender INTEGER NOT NULL,
              smokingAllowed INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS journeys (
              journeyID INTEGER PRIMARY KEY AUTOINCREMENT,
              userID INTEGER NOT NULL,
              origin TEXT NOT NULL,
              originLatitude REAL NOT NULL,
              originLongitude REAL NOT NULL,
              destination TEXT NOT NULL,
              destinationLatitude REAL NOT NULL,
              destinationLongitude REAL NOT NULL,
              departingAt TEXT NOT NULL,
              mustArriveAt TEXT NOT NULL,
              date TEXT NOT NULL,
              status TEXT NOT NULL
              
            );

            CREATE TABLE IF NOT EXISTS vehicles (
              vehicleID INTEGER PRIMARY KEY AUTOINCREMENT,
              userID INTEGER NOT NULL,
              make TEXT NOT NULL,
              model TEXT NOT NULL,
              registration TEXT NOT NULL,
              colour TEXT NOT NULL,
              seats INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS requests (
              requestID INTEGER PRIMARY KEY AUTOINCREMENT,
              requesterID INTEGER NOT NULL,
              recipientID INTEGER NOT NULL,
              journeyID INTEGER NOT NULL,
              message TEXT NOT NULL,
              status TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS reviews (
              reviewID INTEGER PRIMARY KEY AUTOINCREMENT,
              reviewerID INTEGER NOT NULL,
              revieweeID INTEGER NOT NULL,
              journeyID INTEGER NOT NULL,
              rating INTEGER NOT NULL,
              comment TEXT NOT NULL
            );
          `);

        await db.execAsync(`PRAGMA journal_mode=WAL;`)

        await SplashScreen.hideAsync(); // <-- correct place

        }}
        options={{useNewConnection: false}}
      >

      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          {/* <Stack initialRouteName="index"> */}
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="editProfile" options={{ headerShown: true, title: 'Edit Profile' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="editJourney" options={{ headerShown: true, title: 'Edit Journey' }} />
            <Stack.Screen name="findMatches" options={{ headerShown: true, title: 'Matches'  }} />
            <Stack.Screen name="sendRequest" options={{ headerShown: true, title: 'Send a Request'  }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>  

    </SQLiteProvider>
    

  );
}
