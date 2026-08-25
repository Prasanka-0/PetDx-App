import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllScans, deleteScan } from '../../utils/database';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const STATUS_BAR_HEIGHT  = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 50;
const HEADER_EXPANDED_H  = 90 + STATUS_BAR_HEIGHT;
const HEADER_COLLAPSED_H = 52 + STATUS_BAR_HEIGHT;
const COLLAPSE_SCROLL    = 80;

const CARD_ACCENTS = [
  ['#7B5FFF', '#A98BFF'],
  ['#FF6B4E', '#FF9F7B'],
  ['#3DBE6E', '#7DDFA0'],
  ['#FFB800', '#FFD966'],
  ['#00C2FF', '#60D6FF'],
];

// Scan Card
function ScanCard({ item, index, onDelete }) {
  const accent        = CARD_ACCENTS[index % CARD_ACCENTS.length];
  const mountAnim     = useRef(new Animated.Value(0)).current;
  const slideAnim     = useRef(new Animated.Value(28)).current;
  const deleteScale   = useRef(new Animated.Value(1)).current;
  const deleteOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountAnim, {
        toValue: 1,
        duration: 380,
        delay: index * 65,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 80,
        delay: index * 65,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Animated.parallel([
              Animated.timing(deleteScale, {
                toValue: 0.88,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(deleteOpacity, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
              }),
            ]).start(() => onDelete(item.id));
          },
        },
      ]
    );
  };

  const formattedDate = new Date(item.timestamp).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Determine scan type from data
  const isBreedOnly   = item.disease === 'N/A';
  const isDiseaseOnly = item.breed === 'N/A';
  const scanTypeLabel = isBreedOnly ? 'Breed' : isDiseaseOnly ? 'Disease' : 'Both';
  const scanTypeIcon  = isBreedOnly ? 'paw' : isDiseaseOnly ? 'medical' : 'scan';
  const scanTypeColor = isBreedOnly ? '#A98BFF' : isDiseaseOnly ? '#FF9F7B' : '#7DDFA0';

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: Animated.multiply(mountAnim, deleteOpacity),
          transform: [
            { translateY: slideAnim },
            { scale: deleteScale },
          ],
        },
      ]}
    >
      <View style={[styles.cardGlowSlab, { backgroundColor: accent[0] + '30' }]} />

      <BlurView intensity={22} tint="dark" style={styles.card}>
        <LinearGradient
          colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.02)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardTopBorder} />

        {/* Thumbnail */}
        <View style={styles.thumbnailWrapper}>
          <LinearGradient
            colors={accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.thumbnailRing}
          />
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Ionicons name="image-outline" size={22} color="rgba(255,255,255,0.3)" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoBlock}>

          {/* Scan type badge */}
          <View style={styles.scanTypeBadge}>
            <Ionicons name={scanTypeIcon} size={11} color={scanTypeColor} />
            <Text style={[styles.scanTypeText, { color: scanTypeColor }]}>
              {scanTypeLabel} Scan
            </Text>
          </View>

          {/* Breed row */}
          {!isDiseaseOnly && (
            <View style={styles.resultRow}>
              <Ionicons name="paw-outline" size={12} color="rgba(169,139,255,0.7)" />
              <Text style={styles.resultLabel} numberOfLines={1}>
                {item.breed}
              </Text>
              <Text style={styles.resultConf}>
                {(item.breedConfidence * 100).toFixed(0)}%
              </Text>
            </View>
          )}

          {/* Disease row */}
          {!isBreedOnly && (
            <View style={styles.resultRow}>
              <Ionicons name="medical-outline" size={12} color="rgba(255,159,123,0.7)" />
              <Text style={styles.resultLabel} numberOfLines={1}>
                {item.disease}
              </Text>
              <Text style={styles.resultConf}>
                {(item.diseaseConfidence * 100).toFixed(0)}%
              </Text>
            </View>
          )}

          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        {/* Delete */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDeletePress}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <BlurView intensity={16} tint="dark" style={styles.deleteBtnInner}>
            <LinearGradient
              colors={['rgba(255,107,78,0.22)', 'rgba(255,107,78,0.06)']}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="trash-outline" size={17} color="#FF6B4E" />
          </BlurView>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
}

// Empty State
function EmptyState({ mountAnim }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.00, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[styles.emptyContainer, { opacity: mountAnim }]}>
      <Animated.View style={[styles.emptyOrb, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={['rgba(123,95,255,0.22)', 'rgba(123,95,255,0.06)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.emptyOrbRing} />
        <Ionicons name="time-outline" size={48} color="rgba(169,139,255,0.65)" />
      </Animated.View>
      <Text style={styles.emptyTitle}>No scans yet</Text>
      <Text style={styles.emptySubtitle}>
        Your scan history will appear here once you start scanning your pet
      </Text>
    </Animated.View>
  );
}

// Loading State
function LoadingState() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#A98BFF" />
      <Text style={styles.loadingText}>Loading scans...</Text>
    </View>
  );
}

