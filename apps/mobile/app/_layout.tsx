import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const client = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ApolloProvider client={client}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#0c0e17' },
            headerTintColor: '#f8fafc',
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: '#090a0f' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ApolloProvider>
    </SafeAreaProvider>
  );
}
