import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 50;

export default function ScanMenuScreen() {
  const router = useRouter();
  
  // Animations
  const mountAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(card1Anim, {
        toValue: 1,
        delay: 100,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.spring(card2Anim, {
        toValue: 1,
        delay: 200,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const navigateToBreedScan = () => {
    router.push('/(tabs)/breed_scan');
  };

  const navigateToDiseaseScan = () => {
    router.push('/(tabs)/disease_scan');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Deep Background Gradient */}
      <LinearGradient
        colors={['#0A0820', '#150D38', '#0A1628']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Background Glow Orbs */}
      <View style={[styles.glowOrb, styles.orb1]} />
      <View style={[styles.glowOrb, styles.orb2]} />
      <View style={[styles.glowOrb, styles.orb3]} />

      {/* Main Content */}
      <Animated.View style={[styles.container, { opacity: mountAnim }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT + 20 }]}>
          <LinearGradient
            colors={['rgba(123,95,255,0.35)', 'rgba(123,95,255,0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.headerTitle}>Pet Scanner</Text>
          <Text style={styles.headerSubtitle}>Choose what to analyze</Text>
        </View>

        {/* Scan Options Cards */}
        <View style={styles.cardsContainer}>
          {/* Breed Scan Card */}
          <Animated.View 
            style={[
              styles.cardWrapper,
              { transform: [{ scale: card1Anim }] }
            ]}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={navigateToBreedScan}
              activeOpacity={0.85}
            >
              <BlurView intensity={28} tint="dark" style={styles.cardBlur}>
                <LinearGradient
                  colors={['rgba(123,95,255,0.25)', 'rgba(123,95,255,0.08)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardBorder} />
                
                {/* Card Content */}
                <View style={styles.cardIconContainer}>
                  <LinearGradient
                    colors={['#7B5FFF', '#A98BFF']}
                    style={styles.cardIconGradient}
                  >
                    <Ionicons name="paw-outline" size={42} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                
                <Text style={styles.cardTitle}>Breed Scan</Text>
                <Text style={styles.cardDescription}>
                  Identify your pet's breed from a photo
                </Text>
                
                <View style={styles.cardFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#A98BFF" />
                    <Text style={styles.featureText}>10+ Breeds</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="time" size={16} color="#A98BFF" />
                    <Text style={styles.featureText}>Instant Results</Text>
                  </View>
                </View>
                
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward" size={24} color="#A98BFF" />
                </View>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* Disease Scan Card */}
          <Animated.View 
            style={[
              styles.cardWrapper,
              { transform: [{ scale: card2Anim }] }
            ]}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={navigateToDiseaseScan}
              activeOpacity={0.85}
            >
              <BlurView intensity={28} tint="dark" style={styles.cardBlur}>
                <LinearGradient
                  colors={['rgba(255,107,78,0.25)', 'rgba(255,107,78,0.08)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardBorder} />
                
                {/* Card Content */}
                <View style={styles.cardIconContainer}>
                  <LinearGradient
                    colors={['#FF6B4E', '#FF9F7B']}
                    style={styles.cardIconGradient}
                  >
                    <Ionicons name="medical-outline" size={42} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                
                <Text style={styles.cardTitle}>Disease Scan</Text>
                <Text style={styles.cardDescription}>
                  Detect potential skin conditions and diseases
                </Text>
                
                <View style={styles.cardFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#FF9F7B" />
                    <Text style={styles.featureText}>10+ Conditions</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="alert" size={16} color="#FF9F7B" />
                    <Text style={styles.featureText}>Early Detection</Text>
                  </View>
                </View>
                
                <View style={styles.cardArrow}>
                  <Ionicons name="arrow-forward" size={24} color="#FF9F7B" />
                </View>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <BlurView intensity={18} tint="dark" style={styles.infoContainer}>
            <LinearGradient
              colors={['rgba(123,95,255,0.12)', 'rgba(123,95,255,0.03)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.infoBorder} />
            <Ionicons name="information-circle-outline" size={20} color="#A98BFF" />
            <Text style={styles.infoText}>
              AI-powered analysis • High accuracy • Quick results
            </Text>
          </BlurView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0820',
  },

  // Glow Orbs
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.28,
  },
  orb1: {
    width: 320,
    height: 320,
    backgroundColor: '#7B5FFF',
    top: -110,
    left: -90,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: '#FF6B4E',
    top: height * 0.5,
    right: -80,
  },
  orb3: {
    width: 200,
    height: 200,
    backgroundColor: '#00C2FF',
    bottom: 100,
    left: -55,
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    paddingHorizontal: 22,
    paddingBottom: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(123,95,255,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 6,
    letterSpacing: 0.2,
  },

  // Cards Container
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 20,
  },

  // Card
  cardWrapper: {
    elevation: 12,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardBlur: {
    overflow: 'hidden',
    borderRadius: 28,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 2,
  },
  cardIconContainer: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
  },
  cardIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7B5FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
    marginBottom: 20,
  },
  cardFeatures: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  cardArrow: {
    position: 'absolute',
    bottom: 20,
    right: 24,
  },

  // Info Section
  infoSection: {
    marginBottom: 30,
    marginTop: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(123,95,255,0.22)',
    gap: 8,
  },
  infoBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(169,139,255,0.2)',
  },
  infoText: {
    color: 'rgba(169,139,255,0.85)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});