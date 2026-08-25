import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 50;

const BREEDS = [
  { id: 'abyssinian', name: 'Abyssinian Cat', type: 'cat', image: require('../../assets/info/Abyssinian-Cat-Breed_0.webp') },
  { id: 'birman', name: 'Birman Cat', type: 'cat', image: require('../../assets/info/Birman-Cat-Breed.webp') },
  { id: 'persian', name: 'Persian Cat', type: 'cat', image: require('../../assets/info/Persian-Long-Hair.webp') },
  { id: 'ragdoll', name: 'Ragdoll Cat', type: 'cat', image: require('../../assets/info/Ragdoll.webp') },
  { id: 'siamese', name: 'Siamese Cat', type: 'cat', image: require('../../assets/info/Siamese-Cat_0.webp') },
  { id: 'american_bulldog', name: 'American Bulldog', type: 'dog', image: require('../../assets/info/BREED Hero American Bulldog.webp') },
  { id: 'boxer', name: 'Boxer', type: 'dog', image: require('../../assets/info/Boxer.webp') },
  { id: 'german_shorthaired', name: 'German Shorthaired', type: 'dog', image: require('../../assets/info/German-Short-Haired-Pointer.webp') },
  { id: 'pomeranian', name: 'Pomeranian', type: 'dog', image: require('../../assets/info/Pomeranian.webp') },
  { id: 'pug', name: 'Pug', type: 'dog', image: require('../../assets/info/Pug.webp') },
];

const DISEASES = [
  { id: 'demodicosis_dog', name: 'Demodicosis', species: 'Dog', image: require('../../assets/info/demodicosis.jpg') },
  { id: 'dermatitis_dog', name: 'Dermatitis', species: 'Dog', image: require('../../assets/info/dermatitis.webp') },
  { id: 'flea_allergy_cat', name: 'Flea Allergy', species: 'Cat', image: require('../../assets/info/flea_allergy.webp') },
  { id: 'fungal_infections_dog', name: 'Fungal Infections', species: 'Dog', image: require('../../assets/info/fungal_infections.jpg') },
  { id: 'hypersensitivity_dog', name: 'Hypersensitivity', species: 'Dog', image: require('../../assets/info/hypersensitivity.jpg') },
  { id: 'ringworm_cat', name: 'Ringworm', species: 'Cat', image: require('../../assets/info/ringworm_cat.webp') },
  { id: 'ringworm_dog', name: 'Ringworm', species: 'Dog', image: require('../../assets/info/ringworm_dog.jpg') },
  { id: 'scabies_cat', name: 'Scabies', species: 'Cat', image: require('../../assets/info/scabies.jpg') },
];


