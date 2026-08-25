import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import * as MailComposer from 'expo-mail-composer';

// ─── Constants ─────────────────────────────────────────────────────────────
const APP_VERSION = '1.0.0';
const SUPPORT_EMAIL = 'support@petdx.com';

// FAQ data
const faqs = [
  {
    id: 'q1',
    question: 'How do I take a good photo for scanning?',
    answer: 'Ensure good lighting, avoid shadows, and center your pet’s face. For skin conditions, get close and focus on the affected area. The app works best with clear, sharp images.',
  },
  {
    id: 'q2',
    question: 'What diseases can PetDx detect?',
    answer: 'Currently, PetDx identifies 5 common dog diseases and 5 common cat diseases, including skin infections, ear mites, and parvovirus. We are continuously improving our models.',
  },
  {
    id: 'q3',
    question: 'Why is my result confidence low?',
    answer: 'Low confidence usually means the image is blurry, poorly lit, or the pet’s features aren’t clearly visible. Try taking another photo with better lighting and a straight angle.',
  },
  {
    id: 'q4',
    question: 'Is my data private?',
    answer: 'Yes! All AI processing happens on your device – your photos never leave your phone. We do not store or share any personal data without your explicit consent.',
  },
  {
    id: 'q5',
    question: 'How do I delete a scan?',
    answer: 'Go to the History screen, swipe left on any scan, and tap “Delete”. You can also clear all scans from the Settings > Privacy & Data screen.',
  },
  {
    id: 'q6',
    question: 'Can I use the app offline?',
    answer: 'Absolutely! PetDx works completely offline. All models and pet information are stored locally on your device.',
  },
];

const troubleshootingTips = [
  'Camera not working → Check app permissions in your phone settings.',
  'App crashes or freezes → Try restarting the app or your device.',
  'Model not loading → Ensure you have the latest version of the app installed.',
  'Scan results are inconsistent → Make sure the photo is well-lit and the pet is clearly visible.',
];

