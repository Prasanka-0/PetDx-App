import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// ─── Constants ────────────────────────────────────────────────────────────────
const { width, height } = Dimensions.get('window');
const STATUS_BAR_HEIGHT  = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ?? 24;

const HERO_HEIGHT        = 280;
const HEADER_EXPANDED_H  = 110 + STATUS_BAR_HEIGHT;
const HEADER_COLLAPSED_H = 54  + STATUS_BAR_HEIGHT;
const COLLAPSE_SCROLL    = HERO_HEIGHT - HEADER_COLLAPSED_H - 20;


const MENU_SECTIONS = [
  {
    title: 'My Content',
    items: [
      { icon: 'information-circle-outline', label: 'Pet Info Library',  accent: ['#7B5FFF', '#A98BFF'], route: '/(tabs)/info'    },
      { icon: 'time-outline',                label: 'Scan History',      accent: ['#3DBE6E', '#7DDFA0'], route: '/(tabs)/history' },
    ],
  },
  {
    title: 'Discover',
    items: [
      { icon: 'map-outline',                 label: 'Vet Locator',       accent: ['#00C2FF', '#60D6FF'], route: '/(tabs)/vet'  },
      { icon: 'paw-outline',                 label: 'Breed Finder',      accent: ['#FFB800', '#FFD966'], route: '/(tabs)/breed_scan'
        
                },
      { icon: 'paw-outline',                 label: 'Disease Finder',      accent: ['#FFB800', '#FFD966'], route: '/(tabs)/disease_scan'
        
                },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'settings-outline',            label: 'Settings',          accent: ['#8B6EFF', '#BBA6FF'], route: '/(tabs)/settings'},
      { icon: 'help-circle-outline',         label: 'Help & Support',    accent: ['#3DBE6E', '#7DDFA0'], route: '/(tabs)/help-support' },
    ],
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router           = useRouter();

  // ── Scroll-driven animation ────────────────────────────────────────────
  const scrollY = useRef(new Animated.Value(0)).current;

  const heroTranslateY = scrollY.interpolate({
    inputRange:  [0, HERO_HEIGHT],
    outputRange: [0, -HERO_HEIGHT * 0.45],
    extrapolate: 'clamp',
  });

  const orb1Y = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -70], extrapolate: 'clamp' });
  const orb2Y = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -40], extrapolate: 'clamp' });
  const orb3Y = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -25], extrapolate: 'clamp' });

  // Fixed header collapse
  const headerHeight = scrollY.interpolate({
    inputRange:  [0, COLLAPSE_SCROLL],
    outputRange: [HEADER_EXPANDED_H, HEADER_COLLAPSED_H],
    extrapolate: 'clamp',
  });
  const headerOverlayOpacity = scrollY.interpolate({
    inputRange:  [0, COLLAPSE_SCROLL],
    outputRange: [0, 0.72],
    extrapolate: 'clamp',
  });

  const avatarScale = scrollY.interpolate({
    inputRange:  [0, HERO_HEIGHT * 0.6],
    outputRange: [1, 0.7],
    extrapolate: 'clamp',
  });
  const heroContentOpacity = scrollY.interpolate({
    inputRange:  [0, HERO_HEIGHT * 0.55],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const heroContentTranslateY = scrollY.interpolate({
    inputRange:  [0, HERO_HEIGHT * 0.55],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleMenuPress = (route) => {
    if (route) router.push(route);
  };

  const username   = user?.email?.split('@')[0] || 'Pet Lover';
  const emailFull  = user?.email || 'user@example.com';
  const initials   = username.slice(0, 2).toUpperCase();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#0D0B2A', '#170D3A', '#0A1628']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.glowOrb, styles.orb1, { transform: [{ translateY: orb1Y }] }]} />
      <Animated.View style={[styles.glowOrb, styles.orb2, { transform: [{ translateY: orb2Y }] }]} />
      <Animated.View style={[styles.glowOrb, styles.orb3, { transform: [{ translateY: orb3Y }] }]} />

      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.heroContainer}>
          <Animated.Image
            source={{ uri: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800' }}
            style={[styles.heroBg, { transform: [{ translateY: heroTranslateY }] }]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(13,11,42,0.25)', 'rgba(13,11,42,0.55)', '#0D0B2A']}
            style={StyleSheet.absoluteFill}
          />

          <LinearGradient
            colors={['rgba(123,95,255,0.18)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <Animated.View
            style={[
              styles.heroContent,
              {
                opacity:   heroContentOpacity,
                transform: [{ translateY: heroContentTranslateY }],
              },
            ]}
          >
            <Animated.View style={[styles.avatarRing, { transform: [{ scale: avatarScale }] }]}>
              <BlurView intensity={50} tint="dark" style={styles.avatarBlur}>
                <LinearGradient
                  colors={['rgba(123,95,255,0.55)', 'rgba(123,95,255,0.20)']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.avatarInitials}>{initials}</Text>
              </BlurView>
            </Animated.View>

            <Text style={styles.heroName}>{username}</Text>
            <Text style={styles.heroEmail}>{emailFull}</Text>

          </Animated.View>
        </View>

        <View style={styles.menuWrapper}>
          {MENU_SECTIONS.map((section, si) => (
            <View key={si} style={styles.section}>
              <Text style={styles.sectionHeading}>{section.title}</Text>

              <BlurView intensity={38} tint="dark" style={styles.sectionCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.03)']}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.cardTopBorder} />

                {section.items.map((item, ii) => (
                  <React.Fragment key={ii}>
                    <TouchableOpacity
                      style={styles.menuRow}
                      onPress={() => handleMenuPress(item.route)}
                      activeOpacity={0.7}
                    >
                      {/* Accent icon circle */}
                      <View style={styles.iconWrapper}>
                        <LinearGradient
                          colors={item.accent}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.iconGradient}
                        >
                          <Ionicons name={item.icon} size={18} color="#fff" />
                        </LinearGradient>
                      </View>

                      <Text style={styles.menuLabel}>{item.label}</Text>

                      <View style={styles.chevronWrapper}>
                        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.35)" />
                      </View>
                    </TouchableOpacity>

                    {ii < section.items.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </BlurView>
            </View>
          ))}

          {/* ── LOGOUT BUTTON ──────────────────────────────────────────── */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
            <BlurView intensity={38} tint="dark" style={styles.logoutBlur}>
              <LinearGradient
                colors={['rgba(255,107,78,0.20)', 'rgba(255,107,78,0.07)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.logoutBorder} />
              <Ionicons name="log-out-outline" size={20} color="#FF6B4E" />
              <Text style={styles.logoutLabel}>Logout</Text>
            </BlurView>
          </TouchableOpacity>

          {/* App version tag */}
          <Text style={styles.versionTag}>PawScan  ·  v1.0.0</Text>

          <View style={{ height: 40 }} />
        </View>
      </Animated.ScrollView>

      <Animated.View style={[styles.fixedHeader, { height: headerHeight }]} pointerEvents="box-none">
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />

        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,8,36,1)', opacity: headerOverlayOpacity }]}
          pointerEvents="none"
        />

        <LinearGradient
          colors={['rgba(123,95,255,0.38)', 'rgba(123,95,255,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.headerBorder} pointerEvents="none" />

        <View style={[styles.headerInner, { paddingTop: STATUS_BAR_HEIGHT }]}>
          <Text style={styles.headerTitle}>Profile</Text>

          <TouchableOpacity style={styles.headerIconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => router.push('/settings')}>
            <BlurView intensity={50} tint="dark" style={styles.headerIconBlur}>
              <Ionicons name="settings-outline" size={18} color="rgba(255,255,255,0.80)" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}


const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: '#0D0B2A',
  },
  scroll: {
    flex: 1,
  },

  glowOrb: {
    position:     'absolute',
    borderRadius: 999,
    opacity:      0.30,
  },
  orb1: {
    width:  320, height: 320,
    backgroundColor: '#7B5FFF',
    top: -100, left: -100,
    shadowColor: '#7B5FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 110,
  },
  orb2: {
    width:  220, height: 220,
    backgroundColor: '#FF6B4E',
    top: 350, right: -60,
    shadowColor: '#FF6B4E', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 80,
  },
  orb3: {
    width:  180, height: 180,
    backgroundColor: '#00C2FF',
    bottom: 180, left: -40,
    shadowColor: '#00C2FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 65,
  },

  // ── Parallax hero ─────────────────────────────────────────────────────────
  heroContainer: {
    height:          HERO_HEIGHT,
    overflow:        'hidden',
    justifyContent:  'flex-end',
  },
  heroBg: {
    position: 'absolute',
    width:    '100%',
    height:   HERO_HEIGHT + HERO_HEIGHT * 0.45,
    top:      0,
  },


  heroContent: {
    alignItems:    'center',
    paddingBottom: 38,
    paddingTop:    STATUS_BAR_HEIGHT + 16,
  },
  avatarRing: {
    width:         80,
    height:        80,
    borderRadius:  48,
    overflow:      'hidden',
    borderWidth:   2.5,
    borderColor:   'rgba(255,255,255,0.30)',
    marginBottom:  25,
    shadowColor:   '#7B5FFF',
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.60,
    shadowRadius:  18,
    elevation:     12,
  },
  avatarBlur: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
  },
  avatarInitials: {
    fontSize:    30,
    fontWeight:  '800',
    color:       '#fff',
    letterSpacing: 1,
  },
  heroName: {
    fontSize:      22,
    fontWeight:    '700',
    color:         '#FFFFFF',
    letterSpacing: 0.4,
    marginBottom:  4,
  },
  heroEmail: {
    fontSize:  13,
    color:     'rgba(255,255,255,0.55)',
    marginBottom: 20,
    letterSpacing: 0.2,
  },

  // Stat pills
  statPills: {
    flexDirection: 'row',
    gap:           10,
  },
  pill: {
    borderRadius:      14,
    paddingVertical:   10,
    paddingHorizontal: 18,
    alignItems:        'center',
    overflow:          'hidden',
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.14)',
    minWidth:          72,
  },
  pillValue: {
    fontSize:   17,
    fontWeight: '700',
    color:      '#fff',
  },
  pillLabel: {
    fontSize:  11,
    color:     'rgba(255,255,255,0.55)',
    marginTop: 2,
    letterSpacing: 0.3,
  },

  // ── Menu wrapper ───────────────────────────────────────────────────────────
  menuWrapper: {
    paddingHorizontal: 18,
    paddingTop:        10,
  },
  section: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize:      11,
    fontWeight:    '700',
    color:         'rgba(255,255,255,0.38)',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom:  8,
    marginLeft:    4,
  },

  sectionCard: {
    borderRadius:  20,
    overflow:      'hidden',
    borderWidth:   1,
    borderColor:   'rgba(255,255,255,0.10)',
  },
  cardTopBorder: {
    position:        'absolute',
    top:  0, left: 0, right: 0,
    height:          1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    zIndex:          1,
  },

  // Individual menu row
  menuRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrapper: {
    borderRadius:  12,
    overflow:      'hidden',
    marginRight:   14,
    shadowColor:   '#7B5FFF',
    shadowOffset:  { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius:  6,
    elevation:     4,
  },
  iconGradient: {
    width:          40,
    height:         40,
    justifyContent: 'center',
    alignItems:     'center',
  },
  menuLabel: {
    flex:          1,
    fontSize:      15,
    fontWeight:    '500',
    color:         'rgba(255,255,255,0.88)',
    letterSpacing: 0.2,
  },
  chevronWrapper: {
    width:          28,
    height:         28,
    borderRadius:   9,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems:     'center',
  },


  divider: {
    height:          1,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  // ── Logout button ──────────────────────────────────────────────────────────
  logoutBtn: {
    borderRadius:  20,
    overflow:      'hidden',
    marginBottom:  45,
    borderWidth:   1,
    borderColor:   'rgba(255,107,78,0.30)',
    shadowColor:   '#FF6B4E',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius:  10,
    elevation:     5,
  },
  logoutBlur: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 16,
    overflow:       'hidden',
  },
  logoutBorder: {
    position:        'absolute',
    top: 0, left: 0, right: 0,
    height:          1,
    backgroundColor: 'rgba(255,107,78,0.35)',
  },
  logoutLabel: {
    fontSize:      16,
    fontWeight:    '600',
    color:         '#FF6B4E',
    marginLeft:    10,
    letterSpacing: 0.3,
  },

  versionTag: {
    textAlign:     'center',
    fontSize:      12,
    color:         'rgba(255,255,255,0.22)',
    letterSpacing: 1.0,
    marginBottom:  4,
  },

  // ── Fixed glass header ─────────────────────────────────────────────────────
  fixedHeader: {
    position:  'absolute',
    top:       0,
    left:      0,
    right:     0,
    zIndex:    100,
    overflow:  'hidden',
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
    paddingHorizontal: 22,
    paddingBottom:     14,
  },
  headerTitle: {
    fontSize:      20,
    fontWeight:    '700',
    color:         '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerIconBtn: {
    borderRadius:  14,
    overflow:      'hidden',
    borderWidth:   1,
    borderColor:   'rgba(255,255,255,0.15)',
  },
  headerIconBlur: {
    width:          40,
    height:         40,
    justifyContent: 'center',
    alignItems:     'center',
  },
});