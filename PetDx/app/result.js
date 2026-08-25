
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 50;

export default function ResultScreen() {
  const { imageUri, label, confidence, scanType } = useLocalSearchParams();
  const router = useRouter();

  const mountAnim    = useRef(new Animated.Value(0)).current;
  const cardScale    = useRef(new Animated.Value(0.9)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(cardScale,  { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }),
      Animated.spring(contentSlide, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const confidencePercentage = (Number(confidence) * 100).toFixed(1);

  const getConfidenceColor = () => {
    const conf = Number(confidence);
    if (conf >= 0.8) return '#3DBE6E';
    if (conf >= 0.6) return '#FFB800';
    return '#FF6B4E';
  };

  const confidenceColor = getConfidenceColor();
  const isDisease       = scanType === 'disease';
  const accentColor     = isDisease ? '#FF6B4E' : '#7B5FFF';
  const accentLight     = isDisease ? '#FF9F7B' : '#A98BFF';
  const headerGradient  = isDisease
    ? ['rgba(255,107,78,0.35)', 'rgba(255,107,78,0.06)']
    : ['rgba(123,95,255,0.35)', 'rgba(123,95,255,0.06)'];
  const iconName      = isDisease ? 'medical' : 'paw';
  const screenTitle   = isDisease ? 'Disease Result' : 'Breed Result';
  const detectedLabel = isDisease ? 'Detected Condition' : 'Detected Breed';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#0A0820', '#150D38', '#0A1628']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.glowOrb, styles.orb1, { backgroundColor: accentColor }]} />
      <View style={[styles.glowOrb, styles.orb2]} />
      <View style={[styles.glowOrb, styles.orb3]} />

      <Animated.View style={[styles.container, { opacity: mountAnim }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT + 10 }]}>
          <LinearGradient
            colors={headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: `${accentColor}4D` }]}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <LinearGradient colors={[accentColor, accentLight]} style={styles.headerIconGradient}>
              <Ionicons name={iconName} size={28} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>{screenTitle}</Text>
              <Text style={styles.headerSubtitle}>AI-powered analysis complete</Text>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Result Card */}
          <Animated.View style={[styles.cardWrapper, { transform: [{ scale: cardScale }] }]}>
            <View style={[styles.cardGlowSlab, { backgroundColor: confidenceColor + '30' }]} />

            <BlurView intensity={22} tint="dark" style={styles.card}>
              <LinearGradient
                colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.02)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardTopBorder} />

              {/* Image */}
              <View style={styles.imageWrapper}>
                <LinearGradient
                  colors={[confidenceColor, confidenceColor + '80']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.imageRing}
                />
                <Image source={{ uri: imageUri }} style={styles.image} />
              </View>

              {/* Details */}
              <Animated.View
                style={[styles.detailsContainer, { transform: [{ translateY: contentSlide }] }]}
              >
                {/* Confidence Circle */}
                <View style={styles.confidenceCircleWrapper}>
                  <BlurView intensity={18} tint="dark" style={styles.confidenceCircle}>
                    <LinearGradient
                      colors={[confidenceColor + '20', confidenceColor + '08']}
                      style={StyleSheet.absoluteFill}
                    />
                    <View
                      style={[styles.confidenceCircleBorder, { borderColor: confidenceColor + '40' }]}
                    />
                    <Text style={[styles.confidencePercentage, { color: confidenceColor }]}>
                      {confidencePercentage}%
                    </Text>
                    <Text style={styles.confidenceLabel}>confidence</Text>
                  </BlurView>
                </View>

                {/* Prediction */}
                <View style={styles.predictionContainer}>
                  <View style={styles.labelWrapper}>
                    <Text style={styles.labelTitle}>{detectedLabel}</Text>
                    <View style={styles.resultPill}>
                      <LinearGradient
                        colors={[confidenceColor + '30', confidenceColor + '10']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.resultPillBg}
                      />
                      <View style={[styles.resultDot, { backgroundColor: confidenceColor }]} />
                      <Text
                        style={[styles.resultText, { color: confidenceColor }]}
                        numberOfLines={2}
                      >
                        {label || 'Unknown'}
                      </Text>
                    </View>
                  </View>

                  {/* Confidence Bar */}
                  <View style={styles.confidenceBarContainer}>
                    <View style={styles.confidenceBarLabel}>
                      <Text style={styles.confidenceBarText}>Matching Score</Text>
                      <Text style={[styles.confidenceBarValue, { color: confidenceColor }]}>
                        {confidencePercentage}%
                      </Text>
                    </View>
                    <View style={styles.confidenceBarBg}>
                      <View
                        style={[
                          styles.confidenceBarFill,
                          { width: `${confidencePercentage}%`, backgroundColor: confidenceColor },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Badges */}
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { borderColor: accentColor + '50' }]}>
                      <LinearGradient
                        colors={[accentColor + '20', accentColor + '08']}
                        style={StyleSheet.absoluteFill}
                      />
                      <Ionicons name={iconName} size={13} color={accentLight} />
                      <Text style={[styles.badgeText, { color: accentLight }]}>
                        {isDisease ? 'Disease Scan' : 'Breed Scan'}
                      </Text>
                    </View>

                    <View style={[styles.badge, { borderColor: 'rgba(255,255,255,0.12)' }]}>
                      <LinearGradient
                        colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                        style={StyleSheet.absoluteFill}
                      />
                      <Ionicons name="calendar-outline" size={13} color="rgba(169,139,255,0.85)" />
                      <Text style={styles.badgeTextMuted}>
                        {new Date().toLocaleDateString()}
                      </Text>
                    </View>

                    <View style={[styles.badge, { borderColor: 'rgba(255,255,255,0.12)' }]}>
                      <LinearGradient
                        colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                        style={StyleSheet.absoluteFill}
                      />
                      <Ionicons name="time-outline" size={13} color="rgba(169,139,255,0.85)" />
                      <Text style={styles.badgeTextMuted}>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </BlurView>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[styles.actionsContainer, { transform: [{ translateY: contentSlide }] }]}
          >
            <TouchableOpacity
              style={styles.actionButtonWrapper}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <BlurView intensity={22} tint="dark" style={styles.actionButton}>
                <LinearGradient
                  colors={[accentColor + '30', accentColor + '0A']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.actionButtonBorder} />
                <Ionicons name="arrow-back-outline" size={20} color={accentLight} />
                <Text style={[styles.actionButtonText, { color: accentLight }]}>Scan Again</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonWrapper}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.8}
            >
              <BlurView intensity={22} tint="dark" style={styles.actionButton}>
                <LinearGradient
                  colors={['rgba(61,190,110,0.25)', 'rgba(61,190,110,0.08)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.actionButtonBorder} />
                <Ionicons name="home-outline" size={20} color="#7DDFA0" />
                <Text style={[styles.actionButtonText, { color: '#7DDFA0' }]}>Home</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* Disclaimer */}
          <View style={styles.disclaimerWrapper}>
            <BlurView intensity={16} tint="dark" style={styles.disclaimer}>
              <LinearGradient
                colors={['rgba(255,107,78,0.08)', 'rgba(255,107,78,0.02)']}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,0.38)" />
              <Text style={styles.disclaimerText}>
                {isDisease
                  ? 'This is an AI-powered prediction. Please consult with a veterinarian for professional diagnosis and treatment.'
                  : 'This is an AI-powered breed prediction. Results may vary based on image quality and angle.'}
              </Text>
            </BlurView>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:               { flex: 1, backgroundColor: '#0A0820' },
  glowOrb:            { position: 'absolute', borderRadius: 999, opacity: 0.25 },
  orb1:               { width: 320, height: 320, top: -110, right: -90 },
  orb2:               { width: 250, height: 250, backgroundColor: '#FF6B4E', bottom: height * 0.3, left: -80 },
  orb3:               { width: 200, height: 200, backgroundColor: '#00C2FF', top: height * 0.5, right: -55 },
  container:          { flex: 1 },
  header:             { paddingHorizontal: 20, paddingBottom: 20, marginBottom: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' },
  backButton:         { position: 'absolute', top: STATUS_BAR_HEIGHT + 15, left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerContent:      { flexDirection: 'row', alignItems: 'center', marginTop: 70, gap: 12 },
  headerIconGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  headerTitle:        { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  headerSubtitle:     { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  scrollContent:      { paddingHorizontal: 20, paddingBottom: 40 },
  cardWrapper:        { marginBottom: 20 },
  cardGlowSlab:       { position: 'absolute', top: 4, left: 8, right: 8, bottom: -3, borderRadius: 28, elevation: 12 },
  card:               { borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', elevation: 8, backgroundColor: 'rgba(10,8,28,0.78)', padding: 20 },
  cardTopBorder:      { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.16)', zIndex: 2 },
  imageWrapper:       { alignItems: 'center', marginBottom: 24, padding: 3 },
  imageRing:          { position: 'absolute', top: -2, left: width * 0.1, right: width * 0.1, bottom: -2, borderRadius: 24, opacity: 0.5 },
  image:              { width: width * 0.55, height: width * 0.55, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(0,0,0,0.25)' },
  detailsContainer:   { gap: 20 },
  confidenceCircleWrapper: { alignItems: 'center' },
  confidenceCircle:   { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(10,8,28,0.70)', elevation: 6 },
  confidenceCircleBorder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 50, borderWidth: 2, opacity: 0.5 },
  confidencePercentage: { fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
  confidenceLabel:    { fontSize: 10, color: 'rgba(255,255,255,0.48)', letterSpacing: 0.3, textTransform: 'uppercase' },
  predictionContainer:{ gap: 16 },
  labelWrapper:       { gap: 8 },
  labelTitle:         { fontSize: 13, color: 'rgba(255,255,255,0.48)', letterSpacing: 0.3, textTransform: 'uppercase' },
  resultPill:         { flexDirection: 'row', alignItems: 'center', borderRadius: 12, overflow: 'hidden', alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', maxWidth: '100%' },
  resultPillBg:       { ...StyleSheet.absoluteFillObject, borderRadius: 12 },
  resultDot:          { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  resultText:         { fontSize: 16, fontWeight: '600', letterSpacing: 0.2, flex: 1 },
  confidenceBarContainer: { gap: 6 },
  confidenceBarLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confidenceBarText:  { fontSize: 12, color: 'rgba(255,255,255,0.48)', letterSpacing: 0.2 },
  confidenceBarValue: { fontSize: 14, fontWeight: '600', letterSpacing: 0.2 },
  confidenceBarBg:    { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  confidenceBarFill:  { height: '100%', borderRadius: 3 },
  badgeRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  badge:              { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, overflow: 'hidden', borderWidth: 1, gap: 5 },
  badgeText:          { fontSize: 12, fontWeight: '500' },
  badgeTextMuted:     { fontSize: 12, fontWeight: '500', color: 'rgba(169,139,255,0.85)' },
  actionsContainer:   { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionButtonWrapper:{ flex: 1, elevation: 6 },
  actionButton:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(10,8,28,0.70)', gap: 8 },
  actionButtonBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.16)' },
  actionButtonText:   { fontSize: 14, fontWeight: '600', letterSpacing: 0.2 },
  disclaimerWrapper:  { marginBottom: 20 },
  disclaimer:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,107,78,0.15)', backgroundColor: 'rgba(10,8,28,0.60)', gap: 8 },
  disclaimerText:     { flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 16, letterSpacing: 0.2 },
});