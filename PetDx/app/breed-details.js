import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { getBreedDetails } from '../utils/database';

export default function BreedDetailsScreen() {
  const { breedName } = useLocalSearchParams();
  const [breed, setBreed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      const data = await getBreedDetails(breedName);
      setBreed(data);
      setLoading(false);
    };
    fetchDetails();
  }, [breedName]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  if (!breed) {
    return (
      <View style={styles.container}>
        <Text>No details available for this breed.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.name}>{breed.name}</Text>
      <Text style={styles.label}>Description:</Text>
      <Text style={styles.text}>{breed.description}</Text>
      <Text style={styles.label}>Temperament:</Text>
      <Text style={styles.text}>{breed.temperament}</Text>
      <Text style={styles.label}>Size:</Text>
      <Text style={styles.text}>{breed.size}</Text>
      <Text style={styles.label}>Life Expectancy:</Text>
      <Text style={styles.text}>{breed.lifeExpectancy}</Text>
      <Text style={styles.label}>Care Tips:</Text>
      <Text style={styles.text}>{breed.careTips}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F7FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#6B4EFF', marginBottom: 20 },
  label: { fontSize: 18, fontWeight: '600', marginTop: 15, color: '#333' },
  text: { fontSize: 16, marginTop: 5, color: '#666', lineHeight: 24 },
});