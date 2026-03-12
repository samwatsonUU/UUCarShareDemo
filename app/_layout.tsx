
/*

  Root layout for the whole app

  Performs global setup the rest of the app depends on to run:

  - initialises SQLite database
  - creates DB tables
  - provides authentication state
  - defines the root stack navigator
  - keeps splash screen visible until initialisation is complete

*/

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SQLiteProvider } from "expo-sqlite";
import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SplashScreen } from 'expo-router';

// Prevent the splash screen from hiding automatically so the app
// only becomes visible after database initialization is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  // Detect the current device theme so the correct navigation theme can be applied
  const colorScheme = useColorScheme();

  return (

    // Provide a shared SQLite database connection to the entire app
    <SQLiteProvider
      databaseName="userDatabase.db"
      onInit={async (db) => {
        
        // Create all required database tables when the app starts
        // if they do not already exist
        await db.execAsync(`

          CREATE TABLE IF NOT EXISTS users (
            userID INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            gender TEXT NOT NULL,
            role TEXT NOT NULL,
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
            journeyType TEXT NOT NULL
            
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
            rating INTEGER NOT NULL
          );

        `);

        // Enable Write-Ahead Logging to improve SQLite reliability and concurrency
        await db.execAsync(`PRAGMA journal_mode=WAL;`)

        // Hide the splash screen once database setup has completed
        await SplashScreen.hideAsync();

      }}
      options={{useNewConnection: false}}
      >

      {/* Provide authentication state and login/logout functions to all screens */}
      <AuthProvider>

        {/* Apply the correct navigation theme based on the device color scheme */}
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

          {/* Root stack navigator for all top-level routes in the app */}
          <Stack>

            {/* Entry route that decides whether the user goes to auth or the main app */}
            <Stack.Screen name="index" options={{ headerShown: false }} />

            {/* Grouped layouts for the main authenticated tabs and auth flow */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />

            {/* Standalone screens outside the tab bar, opened as needed from other screens */}
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="editJourney" options={{ headerShown: true, title: 'Edit Journey' }} />
            <Stack.Screen name="editProfile" options={{ headerShown: true, title: 'Edit Profile' }} />
            <Stack.Screen name="findMatches" options={{ headerShown: true, title: 'Matches'  }} />
            <Stack.Screen name="sendRequest" options={{ headerShown: true, title: 'Send a Request'  }} />
            <Stack.Screen name="requestResponse" options={{ headerShown: true, title: 'Respond to a Request'  }} />
            <Stack.Screen name="review" options={{ headerShown: true, title: 'Leave a Review'  }} />
            <Stack.Screen name="passengers" options={{ headerShown: true, title: 'Passengers'  }} />

          </Stack>

          {/* Controls the appearance of the device status bar */}
          <StatusBar style="auto" />

        </ThemeProvider>
      </AuthProvider>  
    </SQLiteProvider>
  );
}
