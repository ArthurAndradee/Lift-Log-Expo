import React from 'react';
import { Tabs } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{headerShown: false}}>
      <Tabs.Screen name="workoutContainer" 
        options={{ 
          tabBarLabel: "Treino", 
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="weight-lifter" size={24} color={color} />
        }} />
      <Tabs.Screen name="previousRecords" 
        options={{ 
          tabBarLabel: "Registros",
          tabBarIcon: ({ color }) => <AntDesign name="barschart" size={24} color={color} />,
          }} />
    </Tabs>
  );
}
