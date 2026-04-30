
/*

  Layout for all auth-related screens - forgotPassword.tsx, login.tsx and register.tsx

  This layout file defines the navigation structure, theming and header visibility settings for these screens

*/

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AuthLayout() {

  // detect if the device is using light or dark mode
  const colorScheme = useColorScheme();

  return (

    // Apply the correct theme depending on device settings
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

      <Stack
        screenOptions={{
          // Hide headers by default
          headerShown: false,
      }}>

        {/* Enable a header specifically for the forgotPassword.tsx screen */}
        <Stack.Screen name="forgotPassword" options={{ headerShown: true, title: 'Forgot Password' }} />

      </Stack>

      {/* Appearance style of the phone's status bar */}
      <StatusBar style="auto" />

    </ThemeProvider>
  );
}
