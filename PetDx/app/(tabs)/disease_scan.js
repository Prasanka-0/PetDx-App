
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 50;
const API_BASE_URL = 'http://10.42.137.91:5000';

export default function DiseaseScanScreen() {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const mountAnim    = useRef(new Animated.Value(0)).current;
  const previewScale = useRef(new Animated.Value(0.95)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountAnim,    { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(previewScale, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }),
      Animated.spring(contentSlide, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: false,
    });
    if (!result.canceled && result.assets[0]) setImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      base64: false,
    });
    if (!result.canceled && result.assets[0]) setImage(result.assets[0].uri);
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      const filename = image.split('/').pop() || 'photo.jpg';
      const fileType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

      formData.append('file', { uri: image, name: filename, type: fileType });

      const response = await fetch(`${API_BASE_URL}/predict-disease`, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();

      router.push({
        pathname: '/result',
        params: {
          imageUri:   result.imageUrl || image,
          label:      result.disease || 'Unknown',
          confidence: String(result.confidence || 0),
          scanType:   'disease',
        },
      });
    } catch (error) {
      Alert.alert('Scan Failed', `Error: ${error.message}\n\nPlease check if the server is running.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    Animated.sequence([
      Animated.timing(previewScale, { toValue: 0.95, duration: 150, useNativeDriver: true }),
      Animated.timing(previewScale, { toValue: 1,    duration: 150, useNativeDriver: true }),
    ]).start();
    setImage(null);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#0A0820', '#150D38', '#0A1628']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.glowOrb, styles.orb1]} />
      <View style={[styles.glowOrb, styles.orb2]} />
      <View style={[styles.glowOrb, styles.orb3]} />

      <Animated.View style={[styles.container, { opacity: mountAnim }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT + 10 }]}>
          <LinearGradient
            colors={['rgba(255,107,78,0.35)', 'rgba(255,107,78,0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <LinearGradient colors={['#FF6B4E', '#FF9F7B']} style={styles.headerIconGradient}>
              <Ionicons name="medical" size={28} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Disease Scan</Text>
              <Text style={styles.headerSubtitle}>Detect skin conditions & diseases</Text>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <BlurView intensity={18} tint="dark" style={styles.warningInner}>
              <LinearGradient
                colors={['rgba(255,184,0,0.15)', 'rgba(255,184,0,0.04)']}
                style={StyleSheet.absoluteFill}
              />
            </BlurView>
          </View>

          {/* Preview */}
          <Animated.View style={[styles.previewWrapper, { transform: [{ scale: previewScale }] }]}>
            <BlurView intensity={22} tint="dark" style={styles.previewCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.02)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.previewBorder} />
              {image ? (
                <Image source={{ uri: image }} style={styles.preview} />
              ) : (
                <View style={styles.placeholder}>
                  <View style={styles.placeholderIcon}>
                    <Ionicons name="medical-outline" size={48} color="rgba(255,159,123,0.45)" />
                  </View>
                  <Text style={styles.placeholderTitle}>No Image Selected</Text>
                  <Text style={styles.placeholderSubtitle}>
                    Take a clear photo of the affected area
                  </Text>
                </View>
              )}
            </BlurView>
          </Animated.View>

          {/* Gallery / Camera buttons */}
          <Animated.View
            style={[styles.buttonRow, { transform: [{ translateY: contentSlide }] }]}
          >
            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={pickImage}
              disabled={isAnalyzing}
              activeOpacity={0.8}
            >
              <BlurView intensity={22} tint="dark" style={styles.button}>
                <LinearGradient
                  colors={['rgba(255,107,78,0.22)', 'rgba(255,107,78,0.06)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.buttonBorder} />
                <Ionicons name="images-outline" size={22} color="#FF9F7B" />
                <Text style={styles.buttonText}>Gallery</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={takePhoto}
              disabled={isAnalyzing}
              activeOpacity={0.8}
            >
              <BlurView intensity={22} tint="dark" style={styles.button}>
                <LinearGradient
                  colors={['rgba(255,107,78,0.22)', 'rgba(255,107,78,0.06)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.buttonBorder} />
                <Ionicons name="camera-outline" size={22} color="#FF9F7B" />
                <Text style={styles.buttonText}>Camera</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* Analyze */}
          {image && (
            <Animated.View
              style={[styles.analyzeSection, { transform: [{ translateY: contentSlide }] }]}
            >
              <TouchableOpacity
                style={styles.analyzeWrapper}
                onPress={analyzeImage}
                disabled={isAnalyzing}
                activeOpacity={0.8}
              >
                <BlurView intensity={28} tint="dark" style={styles.analyzeButton}>
                  <LinearGradient
                    colors={['rgba(255,107,78,0.28)', 'rgba(255,107,78,0.08)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.analyzeBorder} />
                  {isAnalyzing ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#FF9F7B" />
                      <Text style={[styles.analyzeText, styles.loadingText]}>
                        {' '}Uploading & Analyzing...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="scan-outline" size={24} color="#FF9F7B" />
                      <Text style={styles.analyzeText}>Detect Disease</Text>
                    </>
                  )}
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity onPress={clearImage} style={styles.clearButton}>
                <BlurView intensity={16} tint="dark" style={styles.clearButtonInner}>
                  <LinearGradient
                    colors={['rgba(123,95,255,0.18)', 'rgba(123,95,255,0.05)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Ionicons name="close-outline" size={20} color="#A98BFF" />
                  <Text style={styles.clearText}>Clear</Text>
                </BlurView>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:               { flex: 1, backgroundColor: '#0A0820' },
  glowOrb:            { position: 'absolute', borderRadius: 999, opacity: 0.28 },
  orb1:               { width: 320, height: 320, backgroundColor: '#FF6B4E', top: -110, left: -90 },
  orb2:               { width: 250, height: 250, backgroundColor: '#7B5FFF', top: height * 0.5, right: -80 },
  orb3:               { width: 200, height: 200, backgroundColor: '#FFB800', bottom: 100, left: -55 },
  container:          { flex: 1 },
  header:             { paddingHorizontal: 20, paddingBottom: 20, marginBottom: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' },
  backButton:         { position: 'absolute', top: STATUS_BAR_HEIGHT + 15, left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,107,78,0.3)', justifyContent: 'center', alignItems: 'center' },
  headerContent:      { flexDirection: 'row', alignItems: 'center', marginTop: 70, gap: 12 },
  headerIconGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  headerTitle:        { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  headerSubtitle:     { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  scrollContent:      { paddingHorizontal: 20, paddingBottom: 40 },
  warningBanner:      { marginBottom: 16 },
  warningInner:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,184,0,0.25)', gap: 8 },
  warningText:        { flex: 1, fontSize: 12, color: 'rgba(255,184,0,0.85)', lineHeight: 16 },
  previewWrapper:     { marginBottom: 20, elevation: 12 },
  previewCard:        { height: 280, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(10,8,28,0.78)' },
  previewBorder:      { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.16)', zIndex: 2 },
  preview:            { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  placeholderIcon:    { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,107,78,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,159,123,0.3)' },
  placeholderTitle:   { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  placeholderSubtitle:{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', lineHeight: 21 },
  buttonRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  buttonWrapper:      { flex: 1, elevation: 8 },
  button:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(10,8,28,0.70)', gap: 8 },
  buttonBorder:       { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.16)' },
  buttonText:         { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  analyzeSection:     { alignItems: 'center', gap: 12, marginBottom: 20 },
  analyzeWrapper:     { width: '100%', elevation: 12 },
  analyzeButton:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,107,78,0.3)', backgroundColor: 'rgba(10,8,28,0.80)', gap: 10 },
  analyzeBorder:      { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,159,123,0.3)' },
  analyzeText:        { fontSize: 18, fontWeight: '700', color: '#FF9F7B' },
  loadingContainer:   { flexDirection: 'row', alignItems: 'center' },
  loadingText:        { fontSize: 16 },
  clearButton:        { elevation: 6 },
  clearButtonInner:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(123,95,255,0.25)', backgroundColor: 'rgba(10,8,28,0.70)', gap: 6 },
  clearText:          { fontSize: 14, fontWeight: '600', color: '#A98BFF' },
});