// Detailed information about breeds
const BREED_DETAILS = {
  'Abyssinian Cat': {
    origin: 'Ethiopia (formerly Abyssinia)',
    lifespan: '12-15 years',
    temperament: 'Active, Playful, Curious',
    size: 'Medium',
    grooming: 'Low to Moderate',
    description: 'The Abyssinian is one of the oldest known cat breeds, known for their ticked coat and active, playful personality. They are intelligent and love to explore their surroundings.',
  },
  'Birman Cat': {
    origin: 'Burma (Myanmar)',
    lifespan: '12-16 years',
    temperament: 'Gentle, Affectionate, Calm',
    size: 'Medium to Large',
    grooming: 'Moderate to High',
    description: 'Birmans are known for their striking blue eyes, white "gloves" on their paws, and silky coat. They are affectionate and social cats that bond strongly with their families.',
  },
  'Persian Cat': {
    origin: 'Persia (Iran)',
    lifespan: '12-17 years',
    temperament: 'Calm, Quiet, Sweet-natured',
    size: 'Medium to Large',
    grooming: 'High',
    description: 'Persians are famous for their long, luxurious coat and sweet expression. They are quiet, gentle cats that enjoy a calm environment and regular grooming.',
  },
  'Ragdoll Cat': {
    origin: 'United States',
    lifespan: '12-15 years',
    temperament: 'Docile, Relaxed, Affectionate',
    size: 'Large',
    grooming: 'Moderate',
    description: 'Ragdolls are known for their tendency to go limp when held, like a ragdoll. They are large, affectionate cats that often follow their owners from room to room.',
  },
  'Siamese Cat': {
    origin: 'Thailand (formerly Siam)',
    lifespan: '12-20 years',
    temperament: 'Vocal, Social, Intelligent',
    size: 'Medium',
    grooming: 'Low',
    description: 'Siamese cats are known for their sleek bodies, striking blue almond-shaped eyes, and vocal nature. They are highly social and demand attention from their owners.',
  },
  'American Bulldog': {
    origin: 'United States',
    lifespan: '10-15 years',
    temperament: 'Confident, Loyal, Protective',
    size: 'Large',
    grooming: 'Low',
    description: 'American Bulldogs are confident, loyal, and protective companions. They are strong and athletic, requiring regular exercise and firm, consistent training.',
  },
  'Boxer': {
    origin: 'Germany',
    lifespan: '10-12 years',
    temperament: 'Playful, Energetic, Loyal',
    size: 'Medium to Large',
    grooming: 'Low',
    description: 'Boxers are known for their playful, energetic nature and strong loyalty to their families. They are great with children and make excellent guard dogs.',
  },
  'German Shorthaired': {
    origin: 'Germany',
    lifespan: '12-14 years',
    temperament: 'Intelligent, Energetic, Trainable',
    size: 'Large',
    grooming: 'Low',
    description: 'The German Shorthaired Pointer is a versatile hunting dog known for its intelligence and energy. They require plenty of exercise and mental stimulation.',
  },
  'Pomeranian': {
    origin: 'Pomerania (Germany/Poland)',
    lifespan: '12-16 years',
    temperament: 'Lively, Bold, Intelligent',
    size: 'Small',
    grooming: 'High',
    description: 'Pomeranians are tiny dogs with big personalities. They are lively, bold, and intelligent, making them excellent companions for those who can manage their grooming needs.',
  },
  'Pug': {
    origin: 'China',
    lifespan: '12-15 years',
    temperament: 'Charming, Playful, Affectionate',
    size: 'Small',
    grooming: 'Moderate',
    description: 'Pugs are charming, playful dogs known for their wrinkled faces and curly tails. They are affectionate companions that thrive on human interaction.',
  },
};

// Detailed information about diseases
const DISEASE_DETAILS = {
  'Demodicosis': {
    species: 'Dog',
    cause: 'Demodex mites (normally present in small numbers on dog skin)',
    symptoms: 'Hair loss, redness, scaling, itching (in some cases), skin infections',
    treatment: 'Topical or oral medications, medicated shampoos, addressing underlying health issues',
    prevention: 'Maintain good overall health, regular vet check-ups, prompt treatment of underlying conditions',
  },
  'Dermatitis': {
    species: 'Dog',
    cause: 'Allergies (food, environmental), parasites, infections, irritants',
    symptoms: 'Itching, redness, inflammation, rash, skin lesions, hair loss',
    treatment: 'Identify and eliminate cause, medications (antihistamines, steroids), topical treatments, allergy shots',
    prevention: 'Regular grooming, flea prevention, hypoallergenic diet if needed, avoid known irritants',
  },
  'Flea Allergy': {
    species: 'Cat',
    cause: 'Allergic reaction to flea saliva',
    symptoms: 'Intense itching, hair loss (especially base of tail), redness, scabs, skin infections',
    treatment: 'Flea control products, antihistamines, corticosteroids, antibiotics for secondary infections',
    prevention: 'Regular flea prevention year-round, treat all pets in household, clean environment thoroughly',
  },
  'Fungal Infections': {
    species: 'Dog',
    cause: 'Fungi (e.g., ringworm, yeast)',
    symptoms: 'Circular patches of hair loss, scaling, crusting, redness, itching',
    treatment: 'Antifungal medications (topical or oral), medicated shampoos, environmental cleaning',
    prevention: 'Keep skin clean and dry, avoid contact with infected animals, maintain good hygiene',
  },
  'Hypersensitivity': {
    species: 'Dog',
    cause: 'Overreaction of immune system to allergens (food, pollen, dust mites, etc.)',
    symptoms: 'Itching, skin rashes, ear infections, gastrointestinal issues, respiratory problems',
    treatment: 'Avoid allergens, antihistamines, corticosteroids, immunotherapy, special diet',
    prevention: 'Identify triggers through allergy testing, environmental control, proper nutrition',
  },
  'Ringworm': {
    species: 'Cat & Dog',
    cause: 'Fungal infection (dermatophytes)',
    symptoms: 'Circular hairless patches, scaling, crusting, redness, brittle nails',
    treatment: 'Topical antifungal creams, oral antifungal medications, medicated dips or shampoos',
    prevention: 'Avoid contact with infected animals, clean environment thoroughly, good hygiene',
  },
  'Scabies': {
    species: 'Cat',
    cause: 'Sarcoptes scabiei mites (highly contagious)',
    symptoms: 'Intense itching, hair loss, crusting skin, thickened skin, secondary infections',
    treatment: 'Prescription antiparasitic medications, lime sulfur dips, environmental treatment',
    prevention: 'Avoid contact with infected animals, regular parasite prevention, quarantine new pets',
  },
};

