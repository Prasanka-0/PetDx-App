import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Animated, StatusBar, ActivityIndicator, useWindowDimensions, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GEMINI_API_KEY = 'AIzaSyCt4wex6l-HggCoPQonR390DZ9AgXk9rAQ';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are PawBot, a friendly and knowledgeable AI assistant for a pet health app. You help pet owners with questions about: - Pet health, symptoms, and when to see a vet - Cat and dog breeds and their characteristics - Pet nutrition and diet advice - General pet care tips and training - Understanding scan/diagnosis results from the app Keep answers concise, warm, and always recommend consulting a vet for serious health concerns. Use occasional pet-related emojis to stay friendly.`;

export default function ChatbotModal() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const topInset = insets.top > 0 ? insets.top : Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ?? 24);
  const bottomInset = insets.bottom > 0 ? insets.bottom : Platform.OS === 'ios' ? 34 : 0;
  const isSmall = height < 700;
  
  const TAB_BAR_HEIGHT = 66; // Height of navbar
  const fabBottom = bottomInset + TAB_BAR_HEIGHT + 20;
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: '0', 
      role: 'assistant', 
      text: "Hi there! I'm PawBot 🐾 Your personal pet care assistant. Ask me anything about your furry friends!", 
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const modalSlide = useRef(new Animated.Value(height)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef(null);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (!isOpen) {
      pulse.start();
    } else {
      pulse.stop();
      pulseAnim.setValue(1);
    }
    
    return () => pulse.stop();
  }, [isOpen]);

  const openModal = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.spring(modalSlide, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(fabRotate, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalSlide, {
        toValue: height,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(fabRotate, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setIsOpen(false));
  };

  const sendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;
    
    const userMsg = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: trimmed 
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    
    try {
      const contents = updatedMessages
        .filter(m => m.id !== '0')
        .map(m => ({ 
          role: m.role === 'user' ? 'user' : 'model', 
          parts: [{ text: m.text }] 
        }));
      
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        const apiErr = data?.error?.message || `HTTP ${res.status}`;
        console.error('Gemini API error:', apiErr, JSON.stringify(data));
        throw new Error(apiErr);
      }
      
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) {
        console.error('Unexpected Gemini response:', JSON.stringify(data));
        throw new Error('Empty response from Gemini');
      }
      
      setMessages(prev => [ 
        ...prev, 
        { id: (Date.now() + 1).toString(), role: 'assistant', text: reply } 
      ]);
    } catch (err) {
      console.error('Gemini error:', err.message);
      const errText = err.message?.includes('API_KEY') || err.message?.includes('key') 
        ? "Invalid API key. Please check your Gemini API key 🔑" 
        : err.message?.includes('quota') || err.message?.includes('QUOTA') 
        ? "API quota exceeded. Please check your Gemini plan 📊" 
        : `Error: ${err.message || 'Unknown error'}. Please try again 🐾`;
      
      setMessages(prev => [ 
        ...prev, 
        { id: (Date.now() + 1).toString(), role: 'assistant', text: errText } 
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [messages, isLoading]);

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <LinearGradient colors={['#7B5FFF', '#A98BFF']} style={styles.botAvatarGrad}>
              <Text style={styles.botAvatarEmoji}>🐾</Text>
            </LinearGradient>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          {isUser ? (
            <LinearGradient colors={['#7B5FFF', '#A98BFF']} style={styles.bubbleUserGrad}>
              <Text style={styles.bubbleTextUser}>{item.text}</Text>
            </LinearGradient>
          ) : (
            <BlurView intensity={35} tint="dark" style={styles.bubbleBotBlur}>
              <Text style={styles.bubbleTextBot}>{item.text}</Text>
            </BlurView>
          )}
        </View>
      </View>
    );
  };

  // Add keyboard listeners
useEffect(() => {
  const keyboardDidShowListener = Keyboard.addListener(
    'keyboardDidShow',
    () => setKeyboardVisible(true)
  );
  const keyboardDidHideListener = Keyboard.addListener(
    'keyboardDidHide',
    () => setKeyboardVisible(false)
  );

  return () => {
    keyboardDidShowListener.remove();
    keyboardDidHideListener.remove();
  };
}, []);

  const fabRotateDeg = fabRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

const TAB_BAR_HEIGHT_INPUT = 66; // For input padding
const inputPadBottom = isKeyboardVisible 
  ? bottomInset + (Platform.OS === 'ios' ? 8 : 2)  // When keyboard is open
  : TAB_BAR_HEIGHT + bottomInset + (Platform.OS === 'ios' ? 8 : 20); // When keyboard is closed

  return (
    <>
      {/* FLOATING ACTION BUTTON - Adjusted position */}
      <Animated.View 
        style={[
          styles.fabWrapper, 
          { 
            bottom: fabBottom, // Now includes navbar height
            transform: [
              { scale: fabScale },
              { scale: isOpen ? 0 : pulseAnim }
            ],
            opacity: fabScale.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        ]} 
        pointerEvents={isOpen ? "none" : "auto"}
      >
        <View style={styles.fabGlow} />
        <TouchableOpacity 
          onPress={isOpen ? closeModal : openModal} 
          activeOpacity={0.85} 
          style={styles.fabTouchable}
        >
          <LinearGradient 
            colors={['#7B5FFF', '#A98BFF']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={styles.fab}
          >
            <Animated.View style={{ transform: [{ rotate: fabRotateDeg }] }}>
              <Ionicons name={isOpen ? 'close' : 'chatbubble-ellipses'} size={26} color="#fff" />
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* CHAT MODAL */}
      {isOpen && (
        <Animated.View 
          style={[styles.modalContainer, { transform: [{ translateY: modalSlide }] }]}
        >
          <LinearGradient colors={['#0D0B2A', '#1A1040', '#0D1F3C']} style={StyleSheet.absoluteFill} />
          <View style={[styles.modalOrb1, { width: width * 0.6, height: width * 0.6, borderRadius: width * 0.3 }]} />
          <View style={styles.modalOrb2} />
          
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={TAB_BAR_HEIGHT_INPUT + bottomInset}
          >
            {/* Header */}
            <BlurView intensity={45} tint="dark" style={[styles.modalHeader, { paddingTop: topInset }]}>
              <LinearGradient colors={['rgba(123,95,255,0.32)', 'rgba(123,95,255,0.06)']} style={StyleSheet.absoluteFill} />
              <View style={styles.modalHeaderInner}>
                <View style={styles.dragHandle} />
                <View style={styles.modalHeaderRow}>
                  <View style={styles.modalHeaderLeft}>
                    <LinearGradient colors={['#7B5FFF', '#A98BFF']} style={[styles.headerAvatarGrad, isSmall && { width: 38, height: 38, borderRadius: 19 }]}>
                      <Text style={{ fontSize: isSmall ? 15 : 18 }}>🐾</Text>
                    </LinearGradient>
                    <View style={styles.headerTitleGroup}>
                      <Text style={[styles.headerTitle, isSmall && { fontSize: 15 }]}>PawBot</Text>
                      <View style={styles.onlineRow}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>Powered by Gemini 2.5 Flash</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                    <BlurView intensity={50} tint="dark" style={styles.closeBtnBlur}>
                      <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.8)" />
                    </BlurView>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.headerBorder} />
            </BlurView>

            {/* Message list */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={[styles.messageList, { paddingBottom: 16 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListFooterComponent={
                isLoading ? (
                  <View style={[styles.messageRow, styles.messageRowBot]}>
                    <View style={styles.botAvatar}>
                      <LinearGradient colors={['#7B5FFF', '#A98BFF']} style={styles.botAvatarGrad}>
                        <Text style={styles.botAvatarEmoji}>🐾</Text>
                      </LinearGradient>
                    </View>
                    <BlurView intensity={35} tint="dark" style={styles.typingBubble}>
                      <ActivityIndicator size="small" color="#A98BFF" />
                      <Text style={styles.typingText}>PawBot is thinking…</Text>
                    </BlurView>
                  </View>
                ) : null
              }
            />

            {/* Input bar */}
            <View style={styles.inputBar}>
              <View style={styles.inputBarTopBorder} />
              <View style={[styles.inputBarInner, { paddingBottom: inputPadBottom, paddingTop: isSmall ? 10 : 14 }]}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, isSmall && { fontSize: 15, lineHeight: 22 }]}
                    placeholder="Ask about your pet…"
                    placeholderTextColor="rgba(255,255,255,0.32)"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                    returnKeyType="send"
                    onSubmitEditing={sendMessage}
                    blurOnSubmit={false}
                  />
                </View>
                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                  style={styles.sendBtn}
                  activeOpacity={0.75}
                >
                  <LinearGradient
                    colors={inputText.trim() && !isLoading ? ['#7B5FFF', '#A98BFF'] : ['rgba(123,95,255,0.5)', 'rgba(169,139,255,0.5)']}
                    style={styles.sendBtnGrad}
                  >
                    <Ionicons
                      name="send"
                      size={20}
                      color={inputText.trim() && !isLoading ? '#fff' : 'rgba(255,255,255,0.8)'}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // FAB Styles
  fabWrapper: {
    position: 'absolute',
    right: 22,
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7B5FFF',
    opacity: 0.28,
    shadowColor: '#7B5FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 22,
  },
  fabTouchable: {
    borderRadius: 30,
    shadowColor: '#7B5FFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 12,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  
  // Modal container (rest of the styles remain the same as before)
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 150,
    overflow: 'hidden',
  },
  modalOrb1: {
    position: 'absolute',
    backgroundColor: '#7B5FFF',
    opacity: 0.12,
    top: -80,
    left: -60,
  },
  modalOrb2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FF6B4E',
    opacity: 0.09,
    bottom: 80,
    right: -40,
  },
  
  // Header
  modalHeader: {
    overflow: 'hidden',
  },
  modalHeaderInner: {
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatarGrad: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  headerTitleGroup: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3DBE6E',
  },
  onlineText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.52)',
  },
  closeBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeBtnBlur: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  headerBorder: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  
  // Messages
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 2,
  },
  botAvatarGrad: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatarEmoji: {
    fontSize: 15,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
    shadowColor: '#7B5FFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  bubbleBot: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
  },
  bubbleUserGrad: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleBotBlur: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  bubbleTextUser: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  bubbleTextBot: {
    color: 'rgba(255,255,255,0.90)',
    fontSize: 14,
    lineHeight: 21,
  },
  
  // Typing indicator
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
  },
  typingText: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 13,
  },
  
  // Input bar
  inputBar: {
    backgroundColor: 'transparent',
  },
  inputBarTopBorder: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  inputBarInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'transparent',
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    maxHeight: 140,
    justifyContent: 'center',
    elevation: 0,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
  },
  sendBtn: {
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#7B5FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(123, 95, 255, 0.5)',
  },
  sendBtnGrad: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});