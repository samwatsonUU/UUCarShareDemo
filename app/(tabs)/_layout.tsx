
/*

  Layout config for the main "home" area of the app

  This consists of links to four screens, myJourneys.tsx (the default screen when a user logs in),
  addJourney.tsx, inbox.tsx and profile.tsx

  Having all four of these easily accessible via the bottom navigation tab allows
  the user to move quickly between the main areas of the app

*/

import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {

  // Detect the current theme of the device and apply the correct colour scheme
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // Colour of the currently selected (highlighted) tab
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Show the header tabs for each screen by default
        headerShown: true,
        
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="myJourneys"
        options={{
          title: 'Journeys',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="addJourney"
        options={{
          title: 'Add A Journey',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.square.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