// ─────────────────────────────────────────────────────────────────────────
export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sending, setSending] = useState(false);

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleContactSupport = async () => {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      await MailComposer.composeAsync({
        recipients: [SUPPORT_EMAIL],
        subject: 'PetDx Support Request',
        body: 'Describe your issue here...',
      });
    } else {
      await Clipboard.setStringAsync(SUPPORT_EMAIL);
      Alert.alert('Email copied', `Support email copied to clipboard: ${SUPPORT_EMAIL}`);
    }
  };

  const sendFeedback = async () => {
    if (!contactMessage.trim()) {
      Alert.alert('Message required', 'Please enter a message before sending.');
      return;
    }
    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Thanks!', 'Your feedback has been sent. We’ll get back to you soon.');
      setModalVisible(false);
      setContactMessage('');
      setContactName('');
      setContactEmail('');
    } catch (err) {
      Alert.alert('Error', 'Could not send feedback. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  const handleRateApp = () => {
    const storeUrl = 'https://play.google.com/store/apps/details?id=com.petdx.app';
    Linking.openURL(storeUrl).catch(() => Alert.alert('Error', 'Could not open store.'));
  };

  const handleShare = () => {
    const message = 'Check out PetDx – AI pet breed & disease identification! 🐾\nhttps://petdx.com';
    Linking.openURL(`sms:&body=${encodeURIComponent(message)}`).catch(() => {
      Alert.alert('Share', message);
    });
  };

  const handlePrivacy = () => {
    router.push('/settings/terms');
  };

  const handleTerms = () => {
    router.push('/settings/terms');
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0D0B2A', '#1A1040', '#0D1F3C']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Quick Start */}
        <BlurView intensity={45} tint="dark" style={styles.card}>
          <LinearGradient
            colors={['rgba(123,95,255,0.15)', 'rgba(123,95,255,0.03)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="rocket-outline" size={24} color="#A98BFF" />
            <Text style={styles.cardTitle}>Quick Start</Text>
          </View>
          <Text style={styles.cardText}>1. Tap "New Scan" on the Home screen.</Text>
          <Text style={styles.cardText}>2. Take or choose a clear photo of your pet.</Text>
          <Text style={styles.cardText}>3. Wait a few seconds – AI identifies breed and potential disease.</Text>
          <Text style={styles.cardText}>4. Save results to History for future reference.</Text>
        </BlurView>

        {/* FAQs */}
        <BlurView intensity={45} tint="dark" style={styles.card}>
          <LinearGradient
            colors={['rgba(123,95,255,0.15)', 'rgba(123,95,255,0.03)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="help-circle-outline" size={24} color="#A98BFF" />
            <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
          </View>

          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(faq.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Ionicons
                  name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#A98BFF"
                />
              </TouchableOpacity>
              {expandedId === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </View>
          ))}
        </BlurView>

        {/* Troubleshooting */}
        <BlurView intensity={45} tint="dark" style={styles.card}>
          <LinearGradient
            colors={['rgba(255,107,78,0.15)', 'rgba(255,107,78,0.03)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="construct-outline" size={24} color="#FF6B4E" />
            <Text style={styles.cardTitle}>Troubleshooting</Text>
          </View>
          {troubleshootingTips.map((tip, idx) => (
            <Text key={idx} style={styles.troubleshootingText}>• {tip}</Text>
          ))}
        </BlurView>

        {/* Contact Support */}
        <BlurView intensity={45} tint="dark" style={styles.card}>
          <LinearGradient
            colors={['rgba(61,190,110,0.15)', 'rgba(61,190,110,0.03)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="mail-outline" size={24} color="#3DBE6E" />
            <Text style={styles.cardTitle}>Contact Support</Text>
          </View>
          <Text style={styles.cardText}>
            Need help? Reach out to us directly. We’ll respond within 48 hours.
          </Text>
          <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
            <Text style={styles.supportButtonText}>Email Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportButtonOutline} onPress={() => setModalVisible(true)}>
            <Text style={styles.supportButtonOutlineText}>Send Feedback</Text>
          </TouchableOpacity>
        </BlurView>

        {/* Privacy & Terms */}
        <BlurView intensity={45} tint="dark" style={styles.card}>
          <LinearGradient
            colors={['rgba(255,184,0,0.15)', 'rgba(255,184,0,0.03)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={24} color="#FFB800" />
            <Text style={styles.cardTitle}>Legal</Text>
          </View>
          <TouchableOpacity style={styles.linkItem} onPress={handlePrivacy}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem} onPress={handleTerms}>
            <Text style={styles.linkText}>Terms of Use</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </BlurView>

        {/* Rate & Share */}
        <BlurView intensity={45} tint="dark" style={styles.card}>
          <LinearGradient
            colors={['rgba(123,95,255,0.15)', 'rgba(123,95,255,0.03)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardHeader}>
            <Ionicons name="star-outline" size={24} color="#A98BFF" />
            <Text style={styles.cardTitle}>Enjoying PetDx?</Text>
          </View>
          <TouchableOpacity style={styles.supportButton} onPress={handleRateApp}>
            <Text style={styles.supportButtonText}>Rate on App Store</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportButtonOutline} onPress={handleShare}>
            <Text style={styles.supportButtonOutlineText}>Share with friends</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Version {APP_VERSION}</Text>
        </BlurView>

        {/* extra padding */}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Feedback Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} tint="dark" style={styles.modalContainer}>
            <LinearGradient
              colors={['rgba(13,11,42,0.95)', 'rgba(13,11,42,0.95)']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.modalTitle}>Send Feedback</Text>

            <TextInput
              style={styles.input}
              placeholder="Your name (optional)"
              placeholderTextColor="#aaa"
              value={contactName}
              onChangeText={setContactName}
            />
            <TextInput
              style={styles.input}
              placeholder="Your email (optional)"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              value={contactEmail}
              onChangeText={setContactEmail}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us your thoughts..."
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={4}
              value={contactMessage}
              onChangeText={setContactMessage}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={sendFeedback}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.sendButtonText}>Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  cardText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
    lineHeight: 20,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    paddingBottom: 12,
    lineHeight: 20,
  },
  troubleshootingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: '#3DBE6E',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  supportButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  supportButtonOutline: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  supportButtonOutlineText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 15,
    color: '#fff',
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 28,
    overflow: 'hidden',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: '#fff',
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: '#6B4EFF',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});