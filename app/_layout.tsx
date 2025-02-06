
import React from 'react';
import Welcome from './(tabs)/welcome';
import UserAuth from './(tabs)/user-auth';
import WorkoutContainer from './(tabs)/workout-container';
import PreviousRecords from './(tabs)/previous-records';
import CreateExercise from './(tabs)/create-exercise';
import LogExercise from './(tabs)/log-exercise';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import ExerciseSets from './(tabs)/exercise-sets';

const Stack = createStackNavigator();

export default function TabLayout() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator  initialRouteName="Login">
          <Stack.Screen name="Login" component={UserAuth} />
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="WorkoutContainer" component={WorkoutContainer} />
          <Stack.Screen name="PreviousRecords" component={PreviousRecords} />
          <Stack.Screen name="LogExisting" component={LogExercise} />
          <Stack.Screen name="LogNew" component={CreateExercise} />
          <Stack.Screen name="ExerciseSets" component={ExerciseSets} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
