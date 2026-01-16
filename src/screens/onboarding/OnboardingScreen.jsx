import { useState, useRef } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Image,
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from "../../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Welcome to Ascend",
    desc: "Your personal companion for mental wellness, growth, and self-discovery. Let's take you on a quick tour.",
    image: require('../../../assets/onboarding_welcome.png'),
  },
  {
    id: "2",
    title: "Track Your Journey",
    desc: "Log your daily moods, maintain streaks, and journal your thoughts with our beautiful gratitude journal.",
    image: require('../../../assets/onboarding_mood.png'),
  },
  {
    id: "3",
    title: "AI Companion",
    desc: "Chat with Peace AI anytime. Vent, reflect, and find clarity with your personal AI guide.",
    image: require('../../../assets/onboarding_ai_chat.png'),
  },
  {
    id: "4",
    title: "Daily Wellness Tools",
    desc: "Access hydration tracking, breathing exercises, sleep wind-down, affirmations, and menstrual health tracking.",
    image: require('../../../assets/onboarding_wellness.png'),
  },
  {
    id: "5",
    title: "Discover & Grow",
    desc: "Explore curated quotes, wellness articles, calming soundscapes, and visual relief to inspire your day.",
    image: require('../../../assets/onboarding_explore.png'),
  },
  {
    id: "6",
    title: "Insights & Progress",
    desc: "Visualize your growth with analytics, mood trends, activity heatmaps, and personalized metrics.",
    image: require('../../../assets/onboarding_stats.png'),
  },
];

export default function OnboardingScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("@has_launched", "true");
      onFinish();
    } catch (e) {
      console.error("Error saving onboarding status", e);
      onFinish();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const renderItem = ({ item, index }) => (
    <View style={localStyles.slide}>
      <Image 
        source={item.image} 
        style={localStyles.image}
        resizeMode="contain"
      />
      <View style={localStyles.content}>
        <Text style={[localStyles.title, { color: THEME.text }]}>{item.title}</Text>
        <Text style={[localStyles.desc, { color: THEME.textSecondary }]}>{item.desc}</Text>
      </View>
    </View>
  );

  return (
    <View style={[localStyles.container, { backgroundColor: THEME.background }]}>
      <StatusBar barStyle='dark-content' />
      
      {}
      {currentIndex < SLIDES.length - 1 && (
        <TouchableOpacity 
          style={localStyles.skipBtn} 
          onPress={handleSkip}
        >
          <Text style={[localStyles.skipText, { color: THEME.textLight }]}>Skip</Text>
        </TouchableOpacity>
      )}

      <View style={{ flex: 3 }}>
        <FlatList
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View style={localStyles.footer}>
        {}
        <View style={localStyles.progressContainer}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [1, 1.5, 1],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={i.toString()}
                style={[
                  localStyles.progressDot,
                  { 
                    backgroundColor: THEME.primary,
                    transform: [{ scale }],
                    opacity 
                  },
                ]}
              />
            );
          })}
        </View>

        {}
        <TouchableOpacity 
          style={[localStyles.btn, { backgroundColor: THEME.primary }]} 
          onPress={scrollToNext}
        >
          <Text style={localStyles.btnText}>
            {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons 
            name={currentIndex === SLIDES.length - 1 ? "checkmark-circle" : "arrow-forward"} 
            size={20} 
            color="#FFF" 
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 80, 
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
    borderRadius: 32,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  desc: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingBottom: 50,
    width: "100%",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  btn: {
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
