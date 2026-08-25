import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { getDiseaseDetails } from '../utils/database';

export default function DiseaseDetailsScreen() {
  const { diseaseName } = useLocalSearchParams();
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      const data = await getDiseaseDetails(diseaseName);
      setDisease(data);
      setLoading(false);
    };
    fetchDetails();
  }, [diseaseName]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  if (!disease) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>No details available for this disease.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.name}>{disease.name}</Text>
      <Text style={styles.label}>Description:</Text>
      <Text style={styles.text}>{disease.description}</Text>
      <Text style={styles.label}>Symptoms:</Text>
      <Text style={styles.text}>{disease.symptoms}</Text>
      <Text style={styles.label}>Treatment:</Text>
      <Text style={styles.text}>{disease.treatment}</Text>
      <Text style={styles.label}>Urgency:</Text>
      <Text style={styles.text}>{disease.urgency}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F7FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#6B4EFF', marginBottom: 20 },
  label: { fontSize: 18, fontWeight: '600', marginTop: 15, color: '#333' },
  text: { fontSize: 16, marginTop: 5, color: '#666', lineHeight: 24 },
  notFound: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 50 },
});