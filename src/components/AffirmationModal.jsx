import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMood } from '../features/mood/mood.context';
import { useTheme } from '../features/theme/theme.context';
import { useAuth } from '../features/auth/auth.context';
import { useNavigation } from '../features/navigation/navigation.context';
import { generateAffirmation } from '../features/ai/gemini.service';

const { width, height } = Dimensions.get('window');

const AFFIRMATIONS = [
  "I am worthy of great things.",
  "Today is a fresh start.",
  "I breathe in peace and exhale stress.",
  "I am capable of achieving my goals.",
  "My potential is limitless."
];

const gradients = [
  ['#FF9A9E', '#FECFEF'],
  ['#a18cd1', '#fbc2eb'],
  ['#fad0c4', '#ffd1ff'],
  ['#ff9a9e', '#fecfef'],
  ['#a1c4fd', '#c2e9fb'],
  ['#84fab0', '#8fd3f4']
];

const AffirmationModal = ({ visible, onClose }) => {
  const { currentMood } = useMood();
  const { theme, isDarkMode } = useTheme();
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customAffirmation, setCustomAffirmation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
        setCustomAffirmation(null);
        setLoading(false);
    }
  }, [visible]);

  const nextAffirmation = () => {
    if (customAffirmation) setCustomAffirmation(null);
    setCurrentIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const text = await generateAffirmation(currentMood?.label);
    setCustomAffirmation(text);
    setLoading(false);
  };

  const currentGradient = gradients[currentIndex % gradients.length];
  const displayedText = customAffirmation || AFFIRMATIONS[currentIndex];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={currentGradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>


        <View style={styles.content}>
           <TouchableOpacity 
             style={[styles.card, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)' }]} 
             activeOpacity={0.9} 
             onPress={nextAffirmation}
            >
             <Ionicons name="sparkles" size={32} color={isDarkMode ? "#FFD700" : "#FFC107"} style={{ marginBottom: 20 }} />
             
             {loading ? (
                <View style={{ height: 100, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text style={[styles.loadingText, { color: isDarkMode ? '#CCC' : '#999' }]}>Channeling positivity...</Text>
                </View>
             ) : (
                <Text style={[styles.text, { color: isDarkMode ? "#FFF" : "#333" }]}>{displayedText}</Text>
             )}

             <Text style={[styles.tapHint, { color: isDarkMode ? '#AAA' : '#999' }]}>Tap card for next</Text>
           </TouchableOpacity>


           <TouchableOpacity 
             style={styles.generateBtn} 
             onPress={() => {
               if (!user) {
                 onClose();
                 navigate("Profile", { mode: "login" });
                 return;
               }
               handleGenerate();
             }}
             disabled={loading}
            >
             <LinearGradient
                colors={['#FFF', '#F0F0F0']}
                style={styles.generateBtnGradient}
             >
                <Ionicons name="color-wand" size={20} color="#9C27B0" />
                <Text style={styles.generateBtnText}>
                    {!user ? " Login to Inspire" : (currentMood ? ` Inspire my "${currentMood.label}" mood` : " Inspire Me")}
                </Text>
             </LinearGradient>
           </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    width: 40, 
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.85,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    minHeight: 350, 
    marginBottom: 30,
  },
  text: {
    fontSize: 28, 
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 30,
    fontFamily: 'System', 
  },
  tapHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingText: {
    marginTop: 15,
    color: '#999',
    fontSize: 14,
  },
  generateBtn: {
    width: '80%',
    height: 56,
    borderRadius: 28,
    elevation: 5,
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  generateBtnGradient: {
    flex: 1,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C27B0',
  }
});

export default AffirmationModal;
