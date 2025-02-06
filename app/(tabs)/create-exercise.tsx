import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Set } from './interfaces';
import { addSet, logWorkout } from './api-calls';
import { useNavigation } from '@react-navigation/native';

const CreateExercise = () => {
  const [exercise, setExercise] = useState('');
  const [setReps, setSetReps] = useState(0);
  const [setWeight, setSetWeight] = useState(0);
  const [sets, setSets] = useState<Set[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const storedUserId = await AsyncStorage.getItem('userId');
          setUserId(Number(storedUserId));
        } catch (error) {
          console.error('Failed to retrieve user ID:', error);
        }
      }
    };

    fetchUserId();
  }, []);

  const handleAddSet = () => {
    const result = addSet(sets, setWeight, setReps, setSets);
    if (!result.valid) {
      Alert.alert('Erro', result.message);
    }
  };

  const handleLogWorkout = async () => {
    const result = await logWorkout(exercise, sets);
    console.log("Errooooo");

    if (result.logged) {
      setExercise('');
      setSets([]);
      setSetWeight(0);
      setSetReps(0);
      Alert.alert('Sucesso', 'Treino registrado com sucesso!');
      navigation.navigate('Welcome'); 
    } else {
      Alert.alert('Erro', 'Falha ao registrar treino.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Novo Exercício</Text>

      <TextInput
        style={styles.input}
        value={exercise}
        onChangeText={setExercise}
        placeholder="Nome do Exercício"
      />

      <Text style={styles.label}>Peso (kg)</Text>
      <TextInput
        style={styles.input}
        value={setWeight.toString()}
        onChangeText={(text) => setSetWeight(Number(text))}
        keyboardType="numeric"
        placeholder="Peso"
      />

      <Text style={styles.label}>Repetições</Text>
      <TextInput
        style={styles.input}
        value={setReps.toString()}
        onChangeText={(text) => setSetReps(Number(text))}
        keyboardType="numeric"
        placeholder="Reps"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddSet}>
        <Text style={styles.buttonText}>Adicionar Série</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogWorkout}>
        <Text style={styles.buttonText}>Registrar Treino</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Séries Adicionadas:</Text>
      <FlatList
        data={sets}
        keyExtractor={(item) => item.setNumber.toString()}
        renderItem={({ item }) => (
          <View style={styles.setItem}>
            <Text style={styles.setText}>
              <Text style={styles.bold}>Set {item.setNumber}:</Text> {item.weight} kg, {item.reps} reps
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noResults}>Nenhuma série adicionada.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  setItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  setText: {
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  noResults: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default CreateExercise;
