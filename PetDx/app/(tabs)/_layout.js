import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const TAB_ITEMS = [
  {
    name:       'home',
    label:      'Home',
    icon:       'home-outline',
    iconActive: 'home',
    accent:     ['#7B5FFF', '#A98BFF'],
    glowColor:  '#7B5FFF',
  },
  {
    name:       'scan',
    label:      'Scan',
    icon:       'camera-outline',
    iconActive: 'camera',
    accent:     ['#FF6B4E', '#FF9F7B'],
    glowColor:  '#FF6B4E',
  },
  {
    name:       'history',
    label:      'History',
    icon:       'time-outline',
    iconActive: 'time',
    accent:     ['#3DBE6E', '#7DDFA0'],
    glowColor:  '#3DBE6E',
  },
  {
    name:       'profile',
    label:      'Profile',
    icon:       'person-outline',
    iconActive: 'person',
    accent:     ['#FFB800', '#FFD966'],
    glowColor:  '#FFB800',
  },
];

// Single animated tab button
function TabButton({ item, isFocused, onPress }) {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.1 : 0.9)).current;
  const pillAnim  = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const labelAnim = useRef(new Animated.Value(isFocused ? 1 : 0.4)).current;
  const translateY = useRef(new Animated.Value(isFocused ? -2 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue:         isFocused ? 1.15 : 0.90,
        useNativeDriver: true,
        friction:        6,
        tension:         130,
      }),
      Animated.spring(translateY, {
        toValue:         isFocused ? -3 : 0,
        useNativeDriver: true,
        friction:        7,
        tension:         120,
      }),
      Animated.timing(pillAnim, {
        toValue:         isFocused ? 1 : 0,
        duration:        200,
        useNativeDriver: true,
      }),
      Animated.timing(labelAnim, {
        toValue:         isFocused ? 1 : 0.40,
        duration:        200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.70}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: isFocused }}
    >
      {/* ── Active glow pill ── */}
      <Animated.View
        style={[
          styles.activePill,
          {
            opacity:   pillAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={item.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activePillGradient}
        />
        {/* Soft inner glow ring */}
        <View
          style={[
            styles.pillGlowRing,
            { borderColor: item.glowColor + '55' },
          ]}
        />
      </Animated.View>

      {/* ── Icon ── */}
      <Animated.View
        style={{
          transform: [
            { scale:     scaleAnim },
            { translateY },
          ],
        }}
      >
        <Ionicons
          name={isFocused ? item.iconActive : item.icon}
          size={22}
          color={isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.38)'}
        />
      </Animated.View>

      {/* ── Label ── */}
      <Animated.Text
        style={[
          styles.tabLabel,
          {
            opacity: labelAnim,
            color:   isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.38)',
            fontWeight: isFocused ? '700' : '500',
          },
        ]}
      >
        {item.label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

// Custom glass tab bar component
function GlassTabBar({ state, navigation }) {
  const visibleRoutes = state.routes.filter(r =>
    TAB_ITEMS.some(t => t.name === r.name)
  );

  return (
    <View style={styles.tabBarOuter} pointerEvents="box-none">

      <View style={styles.androidShadowSlab} />

      <View style={styles.glassBar}>
        <BlurView
          intensity={Platform.OS === 'android' ? 18 : 45}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.darkBaseFill} pointerEvents="none" />

        <LinearGradient
          colors={[
            'rgba(30,20,70,0.78)',
            'rgba(10,8,30,0.92)',
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <LinearGradient
          colors={[
            'rgba(123,95,255,0.12)',
            'rgba(123,95,255,0.04)',
            'rgba(0,194,255,0.06)',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Top shimmer border line */}
        <View style={styles.topShimmerBorder} pointerEvents="none" />

        {/* Left & right edge shimmer */}
        <View style={styles.leftEdgeBorder}  pointerEvents="none" />
        <View style={styles.rightEdgeBorder} pointerEvents="none" />

        {/* ── Tab buttons row ── */}
        <View style={styles.tabRow}>
          {visibleRoutes.map((route) => {
            const tabItem = TAB_ITEMS.find(t => t.name === route.name);
            if (!tabItem) return null;

            const routeIndex = state.routes.indexOf(route);
            const isFocused  = state.index === routeIndex;

            const onPress = () => {
              const event = navigation.emit({
                type:              'tabPress',
                target:            route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabButton
                key={route.key}
                item={tabItem}
                isFocused={isFocused}
                onPress={onPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}


// Layout export
export default function TabsLayout() {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <Tabs
        tabBar={(props) => <GlassTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        {/* ══ Visible tabs ══ */}
        <Tabs.Screen
          name="home"
          options={{ title: 'Home', headerShown: false }}
        />
        <Tabs.Screen
          name="scan"
          options={{ title: 'Scan', headerShown: false }}
        />
        <Tabs.Screen
          name="history"
          options={{ title: 'History', headerShown: false }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: 'Profile', headerShown: false }}
        />

        <Tabs.Screen
          name="vet"
          options={{ headerShown: false, href: null }}
        />
        <Tabs.Screen
          name="info"
          options={{ headerShown: false, href: null }}
        />
      </Tabs>
    </>
  );
}

const BAR_HEIGHT   = 66;
const RADIUS       = 28;

const styles = StyleSheet.create({

  tabBarOuter: {
    position:  'absolute',
    bottom:    0,
    left:      0,
    right:     0,
    zIndex:    999,
    elevation: 30,
     marginBottom: Platform.OS === 'ios' ? 40 : 36,          
  },


  androidShadowSlab: {
    position:              'absolute',
    bottom:                -6,
    left:                  0,
    right:                 0,
    height:                BAR_HEIGHT + 10,
    backgroundColor:       'rgba(7,5,22,0.85)',
    borderTopLeftRadius:   RADIUS + 4,
    borderTopRightRadius:  RADIUS + 4,
    elevation:             18,
  },

  glassBar: {
    width:                 '100%',
    height:                BAR_HEIGHT,
    borderTopLeftRadius:   RADIUS,
    borderTopRightRadius:  RADIUS,
    overflow:              'hidden',
    backgroundColor:       'rgba(10,8,28,0.90)',
    elevation:             20,
  },

  darkBaseFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,6,24,0.65)',
  },

  topShimmerBorder: {
    position:        'absolute',
    top:  0,
    left: 0,
    right: 0,
    height:          1.5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    zIndex:          5,
  },
  leftEdgeBorder: {
    position:        'absolute',
    top: 0, left: 0, bottom: 0,
    width:           1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    zIndex:          5,
  },
  rightEdgeBorder: {
    position:        'absolute',
    top: 0, right: 0, bottom: 0,
    width:           1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    zIndex:          5,
  },

  tabRow: {
    flex:              1,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-around',
    paddingHorizontal: 6,
    zIndex:            6,
  },

  tabButton: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 8,
  },


  activePill: {
    position:        'absolute',
    top:             5,
    width:           50,
    height:          50,
    borderRadius:    18,
    overflow:        'hidden',
    elevation:       8,
  },
  activePillGradient: {
    flex:    1,
    opacity: 0.30,  
  },

  pillGlowRing: {
    position:     'absolute',
    top:          0, left: 0, right: 0, bottom: 0,
    borderRadius: 18,
    borderWidth:  1.5,
  },

  tabLabel: {
    fontSize:      10,
    marginTop:     3,
    letterSpacing: 0.35,
    textAlign:     'center',
  },
});