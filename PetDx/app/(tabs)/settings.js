import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllScans, deleteScan } from '../../utils/database';  

// ─── Constants ────────────────────────────────────────────────────────────────
const { width, height } = Dimensions.get('window');
const STATUS_BAR_HEIGHT  = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 50;
const HEADER_H           = 72 + STATUS_BAR_HEIGHT;

// AsyncStorage keys
const KEY_NOTIFICATIONS = '@settings_notifications';
const KEY_AUTO_SAVE     = '@settings_auto_save';
const KEY_SCAN_QUALITY  = '@settings_scan_quality';
const KEY_HAPTICS       = '@settings_haptics';

// Scan quality options
const QUALITY_OPTIONS = ['Fast', 'Balanced', 'Best'];
const QUALITY_COLORS  = [
  ['#3DBE6E', '#7DDFA0'],
  ['#FFB800', '#FFD966'],
  ['#7B5FFF', '#A98BFF'],
];

/** Section header label */
function SectionLabel({ text }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

function GlassCard({ children, style }) {
  return (
    <View style={[styles.glassCardOuter, style]}>
      <BlurView intensity={22} tint="dark" style={styles.glassCard}>
        <LinearGradient
          colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.02)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glassCardTopBorder} />
        {children}
      </BlurView>
    </View>
  );
}

function SettingRow({
  icon, accent, label, subtitle, rightElement,
  onPress, isLast = false, destructive = false,
}) {
  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={onPress ? 0.72 : 1}
        disabled={!onPress}
      >
        {/* Icon pill */}
        <View style={styles.rowIconWrap}>
          <LinearGradient
            colors={destructive ? ['#FF6B4E', '#FF9F7B'] : accent}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.rowIconGradient}
          >
            <Ionicons name={icon} size={18} color="#fff" />
          </LinearGradient>
        </View>

        {/* Text */}
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, destructive && { color: '#FF6B4E' }]}>
            {label}
          </Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>

        {/* Right slot */}
        {rightElement}
      </TouchableOpacity>

      {!isLast && <View style={styles.rowDivider} />}
    </>
  );
}

function GlassSwitch({ value, onValueChange, accent }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: 'rgba(255,255,255,0.12)', true: accent?.[0] ?? '#7B5FFF' }}
      thumbColor={value ? '#FFFFFF' : 'rgba(255,255,255,0.55)'}
      ios_backgroundColor="rgba(255,255,255,0.12)"
      style={{ transform: [{ scaleX: 0.88 }, { scaleY: 0.88 }] }}
    />
  );
}

function Chevron() {
  return (
    <View style={styles.chevron}>
      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.32)" />
    </View>
  );
}


