import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SessionStartScreen from '../screens/SessionStartScreen';
import ShoppingScreen from '../screens/ShoppingScreen';
import BatchOCRTestScreen from '../screens/BatchOCRTestScreen';

export type RootStackParamList = {
  SessionStart: undefined;
  Shopping: { sessionId: string };
  BatchOCRTest: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SessionStart"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#ffffff' },
        }}
      >
        <Stack.Screen name="SessionStart" component={SessionStartScreen} />
        <Stack.Screen name="Shopping" component={ShoppingScreen} />
        <Stack.Screen 
          name="BatchOCRTest" 
          component={BatchOCRTestScreen}
          options={{ 
            headerShown: true,
            title: 'Batch OCR Processing',
            headerStyle: { backgroundColor: '#2196F3' },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
