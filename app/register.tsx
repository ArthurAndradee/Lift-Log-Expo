import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import ImageResizer from "react-native-image-resizer";
import { useRouter } from "expo-router";
import axios from "axios";

const MAX_IMAGE_SIZE = 256 * 1024;

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1, // Start with highest quality
    });

    if (!result.canceled) {
      let uri = result.assets[0].uri;
      let fileSize = (await fetch(uri).then((res) => res.blob())).size;

      if (fileSize > MAX_IMAGE_SIZE) {
        console.log("Original image size:", (fileSize / 1024).toFixed(2), "KB");
        try {
          const compressedImage = await ImageResizer.createResizedImage(uri, 600, 600, "JPEG", 70, 0);
          const compressedSize = (await fetch(compressedImage.uri).then((res) => res.blob())).size;

          if (compressedSize > MAX_IMAGE_SIZE) {
            Alert.alert("Image too large", "Please choose a smaller image.");
            return;
          }
          
          console.log("Compressed image size:", (compressedSize / 1024).toFixed(2), "KB");
          setImage(compressedImage.uri);
        } catch (err) {
          console.error("Image compression error:", err);
          Alert.alert("Error", "Failed to compress image.");
        }
      } else {
        setImage(uri);
      }
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !image) {
      Alert.alert("Error", "Please fill in all fields and select an image.");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("profilePicture", {
        uri: image,
        name: "profile.jpg", // Ensure a valid filename is provided
        type: "image/jpeg", // Adjust based on the image format
      });
  

      await axios.post("https://lift-log-backend.onrender.com/api/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      router.push('/');
    } catch (err) {
      console.error("Registration failed:", err);
      Alert.alert("Error", "Registration failed. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crie uma conta</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <Image source={{ uri: image }} style={styles.profileImage} />
        ) : (
          <Text style={styles.imageText}>Escolha uma foto de perfil</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Nome (Será exibido publicamente)"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Senha"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/")} style={styles.loginTextContainer}>
        <Text style={styles.loginText}>Já possui uma conta? Entre aqui</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imageText: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    backgroundColor: "#3b5391",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginTextContainer: {
    marginTop: 10,
  },
  loginText: {
    color: "#3b5391",
    fontSize: 14,
  },
});

export default RegisterScreen;