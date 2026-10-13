import React from 'react';
import { Tabs } from 'expo-router';
import { Sparkles, Layers, Sliders } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0c0e17',
          borderTopColor: '#262a3f',
        },
        tabBarActiveTintColor: '#818cf8',
        tabBarInactiveTintColor: '#64748b',
        headerStyle: {
          backgroundColor: '#0c0e17',
        },
        headerTintColor: '#f8fafc',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Studio',
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Queue & Fleet',
          tabBarIcon: ({ color, size }) => <Layers color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
