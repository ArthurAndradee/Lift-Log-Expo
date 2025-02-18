import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function TabLayout() {
  const [user, setUser] = useState({ username: "" });
  const router = useRouter();
  const [profilePic, setProfilePic] = useState<string | null>(null); // Store image URI

  const fetchUserData = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const profilePicture = await AsyncStorage.getItem('profilePicture');

      if (username) {
        setUser({ username });
        setProfilePic(profilePicture);
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };
  useEffect(() => {

    fetchUserData();
  }, []);

  const logOut = async () => {
    await AsyncStorage.setItem('token', '');
    await AsyncStorage.setItem('userId', '');
    await AsyncStorage.setItem('username', '');
    await AsyncStorage.setItem('profilePicture', '');
    router.replace("/");
  };

  return (
    <Tabs
      screenOptions={{
        header: () => (
          <View style={styles.header}>
            <View style={styles.userInfo}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.profilePic} />
              ) : (
                <View style={styles.profilePicFallback} />
              )}
              <Text style={styles.username}>{user.username}</Text>
            </View>
            <TouchableOpacity onPress={logOut} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="workoutCreator"
        options={{
          tabBarLabel: "Treino",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="weight-lifter" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workoutHistory"
        options={{
          tabBarLabel: "Registros",
          tabBarIcon: ({ color }) => <AntDesign name="barschart" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profilePicFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#7e7e7e",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