// Main Screen
export default function HistoryScreen() {
  const [scans, setScans]       = useState([]);
  const [loading, setLoading]   = useState(true);

  const scrollY   = useRef(new Animated.Value(0)).current;
  const mountAnim = useRef(new Animated.Value(0)).current;

  const orb1Y = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -65], extrapolate: 'clamp' });
  const orb2Y = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -38], extrapolate: 'clamp' });
  const orb3Y = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -22], extrapolate: 'clamp' });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, COLLAPSE_SCROLL],
    outputRange: [HEADER_EXPANDED_H, HEADER_COLLAPSED_H],
    extrapolate: 'clamp',
  });
  const headerOverlayOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_SCROLL],
    outputRange: [0, 0.72],
    extrapolate: 'clamp',
  });
  const titleFontSize = scrollY.interpolate({
    inputRange: [0, COLLAPSE_SCROLL],
    outputRange: [22, 17],
    extrapolate: 'clamp',
  });
  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_SCROLL * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    Animated.timing(mountAnim, { toValue: 1, duration: 480, useNativeDriver: true }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadScans();
    }, [])
  );

  const loadScans = async () => {
    setLoading(true);
    const data = await getAllScans();
    setScans(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const success = await deleteScan(id);
    if (success) {
      setScans((prev) => prev.filter((s) => s.id !== id));
    } else {
      Alert.alert('Error', 'Failed to delete scan. Please try again.');
    }
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

      <Animated.View style={[styles.glowOrb, styles.orb1, { transform: [{ translateY: orb1Y }] }]} />
      <Animated.View style={[styles.glowOrb, styles.orb2, { transform: [{ translateY: orb2Y }] }]} />
      <Animated.View style={[styles.glowOrb, styles.orb3, { transform: [{ translateY: orb3Y }] }]} />

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : scans.length === 0 ? (
        <EmptyState mountAnim={mountAnim} />
      ) : (
        <Animated.FlatList
          data={scans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <ScanCard item={item} index={index} onDelete={handleDelete} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: HEADER_EXPANDED_H + 12 },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <Animated.View style={[styles.countBadge, { opacity: mountAnim }]}>
              <BlurView intensity={18} tint="dark" style={styles.countBadgeInner}>
                <LinearGradient
                  colors={['rgba(123,95,255,0.18)', 'rgba(123,95,255,0.05)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.countBadgeBorder} />
                <Ionicons name="layers-outline" size={14} color="#A98BFF" style={{ marginRight: 6 }} />
                <Text style={styles.countBadgeText}>
                  {scans.length} scan{scans.length !== 1 ? 's' : ''} recorded
                </Text>
              </BlurView>
            </Animated.View>
          }
        />
      )}

      {/* Fixed Glass Header */}
      <Animated.View style={[styles.fixedHeader, { height: headerHeight }]} pointerEvents="box-none">
        <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,8,32,1)', opacity: headerOverlayOpacity }]}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['rgba(123,95,255,0.35)', 'rgba(123,95,255,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.headerBorder} pointerEvents="none" />

        <View style={[styles.headerInner, { paddingTop: STATUS_BAR_HEIGHT }]}>
          <View style={styles.headerLeft}>
            <Animated.Text style={[styles.headerTitle, { fontSize: titleFontSize }]}>
              Scan History
            </Animated.Text>
            <Animated.Text style={[styles.headerSubtitle, { opacity: subtitleOpacity }]}>
              Your pet diagnosis records
            </Animated.Text>
          </View>
          <View style={styles.headerIconWrap}>
            <BlurView intensity={20} tint="dark" style={styles.headerIconBlur}>
              <LinearGradient
                colors={['rgba(123,95,255,0.28)', 'rgba(123,95,255,0.08)']}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="time" size={20} color="#A98BFF" />
            </BlurView>
          </View>
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
    elevation: 0,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: '#FF6B4E',
    top: height * 0.42,
    right: -80,
    elevation: 0,
  },
  orb3: {
    width: 200,
    height: 200,
    backgroundColor: '#00C2FF',
    bottom: 100,
    left: -55,
    elevation: 0,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  countBadge: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(123,95,255,0.22)',
    alignSelf: 'flex-start',
    elevation: 4,
  },
  countBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(10,8,28,0.70)',
  },
  countBadgeBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(169,139,255,0.30)',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(169,139,255,0.85)',
    letterSpacing: 0.3,
  },

  // Card
  cardWrapper: {
    marginBottom: 14,
  },
  cardGlowSlab: {
    position: 'absolute',
    top: 4, left: 8, right: 8, bottom: -3,
    borderRadius: 20,
    elevation: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    elevation: 6,
    backgroundColor: 'rgba(10,8,28,0.78)',
  },
  cardTopBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    zIndex: 2,
  },

  // Thumbnail
  thumbnailWrapper: {
    width: 68,
    height: 68,
    borderRadius: 16,
    marginRight: 14,
    padding: 2,
  },
  thumbnailRing: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 16,
    opacity: 0.70,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    resizeMode: 'cover',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  thumbnailPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Info
  infoBlock: {
    flex: 1,
    gap: 4,
  },
  scanTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  scanTypeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  resultLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  resultConf: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  date: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 1,
    letterSpacing: 0.15,
  },

  // Delete
  deleteBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,107,78,0.25)',
    elevation: 3,
  },
  deleteBtnInner: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(10,8,28,0.70)',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyOrb: {
    width: 120,
    height: 120,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 8,
  },
  emptyOrbRing: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: 'rgba(169,139,255,0.30)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.38)',
    textAlign: 'center',
    lineHeight: 21,
    letterSpacing: 0.2,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(169,139,255,0.7)',
    letterSpacing: 0.3,
  },

  // Fixed header
  fixedHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    overflow: 'hidden',
    elevation: 20,
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 14,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.48)',
    marginTop: 3,
    letterSpacing: 0.2,
  },
  headerIconWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(123,95,255,0.28)',
    elevation: 4,
  },
  headerIconBlur: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(10,8,28,0.70)',
  },
});