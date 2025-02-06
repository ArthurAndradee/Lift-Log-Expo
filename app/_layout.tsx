
import React from 'react';
import Welcome from './(tabs)/welcome';
import UserAuth from './(tabs)/user-auth';
import WorkoutContainer from './(tabs)/workout-container';
import PreviousRecords from './(tabs)/previous-records';
import CreateExercise from './(tabs)/create-exercise';
import LogExercise from './(tabs)/log-exercise';
import { createStackNavigator } from '@react-navigation/stack';
import ExerciseSets from './(tabs)/exercise-sets';

const Stack = createStackNavigator();

export default function TabLayout() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={UserAuth}
        options={{
          headerShown: false 
        }}/>              
      <Stack.Screen name="Welcome" component={Welcome}
        options={{
          headerShown: false 
        }}/>    
      <Stack.Screen name="WorkoutContainer" component={WorkoutContainer}
        options={{
          headerTitle:""
        }}/>          
      <Stack.Screen name="PreviousRecords" component={PreviousRecords}
        options={{
          headerTitle:""
        }}/>          
      <Stack.Screen name="LogExisting" component={LogExercise}
        options={{
          headerTitle:""
        }}/>
      <Stack.Screen name="LogNew" component={CreateExercise}
        options={{
          headerTitle:""
        }}/>
      <Stack.Screen name="ExerciseSets" component={ExerciseSets} 
        options={{
          headerTitle:""
        }}/>
    </Stack.Navigator>
  );
}
