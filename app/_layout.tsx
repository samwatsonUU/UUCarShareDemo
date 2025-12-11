import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SQLiteProvider } from "expo-sqlite";

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

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
            Bio TEXT,
            CanDrive BOOL NOT NULL,
            PrefersSameGender BOOL NOT NULL,
            SmokingAllowed BOOL NOT NULL
          );

            CREATE TABLE IF NOT EXISTS journeys (
            journeyID INTEGER PRIMARY KEY AUTOINCREMENT,
            userID INTEGER NOT NULL,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            departingAt TEXT NOT NULL,
            mustArriveAt TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL
            
          );

        `);

        await db.execAsync(`PRAGMA journal_mode=WAL;`)

        }}
        options={{useNewConnection: false}}
      >

      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>

    </SQLiteProvider>

  );
}
