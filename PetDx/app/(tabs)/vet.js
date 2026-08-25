import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  Linking,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 50;

const GOOGLE_PLACES_API_KEY = 'AIzaSyAEo4YQLzQioJ0Ysh6egQThEDRqQZmIKqQ';

// Clinic card accent colors
const CARD_ACCENTS = [
  ['#7B5FFF', '#A98BFF'],
  ['#FF6B4E', '#FF9F7B'],
  ['#3DBE6E', '#7DDFA0'],
  ['#FFB800', '#FFD966'],
  ['#00C2FF', '#60D6FF'],
];

export default function VetScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5000);
  const mapRef = useRef(null);
  
  // Animations
  const mountAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const orb1Y = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -65], extrapolate: 'clamp' });
  const orb2Y = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -38], extrapolate: 'clamp' });
  const orb3Y = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -22], extrapolate: 'clamp' });

  useEffect(() => {
    Animated.timing(mountAnim, { toValue: 1, duration: 480, useNativeDriver: true }).start();
  }, []);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchNearbyVets = async (latitude, longitude) => {
    try {
      setIsLoading(true);
      
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${searchRadius}&type=veterinary_care&key=${GOOGLE_PLACES_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const clinicsWithDistance = data.results.map((place) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity || place.formatted_address || 'Address not available',
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          phone: place.international_phone_number || null,
          rating: place.rating || null,
          userRatingsTotal: place.user_ratings_total || 0,
          openNow: place.opening_hours?.open_now || false,
          distance: getDistance(
            latitude,
            longitude,
            place.geometry.location.lat,
            place.geometry.location.lng
          ),
        }));
        
        const sortedClinics = clinicsWithDistance
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10);
        
        setClinics(sortedClinics);
        
        // Fit map to show all clinics
        setTimeout(() => {
          if (mapRef.current && sortedClinics.length > 0) {
            const points = [
              { latitude, longitude },
              ...sortedClinics.map(clinic => ({
                latitude: clinic.latitude,
                longitude: clinic.longitude,
              })),
            ];
            
            mapRef.current.fitToCoordinates(points, {
              edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
              animated: true,
            });
          }
        }, 500);
      } else {
        Alert.alert('No Clinics', 'No veterinary clinics found nearby.');
        setClinics([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch nearby clinics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationAndClinics = async () => {
    try {
      setIsLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location to find nearby vets.');
        setIsLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = loc.coords;
      setUserLocation(coords);
      
      await fetchNearbyVets(coords.latitude, coords.longitude);
      
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location. Please try again.');
      setIsLoading(false);
    }
  };

  const ClinicCard = ({ item, index }) => {
    const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
    const phoneNumber = item.phone;
    
    return (
      <Animated.View style={[styles.cardWrapper, { opacity: mountAnim }]}>
        <View style={[styles.cardGlowSlab, { backgroundColor: accent[0] + '30' }]} />
        
        <BlurView intensity={22} tint="dark" style={styles.card}>
          <LinearGradient
            colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.02)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardTopBorder} />

          <View style={styles.rankWrapper}>
            <LinearGradient
              colors={accent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.rankBadge}
            >
              <Text style={styles.rankText}>{index + 1}</Text>
            </LinearGradient>
          </View>

          <View style={styles.clinicInfo}>
            <Text style={styles.clinicName}>{item.name}</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.detailText} numberOfLines={2}>{item.address}</Text>
            </View>
            
            {phoneNumber && (
              <TouchableOpacity 
                style={styles.detailRow} 
                onPress={() => Linking.openURL(`tel:${phoneNumber.replace(/\s+/g, '')}`)}
              >
                <Ionicons name="call-outline" size={14} color="rgba(255,255,255,0.5)" />
                <Text style={[styles.detailText, styles.phoneText]}>{phoneNumber}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.bottomRow}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.ratingText}>
                  {item.rating ? item.rating.toFixed(1) : 'N/A'}
                </Text>
                {item.userRatingsTotal > 0 && (
                  <Text style={styles.ratingCount}>({item.userRatingsTotal})</Text>
                )}
              </View>

              <View style={styles.distanceContainer}>
                <Ionicons name="navigate-outline" size={14} color={accent[0]} />
                <Text style={[styles.distanceText, { color: accent[0] }]}>
                  {item.distance.toFixed(1)} km
                </Text>
              </View>

              <View style={[
                styles.statusBadge,
                { backgroundColor: item.openNow ? 'rgba(61,190,110,0.15)' : 'rgba(255,107,78,0.15)' }
              ]}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: item.openNow ? '#3DBE6E' : '#FF6B4E' }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: item.openNow ? '#3DBE6E' : '#FF6B4E' }
                ]}>
                  {item.openNow ? 'Open' : 'Closed'}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.directionsButton, { borderColor: accent[0] + '50' }]}
              onPress={() => {
                const url = Platform.select({
                  ios: `maps://app?daddr=${item.latitude},${item.longitude}&dirflg=d`,
                  android: `google.navigation:q=${item.latitude},${item.longitude}`,
                });
                
                Linking.canOpenURL(url).then(supported => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`);
                  }
                });
              }}
            >
              <LinearGradient
                colors={[accent[0] + '20', accent[0] + '05']}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="navigate" size={16} color={accent[0]} />
              <Text style={[styles.directionsText, { color: accent[0] }]}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    );
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

      {/* Header */}
      <Animated.View style={[styles.fixedHeader]} pointerEvents="box-none">
        <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,8,32,0.72)' }]} />
        <LinearGradient
          colors={['rgba(123,95,255,0.35)', 'rgba(123,95,255,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerBorder} />

        <View style={[styles.headerInner, { paddingTop: STATUS_BAR_HEIGHT }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Find a Vet</Text>
            <Text style={styles.headerSubtitle}>Nearby veterinary clinics</Text>
          </View>
          <View style={styles.headerIconWrap}>
            <BlurView intensity={20} tint="dark" style={styles.headerIconBlur}>
              <LinearGradient
                colors={['rgba(123,95,255,0.28)', 'rgba(123,95,255,0.08)']}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="medical" size={20} color="#A98BFF" />
            </BlurView>
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: STATUS_BAR_HEIGHT + 90 }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Location Button */}
        <TouchableOpacity 
          style={styles.locationButton} 
          onPress={getLocationAndClinics}
          disabled={isLoading}
        >
          <BlurView intensity={22} tint="dark" style={styles.buttonBlur}>
            <LinearGradient
              colors={['rgba(123,95,255,0.25)', 'rgba(123,95,255,0.1)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.buttonBorder} />
            <Ionicons name="location" size={22} color="#A98BFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {isLoading ? 'Searching...' : 'Find Nearby Vets'}
            </Text>
          </BlurView>
        </TouchableOpacity>

        {/* Radius Selector */}
        {userLocation && (
          <View style={styles.radiusSelector}>
            <Text style={styles.radiusLabel}>Search radius: {searchRadius/1000}km</Text>
            <View style={styles.radiusButtons}>
              {[3, 5, 10].map(km => (
                <TouchableOpacity
                  key={km}
                  style={[
                    styles.radiusButton,
                    searchRadius === km * 1000 && styles.radiusButtonActive
                  ]}
                  onPress={() => setSearchRadius(km * 1000)}
                >
                  <Text style={[
                    styles.radiusButtonText,
                    searchRadius === km * 1000 && styles.radiusButtonTextActive
                  ]}>{km}km</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {userLocation && (
          <>
            {/* Map */}
            <View style={styles.mapContainer}>
              <BlurView intensity={22} tint="dark" style={styles.mapBlur}>
                <LinearGradient
                  colors={['rgba(123,95,255,0.15)', 'transparent']}
                  style={styles.mapGradient}
                />
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  showsUserLocation
                  showsMyLocationButton
                  initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                >
                  <Marker
                    coordinate={userLocation}
                    title="You are here"
                    pinColor="#7B5FFF"
                  />

                  {clinics.map((clinic) => (
                    <Marker
                      key={clinic.id}
                      coordinate={{
                        latitude: clinic.latitude,
                        longitude: clinic.longitude,
                      }}
                      title={clinic.name}
                    >
                      <Callout>
                        <View style={styles.calloutContainer}>
                          <Text style={styles.calloutTitle}>{clinic.name}</Text>
                          <Text style={styles.calloutText}>{clinic.address}</Text>
                          <Text style={styles.calloutText}>📏 {clinic.distance.toFixed(1)} km</Text>
                          <Text style={[
                            styles.calloutStatus,
                            { color: clinic.openNow ? '#3DBE6E' : '#FF6B4E' }
                          ]}>
                            {clinic.openNow ? '● Open' : '○ Closed'}
                          </Text>
                        </View>
                      </Callout>
                    </Marker>
                  ))}
                </MapView>
              </BlurView>
            </View>

            {/* List Header */}
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Nearby Clinics</Text>
              {clinics.length > 0 && (
                <View style={styles.listBadge}>
                  <BlurView intensity={18} tint="dark" style={styles.listBadgeInner}>
                    <LinearGradient
                      colors={['rgba(123,95,255,0.18)', 'rgba(123,95,255,0.05)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.listBadgeText}>{clinics.length} found</Text>
                  </BlurView>
                </View>
              )}
            </View>

            {/* Clinic Cards */}
            {clinics.map((clinic, index) => (
              <ClinicCard key={clinic.id} item={clinic} index={index} />
            ))}
          </>
        )}

        {!userLocation && !isLoading && (
          <Animated.View style={[styles.emptyContainer, { opacity: mountAnim }]}>
            <View style={styles.emptyOrb}>
              <LinearGradient
                colors={['rgba(123,95,255,0.22)', 'rgba(123,95,255,0.06)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.emptyOrbRing} />
              <Ionicons name="map-outline" size={48} color="rgba(169,139,255,0.65)" />
            </View>
            <Text style={styles.emptyTitle}>Find Vets Near You</Text>
            <Text style={styles.emptySubtitle}>
              Tap the button above to discover nearby veterinary clinics
            </Text>
          </Animated.View>
        )}
      </Animated.ScrollView>
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
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: '#FF6B4E',
    top: height * 0.42,
    right: -80,
  },
  orb3: {
    width: 200,
    height: 200,
    backgroundColor: '#00C2FF',
    bottom: 100,
    left: -55,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90 + STATUS_BAR_HEIGHT,
    zIndex: 100,
    overflow: 'hidden',
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
    fontSize: 24,
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
  },
  headerIconBlur: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(10,8,28,0.70)',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  locationButton: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(123,95,255,0.3)',
  },
  buttonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(10,8,28,0.70)',
  },
  buttonBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(169,139,255,0.3)',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  radiusSelector: {
    marginBottom: 16,
    alignItems: 'center',
  },
  radiusLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginBottom: 8,
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  radiusButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(123,95,255,0.3)',
  },
  radiusButtonActive: {
    backgroundColor: 'rgba(123,95,255,0.2)',
    borderColor: '#7B5FFF',
  },
  radiusButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  radiusButtonTextActive: {
    color: '#A98BFF',
  },
  mapContainer: {
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(123,95,255,0.3)',
  },
  mapBlur: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(10,8,28,0.70)',
  },
  mapGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 60,
    zIndex: 1,
  },
  map: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  listBadge: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(123,95,255,0.22)',
  },
  listBadgeInner: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(10,8,28,0.70)',
  },
  listBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(169,139,255,0.85)',
  },
  cardWrapper: {
    marginBottom: 14,
  },
  cardGlowSlab: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    bottom: -3,
    borderRadius: 20,
    elevation: 8,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(10,8,28,0.78)',
  },
  cardTopBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  rankWrapper: {
    marginRight: 14,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  clinicInfo: {
    flex: 1,
    gap: 4,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  phoneText: {
    color: '#A98BFF',
    textDecorationLine: 'underline',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  directionsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  calloutContainer: {
    padding: 8,
    maxWidth: 220,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0820',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  calloutStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyOrb: {
    width: 120,
    height: 120,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
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
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.38)',
    textAlign: 'center',
    lineHeight: 21,
  },
});