export default function InfoScreen() {
  const [selectedTab, setSelectedTab] = useState('breeds');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  const router = useRouter();
  const mountAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Orb parallax
  const orb1Y = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -65], extrapolate: 'clamp' });
  const orb2Y = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -38], extrapolate: 'clamp' });
  const orb3Y = scrollY.interpolate({ inputRange: [0, height], outputRange: [0, -22], extrapolate: 'clamp' });

  useEffect(() => {
    Animated.timing(mountAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const getFilteredBreeds = () => {
    if (filterType === 'all') return BREEDS;
    return BREEDS.filter(breed => breed.type === filterType);
  };

  const getFilteredDiseases = () => {
    if (speciesFilter === 'all') return DISEASES;
    return DISEASES.filter(disease => disease.species.toLowerCase() === speciesFilter);
  };

  const renderBreedCard = (breed) => (
    <TouchableOpacity
      key={breed.id}
      style={styles.cardWrapper}
      onPress={() => setSelectedItem({ type: 'breed', data: breed, details: BREED_DETAILS[breed.name] })}
      activeOpacity={0.8}
    >
      <BlurView intensity={22} tint="dark" style={styles.card}>
        <LinearGradient
          colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.02)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardTopBorder} />

        <View style={styles.cardImageContainer}>
          <Image source={breed.image} style={styles.cardImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.cardImageGradient}
          />
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{breed.type === 'cat' ? '🐱 Cat' : '🐶 Dog'}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{breed.name}</Text>
          <View style={styles.cardMeta}>
            <Ionicons name="information-circle-outline" size={16} color="#A98BFF" />
            <Text style={styles.cardMetaText}>Tap for details</Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderDiseaseCard = (disease) => (
    <TouchableOpacity
      key={disease.id}
      style={styles.cardWrapper}
      onPress={() => setSelectedItem({ type: 'disease', data: disease, details: DISEASE_DETAILS[disease.name] })}
      activeOpacity={0.8}
    >
      <BlurView intensity={22} tint="dark" style={styles.card}>
        <LinearGradient
          colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.02)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardTopBorder} />

        <View style={styles.cardImageContainer}>
          <Image source={disease.image} style={styles.cardImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.cardImageGradient}
          />
          <View style={[styles.typeBadge, { backgroundColor: disease.species === 'Cat' ? 'rgba(255,107,78,0.9)' : 'rgba(61,190,110,0.9)' }]}>
            <Text style={styles.typeBadgeText}>{disease.species === 'Cat' ? '🐱 Cat' : '🐶 Dog'}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{disease.name}</Text>
          <View style={styles.cardMeta}>
            <Ionicons name="medical-outline" size={16} color="#FF6B4E" />
            <Text style={styles.cardMetaText}>Symptoms & treatment</Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedItem) return null;

    const { type, data, details } = selectedItem;

    return (
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedItem(null)}
        />
        <Animated.View style={[styles.modalContent, { transform: [{ scale: mountAnim }] }]}>
          <LinearGradient
            colors={['#0A0820', '#150D38']}
            style={StyleSheet.absoluteFill}
          />

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setSelectedItem(null)}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalImageContainer}>
              <Image
                source={data.image}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.modalImageGradient}
              />
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>{data.name}</Text>

              {type === 'breed' ? (
                <>
                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={20} color="#A98BFF" />
                      <Text style={styles.detailLabel}>Origin:</Text>
                      <Text style={styles.detailValue}>{details.origin}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={20} color="#A98BFF" />
                      <Text style={styles.detailLabel}>Lifespan:</Text>
                      <Text style={styles.detailValue}>{details.lifespan}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="happy-outline" size={20} color="#A98BFF" />
                      <Text style={styles.detailLabel}>Temperament:</Text>
                      <Text style={styles.detailValue}>{details.temperament}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="resize-outline" size={20} color="#A98BFF" />
                      <Text style={styles.detailLabel}>Size:</Text>
                      <Text style={styles.detailValue}>{details.size}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="cut-outline" size={20} color="#A98BFF" />
                      <Text style={styles.detailLabel}>Grooming:</Text>
                      <Text style={styles.detailValue}>{details.grooming}</Text>
                    </View>
                  </View>

                  <View style={styles.descriptionSection}>
                    <Text style={styles.sectionTitle}>About this breed</Text>
                    <Text style={styles.descriptionText}>{details.description}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <Ionicons name="alert-circle-outline" size={20} color="#FF6B4E" />
                      <Text style={styles.detailLabel}>Cause:</Text>
                      <Text style={styles.detailValue}>{details.cause}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="warning-outline" size={20} color="#FF6B4E" />
                      <Text style={styles.detailLabel}>Symptoms:</Text>
                      <Text style={styles.detailValue}>{details.symptoms}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="medkit-outline" size={20} color="#FF6B4E" />
                      <Text style={styles.detailLabel}>Treatment:</Text>
                      <Text style={styles.detailValue}>{details.treatment}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="shield-checkmark-outline" size={20} color="#FF6B4E" />
                      <Text style={styles.detailLabel}>Prevention:</Text>
                      <Text style={styles.detailValue}>{details.prevention}</Text>
                    </View>
                  </View>

                  <View style={styles.descriptionSection}>
                    <Text style={styles.sectionTitle}>Important Note</Text>
                    <Text style={styles.descriptionText}>
                      Always consult with a veterinarian for proper diagnosis and treatment. Early detection and treatment lead to better outcomes.
                    </Text>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
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
        <LinearGradient
          colors={['rgba(123,95,255,0.35)', 'rgba(123,95,255,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerBorder} />

        <View style={[styles.headerInner, { paddingTop: STATUS_BAR_HEIGHT }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <LinearGradient colors={['#7B5FFF', '#A98BFF']} style={styles.headerIconGradient}>
              <Ionicons name="library-outline" size={28} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Info Library</Text>
              <Text style={styles.headerSubtitle}>Breeds & diseases guide</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: STATUS_BAR_HEIGHT + 120 }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'breeds' && styles.tabActive]}
            onPress={() => setSelectedTab('breeds')}
          >
            {selectedTab === 'breeds' && (
              <LinearGradient
                colors={['rgba(123,95,255,0.25)', 'rgba(123,95,255,0.08)']}
                style={StyleSheet.absoluteFill}
              />
            )}
            <Ionicons name="paw-outline" size={20} color={selectedTab === 'breeds' ? '#A98BFF' : 'rgba(255,255,255,0.5)'} />
            <Text style={[styles.tabText, selectedTab === 'breeds' && styles.tabTextActive]}>Breeds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'diseases' && styles.tabActive]}
            onPress={() => setSelectedTab('diseases')}
          >
            {selectedTab === 'diseases' && (
              <LinearGradient
                colors={['rgba(255,107,78,0.25)', 'rgba(255,107,78,0.08)']}
                style={StyleSheet.absoluteFill}
              />
            )}
            <Ionicons name="medical-outline" size={20} color={selectedTab === 'diseases' ? '#FF6B4E' : 'rgba(255,255,255,0.5)'} />
            <Text style={[styles.tabText, selectedTab === 'diseases' && styles.tabTextActive]}>Diseases</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {selectedTab === 'breeds' && (
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filterType === 'dog' && styles.filterChipActive]}
              onPress={() => setFilterType('dog')}
            >
              <Text style={[styles.filterText, filterType === 'dog' && styles.filterTextActive]}>🐶 Dogs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filterType === 'cat' && styles.filterChipActive]}
              onPress={() => setFilterType('cat')}
            >
              <Text style={[styles.filterText, filterType === 'cat' && styles.filterTextActive]}>🐱 Cats</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedTab === 'diseases' && (
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterChip, speciesFilter === 'all' && styles.filterChipActive]}
              onPress={() => setSpeciesFilter('all')}
            >
              <Text style={[styles.filterText, speciesFilter === 'all' && styles.filterTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, speciesFilter === 'dog' && styles.filterChipActive]}
              onPress={() => setSpeciesFilter('dog')}
            >
              <Text style={[styles.filterText, speciesFilter === 'dog' && styles.filterTextActive]}>🐶 Dogs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, speciesFilter === 'cat' && styles.filterChipActive]}
              onPress={() => setSpeciesFilter('cat')}
            >
              <Text style={[styles.filterText, speciesFilter === 'cat' && styles.filterTextActive]}>🐱 Cats</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Grid Cards */}
        <View style={styles.gridContainer}>
          {selectedTab === 'breeds'
            ? getFilteredBreeds().map(renderBreedCard)
            : getFilteredDiseases().map(renderDiseaseCard)
          }
        </View>

        <View style={styles.footer} />
      </Animated.ScrollView>

      {renderDetailModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0820' },
  glowOrb: { position: 'absolute', borderRadius: 999, opacity: 0.28 },
  orb1: { width: 320, height: 320, backgroundColor: '#7B5FFF', top: -110, left: -90 },
  orb2: { width: 250, height: 250, backgroundColor: '#FF6B4E', top: height * 0.42, right: -80 },
  orb3: { width: 200, height: 200, backgroundColor: '#00C2FF', bottom: 100, left: -55 },

  fixedHeader: { position: 'absolute', top: 0, left: 0, right: 0, height: 110 + STATUS_BAR_HEIGHT, zIndex: 100, overflow: 'hidden' },
  headerBorder: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  headerInner: { flex: 1, paddingHorizontal: 20, paddingBottom: 14 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(123,95,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconGradient: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.48)', marginTop: 2 },

  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: 18, paddingBottom: 40 },


  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    backgroundColor: 'rgba(10,8,28,0.5)',
    borderRadius: 30,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(123,95,255,0.2)'
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 26,
    gap: 8,
    overflow: 'hidden',
    borderWidth: 1,                            
  borderColor: 'transparent', 
  },
  tabActive: {
    backgroundColor: 'rgba(123,95,255,0.15)',
    borderWidth: 0,
    borderColor: 'rgba(123,95,255,0.3)'
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  filterContainer: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(123,95,255,0.3)', backgroundColor: 'rgba(10,8,28,0.5)' },
  filterChipActive: { backgroundColor: 'rgba(123,95,255,0.2)', borderColor: '#7B5FFF' },
  filterText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  filterTextActive: { color: '#A98BFF' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrapper: { width: '48%', marginBottom: 16 },
  card: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(10,8,28,0.78)' },
  cardTopBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.16)', zIndex: 2 },
  cardImageContainer: { height: 140, position: 'relative' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardImageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  typeBadge: { position: 'absolute', top: 8, right: 8, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, backgroundColor: 'rgba(123,95,255,0.9)' },
  typeBadgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardMetaText: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 200, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContent: { width: width * 0.9, maxHeight: height * 0.85, borderRadius: 24, overflow: 'hidden', backgroundColor: '#0A0820', borderWidth: 1, borderColor: 'rgba(123,95,255,0.3)' },
  modalCloseButton: { position: 'absolute', top: 16, right: 16, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalImageContainer: {
    height: 250,
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  modalImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  modalBody: { padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
  detailSection: { marginBottom: 20, gap: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' },
  detailLabel: { fontSize: 14, fontWeight: '600', color: '#A98BFF', minWidth: 100 },
  detailValue: { fontSize: 14, color: 'rgba(255,255,255,0.8)', flex: 1 },
  descriptionSection: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  descriptionText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 22 },
  footer: { height: 20 },
});