export default function SettingsScreen() {
  const router = useRouter();


  const [notifications, setNotifications] = useState(true);
  const [autoSave,      setAutoSave]       = useState(true);
  const [haptics,       setHaptics]        = useState(true);
  const [scanQuality,   setScanQuality]    = useState(1);


  const [scanCount,     setScanCount]    = useState(0);
  const [storageKB,     setStorageKB]    = useState(0);
  const [clearLoading,  setClearLoading] = useState(false);


  const scrollY = useRef(new Animated.Value(0)).current;
  const orb1Y   = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -55], extrapolate: 'clamp' });
  const orb2Y   = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -32], extrapolate: 'clamp' });


  useEffect(() => {
    loadPrefs();
    loadScanStats();
  }, []);

  const loadPrefs = async () => {
    try {
      const [n, a, q, h] = await Promise.all([
        AsyncStorage.getItem(KEY_NOTIFICATIONS),
        AsyncStorage.getItem(KEY_AUTO_SAVE),
        AsyncStorage.getItem(KEY_SCAN_QUALITY),
        AsyncStorage.getItem(KEY_HAPTICS),
      ]);
      if (n !== null) setNotifications(n === 'true');
      if (a !== null) setAutoSave(a === 'true');
      if (q !== null) setScanQuality(Number(q));
      if (h !== null) setHaptics(h === 'true');
    } catch {}
  };

  const loadScanStats = async () => {
    try {
      const scans = await getAllScans();
      setScanCount(scans.length);
      setStorageKB(scans.length * 150);
    } catch {}
  };

  const toggle = useCallback(async (key, value, setter) => {
    setter(value);
    await AsyncStorage.setItem(key, String(value));
  }, []);

  const setQuality = useCallback(async (idx) => {
    setScanQuality(idx);
    await AsyncStorage.setItem(KEY_SCAN_QUALITY, String(idx));
  }, []);

  const handleClearHistory = () => {
    if (scanCount === 0) {
      Alert.alert('Nothing to clear', 'Your scan history is already empty.');
      return;
    }
    Alert.alert(
      'Clear Scan History',
      `This will permanently delete all ${scanCount} scan${scanCount !== 1 ? 's' : ''}. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearLoading(true);
              const scans = await getAllScans();
              for (const scan of scans) await deleteScan(scan.id);
              setScanCount(0);
              setStorageKB(0);
              Alert.alert('Done', 'Scan history has been cleared.');
            } catch {
              Alert.alert('Error', 'Failed to clear history. Please try again.');
            } finally {
              setClearLoading(false);
            }
          },
        },
      ]
    );
  };

  const openPrivacyPolicy = () =>
    Linking.openURL('https://your-app-domain.com/privacy').catch(() =>
      Alert.alert('Error', 'Could not open Privacy Policy.')
    );

  const openTerms = () =>
    Linking.openURL('https://your-app-domain.com/terms').catch(() =>
      Alert.alert('Error', 'Could not open Terms of Service.')
    );

  const rateApp = () => {
    const url = Platform.OS === 'android'
      ? 'market://details?id=com.yourcompany.pawscan'
      : 'itms-apps://itunes.apple.com/app/idYOURAPPID';
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open the app store.')
    );
  };

  const openLanguage = () => router.push('/language');

  const storageDisplay = storageKB >= 1024
    ? `${(storageKB / 1024).toFixed(1)} MB`
    : `${storageKB} KB`;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#0A0820', '#150D38', '#0A1628']}
        start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.glowOrb, styles.orb1, { transform: [{ translateY: orb1Y }] }]} />
      <Animated.View style={[styles.glowOrb, styles.orb2, { transform: [{ translateY: orb2Y }] }]} />
      <View style={[styles.glowOrb, styles.orb3]} />

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_H + 16 }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >

        <SectionLabel text="App Preferences" />
        <GlassCard>

          {/* Language */}
          <SettingRow
            icon="language-outline"
            accent={['#7B5FFF', '#A98BFF']}
            label="Language"
            subtitle="English (US)"
            onPress={openLanguage}
            rightElement={<Chevron />}
          />

          <SettingRow
            icon="notifications-outline"
            accent={['#FF6B4E', '#FF9F7B']}
            label="Push Notifications"
            subtitle={notifications ? 'Enabled' : 'Disabled'}
            rightElement={
              <GlassSwitch
                value={notifications}
                accent={['#FF6B4E', '#FF9F7B']}
                onValueChange={(v) => toggle(KEY_NOTIFICATIONS, v, setNotifications)}
              />
            }
          />

          {/* Haptic Feedback */}
          <SettingRow
            icon="phone-portrait-outline"
            accent={['#00C2FF', '#60D6FF']}
            label="Haptic Feedback"
            subtitle={haptics ? 'On' : 'Off'}
            rightElement={
              <GlassSwitch
                value={haptics}
                accent={['#00C2FF', '#60D6FF']}
                onValueChange={(v) => toggle(KEY_HAPTICS, v, setHaptics)}
              />
            }
            isLast
          />
        </GlassCard>

        <SectionLabel text="Scan Settings" />
        <GlassCard>

          {/* Auto-Save Scans */}
          <SettingRow
            icon="cloud-upload-outline"
            accent={['#3DBE6E', '#7DDFA0']}
            label="Auto-Save Scans"
            subtitle="Save every scan to history automatically"
            rightElement={
              <GlassSwitch
                value={autoSave}
                accent={['#3DBE6E', '#7DDFA0']}
                onValueChange={(v) => toggle(KEY_AUTO_SAVE, v, setAutoSave)}
              />
            }
          />

          <View style={styles.qualityRow}>
            <View style={styles.rowIconWrap}>
              <LinearGradient colors={QUALITY_COLORS[scanQuality]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rowIconGradient}>
                <Ionicons name="sparkles-outline" size={18} color="#fff" />
              </LinearGradient>
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Scan Quality</Text>
              <Text style={styles.rowSubtitle}>Higher quality takes longer to process</Text>
            </View>
          </View>

          {/* Segmented control */}
          <View style={styles.segmentWrapper}>
            <BlurView intensity={16} tint="dark" style={styles.segmentTrack}>
              <LinearGradient
                colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                style={StyleSheet.absoluteFill}
              />
              {QUALITY_OPTIONS.map((opt, i) => {
                const isActive = scanQuality === i;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={styles.segmentBtn}
                    onPress={() => setQuality(i)}
                    activeOpacity={0.78}
                  >
                    {isActive && (
                      <LinearGradient
                        colors={QUALITY_COLORS[i]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.segmentActiveBg}
                      />
                    )}
                    <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </BlurView>
          </View>

          <View style={styles.rowDivider} />

          {/* Clear History */}
          <SettingRow
            icon="trash-outline"
            accent={['#FF6B4E', '#FF9F7B']}
            label={clearLoading ? 'Clearing…' : 'Clear Scan History'}
            subtitle={
              scanCount > 0
                ? `${scanCount} scan${scanCount !== 1 ? 's' : ''} · ~${storageDisplay} used`
                : 'History is empty'
            }
            onPress={clearLoading ? null : handleClearHistory}
            destructive
            isLast
          />
        </GlassCard>


        <SectionLabel text="Storage" />
        <GlassCard>
          {/* Usage bar */}
          <View style={styles.storageContainer}>
            <View style={styles.storageHeader}>
              <View style={styles.rowIconWrap}>
                <LinearGradient colors={['#FFB800', '#FFD966']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rowIconGradient}>
                  <Ionicons name="server-outline" size={18} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>App Storage</Text>
                <Text style={styles.rowSubtitle}>
                  {scanCount} scan{scanCount !== 1 ? 's' : ''} · {storageDisplay} used
                </Text>
              </View>
            </View>

            {/* Usage bar */}
            <View style={styles.storageBarTrack}>
              <LinearGradient
                colors={['#FFB800', '#FFD966']}
                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={[styles.storageBarFill, { width: `${Math.min((storageKB / 5120) * 100, 100)}%` }]}
              />
            </View>
            <Text style={styles.storageNote}>
              Estimated usage out of 5 MB free tier
            </Text>
          </View>
        </GlassCard>

        <SectionLabel text="About & Legal" />
        <GlassCard>

          {/* Rate the App */}
          <SettingRow
            icon="star-outline"
            accent={['#FFB800', '#FFD966']}
            label="Rate PawScan"
            subtitle="Enjoying the app? Leave us a review!"
            onPress={rateApp}
            rightElement={<Chevron />}
          />

          {/* Privacy Policy */}
          <SettingRow
            icon="shield-checkmark-outline"
            accent={['#3DBE6E', '#7DDFA0']}
            label="Privacy Policy"
            subtitle="How we handle your data"
            onPress={openPrivacyPolicy}
            rightElement={<Chevron />}
          />

          {/* Terms of Service */}
          <SettingRow
            icon="document-text-outline"
            accent={['#00C2FF', '#60D6FF']}
            label="Terms of Service"
            subtitle="Rules and conditions of use"
            onPress={openTerms}
            rightElement={<Chevron />}
            isLast
          />
        </GlassCard>

        <View style={styles.versionChipWrapper}>
          <BlurView intensity={16} tint="dark" style={styles.versionChip}>
            <LinearGradient
              colors={['rgba(123,95,255,0.16)', 'rgba(123,95,255,0.05)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.versionChipBorder} />
            <View style={styles.versionDot} />
            <Text style={styles.versionText}>PawScan  ·  v1.0.0  ·  Build 100</Text>
          </BlurView>
        </View>

        <View style={{ height: 80 }} />
      </Animated.ScrollView>

      <View style={[styles.fixedHeader, { height: HEADER_H }]} pointerEvents="box-none">
        <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />

        <LinearGradient
          colors={['rgba(10,8,32,0.70)', 'rgba(10,8,32,0.40)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <LinearGradient
          colors={['rgba(123,95,255,0.35)', 'rgba(123,95,255,0.06)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.headerBorder} pointerEvents="none" />

        <View style={[styles.headerInner, { paddingTop: STATUS_BAR_HEIGHT }]}>
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
            <BlurView intensity={20} tint="dark" style={styles.backBtnBlur}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.03)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.backBtnShimmer} />
              <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.88)" />
            </BlurView>
          </TouchableOpacity>

          {/* Title block */}
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Preferences & controls</Text>
          </View>

          <View style={styles.headerIconBox}>
            <BlurView intensity={20} tint="dark" style={styles.headerIconBlur}>
              <LinearGradient colors={['rgba(123,95,255,0.30)', 'rgba(123,95,255,0.08)']} style={StyleSheet.absoluteFill} />
              <Ionicons name="settings" size={18} color="#A98BFF" />
            </BlurView>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  root:  { flex: 1, backgroundColor: '#0A0820' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 30 },

  glowOrb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 300, height: 300, backgroundColor: '#7B5FFF', opacity: 0.25, top: -90,  left: -90  },
  orb2: { width: 230, height: 230, backgroundColor: '#FF6B4E', opacity: 0.18, top: 380,  right: -70 },
  orb3: { width: 180, height: 180, backgroundColor: '#00C2FF', opacity: 0.16, bottom: 120, left: -50 },

  sectionLabel: {
    fontSize:      11,
    fontWeight:    '700',
    color:         'rgba(255,255,255,0.38)',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom:  8,
    marginLeft:    4,
    marginTop:     22,
  },

  glassCardOuter: {
    borderRadius:  20,
    overflow:      'visible',
    marginBottom:  4,
  },
  glassCard: {
    borderRadius:    20,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.10)',
    elevation:       6,
    backgroundColor: 'rgba(10,8,28,0.80)', 
  },
  glassCardTopBorder: {
    position:        'absolute',
    top: 0, left: 0, right: 0,
    height:          1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    zIndex:          2,
  },


  row: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowIconWrap: {
    borderRadius:  12,
    overflow:      'hidden',
    marginRight:   14,
    elevation:     4,
  },
  rowIconGradient: {
    width:          40,
    height:         40,
    justifyContent: 'center',
    alignItems:     'center',
  },
  rowText:     { flex: 1 },
  rowLabel:    { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.88)', letterSpacing: 0.2 },
  rowSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.40)', marginTop: 2, letterSpacing: 0.15 },
  rowDivider:  { height: 1, marginHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.07)' },

  chevron: {
    width:           28,
    height:          28,
    borderRadius:    9,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent:  'center',
    alignItems:      'center',
  },

  qualityRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingTop:     14,
    paddingHorizontal: 16,
    paddingBottom:  10,
  },
  segmentWrapper: {
    marginHorizontal: 16,
    marginBottom:     14,
    borderRadius:     14,
    overflow:         'hidden',
    borderWidth:      1,
    borderColor:      'rgba(255,255,255,0.10)',
    elevation:        3,
  },
  segmentTrack: {
    flexDirection:   'row',
    overflow:        'hidden',
    backgroundColor: 'rgba(10,8,28,0.70)',
  },
  segmentBtn: {
    flex:           1,
    paddingVertical: 11,
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
  },
  segmentActiveBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.30,
  },
  segmentText: {
    fontSize:      13,
    fontWeight:    '600',
    color:         'rgba(255,255,255,0.40)',
    letterSpacing: 0.3,
  },
  segmentTextActive: {
    color:      '#FFFFFF',
    fontWeight: '700',
  },

  storageContainer: {
    paddingHorizontal: 16,
    paddingVertical:   16,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  14,
  },
  storageBarTrack: {
    height:          8,
    borderRadius:    4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow:        'hidden',
    marginBottom:    8,
  },
  storageBarFill: {
    height:       '100%',
    borderRadius: 4,
    minWidth:     4,
  },
  storageNote: {
    fontSize:  11,
    color:     'rgba(255,255,255,0.30)',
    letterSpacing: 0.2,
  },

  versionChipWrapper: {
    alignItems:   'center',
    marginTop:    28,
    marginBottom: 8,
  },
  versionChip: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   9,
    paddingHorizontal: 18,
    borderRadius:      20,
    overflow:          'hidden',
    borderWidth:       1,
    borderColor:       'rgba(123,95,255,0.22)',
    backgroundColor:   'rgba(10,8,28,0.60)', 
  },
  versionChipBorder: {
    position:        'absolute',
    top: 0, left: 0, right: 0,
    height:          1,
    backgroundColor: 'rgba(169,139,255,0.28)',
  },
  versionDot: {
    width:           7,
    height:          7,
    borderRadius:    4,
    backgroundColor: '#7B5FFF',
    marginRight:     9,
  },
  versionText: {
    fontSize:      12,
    color:         'rgba(255,255,255,0.35)',
    letterSpacing: 0.8,
  },

  fixedHeader: {
    position:  'absolute',
    top:       0, left: 0, right: 0,
    zIndex:    100,
    overflow:  'hidden',
    elevation: 20,
  },
  headerBorder: {
    position:        'absolute',
    bottom: 0, left: 0, right: 0,
    height:          1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerInner: {
    flex:              1,
    flexDirection:     'row',
    alignItems:        'flex-end',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingBottom:     14,
  },
  backBtn: {
    borderRadius:  14,
    overflow:      'hidden',
    borderWidth:   1,
    borderColor:   'rgba(255,255,255,0.12)',
    elevation:     4,
  },
  backBtnBlur: {
    width:           44,
    height:          44,
    justifyContent:  'center',
    alignItems:      'center',
    overflow:        'hidden',
    backgroundColor: 'rgba(10,8,28,0.70)', 
  },
  backBtnShimmer: {
    position:        'absolute',
    top: 0, left: 0, right: 0,
    height:          1,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  headerTitleBlock: { alignItems: 'center' },
  headerTitle:      { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  headerSubtitle:   { fontSize: 12, color: 'rgba(255,255,255,0.42)', marginTop: 3, letterSpacing: 0.2 },
  headerIconBox: {
    borderRadius: 14,
    overflow:     'hidden',
    borderWidth:  1,
    borderColor:  'rgba(123,95,255,0.28)',
    elevation:    4,
  },
  headerIconBlur: {
    width:           44,
    height:          44,
    justifyContent:  'center',
    alignItems:      'center',
    overflow:        'hidden',
    backgroundColor: 'rgba(10,8,28,0.70)',
  },
});