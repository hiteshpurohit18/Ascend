import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,

  Dimensions,
  StyleSheet,
  Platform,
  StatusBar
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from 'expo-linear-gradient';
import { useMood } from "../features/mood/mood.context";
import { useQuotes } from "../features/quotes/quotes.context";
import { useAuth } from "../features/auth/auth.context";
import { useNavigation } from "../features/navigation/navigation.context";
import { useTheme } from "../features/theme/theme.context";
import { QUOTES, BLOG_POSTS, MOODS, SOUNDSCAPES } from "../constants/data";
import { styles as globalStyles } from "../styles/styles";
import AudioPlayerWidget from "../features/audio/AudioPlayerWidget";
import SectionHeader from "../components/SectionHeader";
import HydrationModal from "../components/HydrationModal";
import AffirmationModal from "../components/AffirmationModal";
import SleepModal from "../components/SleepModal";
import DailyGoalsWidget from "../features/home/DailyGoalsWidget";
import QuickStatsWidget from "../features/home/QuickStatsWidget";
import JournalPreviewWidget from "../features/home/JournalPreviewWidget";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function HomeScreen({ onOpenBlog, setBreathingOpen, onOpenChat }) {
  const [greeting, setGreeting] = useState("Good Morning");
  const [selectedSound, setSelectedSound] = useState(SOUNDSCAPES[0]);
  const [hydrationOpen, setHydrationOpen] = useState(false);
  const [affirmationOpen, setAffirmationOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);

  const { theme, isDarkMode } = useTheme();
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const { currentMood, setMood, streak } = useMood();
  const { likedQuotes, toggleQuote } = useQuotes();

  const player = useVideoPlayer('https://videos.pexels.com/video-files/1448735/1448735-uhd_4096_2160_24fps.mp4', (player) => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting("Good Morning");
    else if (hr < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  
  const gradientColors = isDarkMode 
    ? [theme.surface, theme.background] 
    : [theme.primary + "15", theme.background];

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {}
        <LinearGradient
          colors={gradientColors}
          style={styles.headerContainer}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greeting, { color: theme.text }]}>{greeting}, {user ? user.name : "Guest"}</Text>
              <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>Ready to start your day?</Text>
            </View>
            {user && (
              <View style={[styles.streakBadge, { backgroundColor: theme.surface }]}>
                <Ionicons name="flame" size={20} color={theme.accent} />
                <Text style={[styles.streakText, { color: theme.text }]}>{streak}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {}
        {user && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>How are you feeling?</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {MOODS.map((mood, index) => (
                <TouchableOpacity
                  key={mood.label}
                  onPress={() => setMood(mood)}
                  style={[
                    styles.moodItem,
                    { 
                      backgroundColor: theme.surface,
                      borderColor: currentMood?.label === mood.label ? mood.color : theme.divider,
                      marginRight: 15, 
                    },
                    currentMood?.label === mood.label && { backgroundColor: mood.color + "15" }
                  ]}
                >
                  <Ionicons 
                    name={mood.icon} 
                    size={28} 
                    color={currentMood?.label === mood.label ? mood.color : theme.textSecondary} 
                  />
                  <Text style={[
                      styles.moodText, 
                      { color: currentMood?.label === mood.label ? mood.color : theme.textSecondary }
                    ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}



        {}
        <QuickStatsWidget />

        {}
        <DailyGoalsWidget />

        {}
        <JournalPreviewWidget />

        {}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Tools</Text>
          <View style={styles.toolsGrid}>
            <TouchableOpacity 
              style={[styles.toolCard, { backgroundColor: isDarkMode ? '#1E3A5F' : "#E3F2FD" }]} 
              onPress={() => setBreathingOpen(true)}
            >
              <MaterialIcons name="air" size={32} color="#2196F3" />
              <Text style={[styles.toolLabel, isDarkMode && { color: '#FFF' }]}>Breathe</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toolCard, { backgroundColor: isDarkMode ? '#4E342E' : "#FFF3E0" }]} 
              onPress={() => navigate("Journal")}
            >
              <MaterialIcons name="edit-note" size={32} color="#FF9800" />
              <Text style={[styles.toolLabel, isDarkMode && { color: '#FFF' }]}>Journal</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toolCard, { backgroundColor: isDarkMode ? '#1B5E20' : "#E8F5E9" }]} 
              onPress={() => setHydrationOpen(true)}
            >
              <Ionicons name="water-outline" size={32} color="#4CAF50" />
              <Text style={[styles.toolLabel, isDarkMode && { color: '#FFF' }]}>Hydrate</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toolCard, { backgroundColor: isDarkMode ? '#4A148C' : "#F3E5F5" }]} 
              onPress={() => setAffirmationOpen(true)}
            >
              <Ionicons name="sparkles-outline" size={32} color="#9C27B0" />
              <Text style={[styles.toolLabel, isDarkMode && { color: '#FFF' }]}>Affirm</Text>
            </TouchableOpacity>

            {}
            <TouchableOpacity 
              style={[styles.toolCardFull, { backgroundColor: isDarkMode ? '#004D40' : "#E0F7FA" }]} 
              onPress={() => setSleepOpen(true)}
            >
              <Ionicons name="moon-outline" size={28} color="#006064" />
              <Text style={[styles.toolLabel, isDarkMode && { color: '#FFF' }]}>Sleep Wind-Down</Text>
            </TouchableOpacity>
          </View>
        </View>

        {}
        <TouchableOpacity 
           style={[styles.aiBanner, { backgroundColor: theme.primary }]}
           onPress={() => user ? onOpenChat() : Alert.alert("Login Required")}
        >
           <View style={styles.aiIcon}>
              <Ionicons name="chatbubbles" size={20} color={theme.primary} />
           </View>
           <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>Talk to Peace AI</Text>
              <Text style={styles.aiSubtitle}>Vent, reflect, and find clarity.</Text>
           </View>
           <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>

        {}
        <View style={styles.sectionContainer}>
           <Text style={[styles.sectionTitle, { color: theme.text }]}>Visual Relief</Text>
           <View style={styles.videoCard}>
              <VideoView
                style={{ width: '100%', height: '100%' }}
                player={player}
                contentFit="cover"
                nativeControls={false}
              />
           </View>
        </View>

        {}
        <View style={styles.sectionContainer}>
           <Text style={[styles.sectionTitle, { color: theme.text }]}>Soundscape</Text>
            <FlatList
              data={SOUNDSCAPES}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isActive = selectedSound.id === item.id;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedSound(item)}
                    style={[
                      styles.soundCard,
                      { borderColor: isActive ? theme.primary : theme.divider },
                      isActive && { backgroundColor: theme.primary + '10' }
                    ]}
                  >
                    <Image source={{ uri: item.image }} style={styles.soundImg} />
                    <Text style={[styles.soundTitle, { color: theme.text, fontWeight: isActive ? 'bold' : 'normal' }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.soundSub, { color: theme.textSecondary }]} numberOfLines={1}>{item.subtitle.split(" • ")[1]}</Text>
                  </TouchableOpacity>
                );
              }}
            />
            <View style={{ marginTop: 15 }}>
               <AudioPlayerWidget
                  uri={selectedSound.uri}
                  title={selectedSound.title}
                  subtitle={selectedSound.subtitle}
                />
            </View>
        </View>

        {}
        <View style={styles.sectionContainer}>
          <SectionHeader title="Featured Reads" />
          <FlatList
            data={BLOG_POSTS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onOpenBlog(item)}
                style={[styles.blogCard, { backgroundColor: theme.surface }]}
              >
                <Image source={{ uri: item.image }} style={styles.blogImg} />
                <View style={{ padding: 12 }}>
                  <Text style={[styles.blogTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
                  <Text style={[styles.blogReadTime, { color: theme.textLight }]}>{item.readTime}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {}
        <View style={styles.sectionContainer}>
          <SectionHeader title="Daily Wisdom" />
          <FlatList
            data={QUOTES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isLiked = likedQuotes.includes(item.id);
              return (
                <View style={[styles.quoteCard, { backgroundColor: theme.surface, width: SCREEN_WIDTH - 40, marginRight: 20 }]}>
                   <View style={styles.quoteHeader}>
                      <FontAwesome5 name="quote-left" size={20} color={theme.primary + "40"} />
                      <TouchableOpacity onPress={() => toggleQuote(item.id)}>
                        <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? "#E53935" : theme.textSecondary} />
                      </TouchableOpacity>
                   </View>
                   <Text style={[styles.quoteBody, { color: theme.text }]}>"{item.text}"</Text>
                   <Text style={[styles.quoteAuthor, { color: theme.textSecondary }]}>— {item.author}</Text>
                </View>
              );
            }}
          />
        </View>

      </ScrollView>

      {}
      <HydrationModal visible={hydrationOpen} onClose={() => setHydrationOpen(false)} />
      <AffirmationModal visible={affirmationOpen} onClose={() => setAffirmationOpen(false)} />
      <SleepModal visible={sleepOpen} onClose={() => setSleepOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center', 
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 14,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionContainer: {
    marginTop: 25,
    paddingLeft: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  moodItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 90,
    borderRadius: 16,
    borderWidth: 1,
  },
  moodText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  quoteCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee', 
    justifyContent: 'center',
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quoteBody: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    paddingRight: 20, 
  },
  toolCard: {
    width: (SCREEN_WIDTH - 55) / 2, 
    height: 110,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolCardFull: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  toolLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  aiBanner: {
    marginHorizontal: 20,
    marginTop: 25,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aiSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  videoCard: {
    width: SCREEN_WIDTH - 40,
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  soundCard: {
    width: 130,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 15,
    backgroundColor: '#fff',
  },
  soundImg: {
    width: '100%',
    height: 90,
    borderRadius: 12,
    marginBottom: 8,
  },
  soundTitle: {
    fontSize: 13,
    marginBottom: 2,
  },
  soundSub: {
    fontSize: 11,
  },
  blogCard: {
    width: 300,
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  blogImg: {
    width: '100%',
    height: 140,
  },
  blogTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 6,
  },
  blogReadTime: {
    fontSize: 12,
    fontWeight: '500',
  },
});
