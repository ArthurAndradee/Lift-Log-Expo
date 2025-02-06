
import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import CreateExercise from './create-exercise';
import LogExercise from './log-exercise';
import PreviousRecords from './previous-records';
import UserAuth from './user-auth';
import Welcome from './welcome';
import WorkoutContainer from './workout-container';

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
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
