import { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, Text, Modal, Animated, BackHandler } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import HomeScreen from "../screens/HomeScreen";
import ExploreScreen from "../screens/ExploreScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import JournalScreen from "../screens/JournalScreen";
import ChatScreen from "../screens/ChatScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import { styles as globalStyles } from "../styles/styles";
import { THEME } from "../constants/theme";
import { useTheme } from "../features/theme/theme.context";
import BlogReaderModal from "../components/BlogReaderModal";
import BreathingModal from "../components/BreathingModal";
import GradientBackground from "../components/GradientBackground";
import { useBlogs } from "../features/blogs/blogs.context";
import { useNavigation } from "../features/navigation/navigation.context";
import { useAuth } from "../features/auth/auth.context";
import PeriodHealthScreen from "../screens/PeriodHealthScreen";

const FadeTransition = ({ children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
};

export const AppShell = () => {
  const { activeTab, navigate } = useNavigation();
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [periodHealthOpen, setPeriodHealthOpen] = useState(false);
  const { markRead } = useBlogs();
  
  useEffect(() => {
    const backAction = () => {
      if (selectedBlog || breathingOpen || chatOpen || periodHealthOpen) {
        return false;
      }

      if (activeTab !== "Home") {
        navigate("Home");
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [activeTab, selectedBlog, breathingOpen, chatOpen, periodHealthOpen, navigate]);
  
  const handleOpenBlog = (blog) => {
    setSelectedBlog(blog);
    markRead(blog.id);
  };

  const renderScreen = () => {
    if (activeTab === "Home")
      return (
        <HomeScreen
          onOpenBlog={handleOpenBlog}
          setBreathingOpen={setBreathingOpen}
          onOpenChat={() => setChatOpen(true)}
        />
      );
    if (activeTab === "Explore")
      return <ExploreScreen onOpenBlog={handleOpenBlog} />;
    if (activeTab === "Journal") 
      return <JournalScreen />;
    if (activeTab === "Favorites") 
      return <FavoritesScreen onOpenBlog={handleOpenBlog} />;

    if (activeTab === "Profile") 
      return <ProfileScreen onOpenPeriodHealth={() => setPeriodHealthOpen(true)} />;
    if (activeTab === "Insights")
      return <AnalyticsScreen />;
    return null;
  };

  return (
    <GradientBackground>
      <SafeAreaView 
        style={[
          globalStyles.contentArea, 
          { 
            backgroundColor: 'transparent'
          }
        ]} 
        edges={['top', 'left', 'right']}
      >
        <FadeTransition key={activeTab}>
          {renderScreen()}
        </FadeTransition>
      </SafeAreaView>

      <View style={[globalStyles.tabBar, { backgroundColor: theme.surface }]}>
        <LinearGradient
          colors={['transparent', theme.divider || 'rgba(0,0,0,0.1)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1 }}
        />
        {["Home", "Explore",  "Journal", "Favorites","Insights", "Profile"].map((tab) => {
          const icons = {
            Home: "home",
            Explore: "compass",
            Journal: "book",
            Favorites: "heart",
            Insights: "stats-chart",
            Profile: "person",
          };

          const isActive = activeTab === tab;
          const color = isActive ? theme.primary : theme.textLight;

          return (
            <TouchableOpacity
              key={tab}
              style={globalStyles.tabItem}
              onPress={() => navigate(tab)}
            >
              <Ionicons
                name={isActive ? icons[tab] : `${icons[tab]}-outline`}
                size={24}
                color={color}
              />
              <Text
                style={[
                  globalStyles.tabLabel,
                  isActive && { color: theme.primary },
                  !isActive && { color: theme.textLight }
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>


      {user && (
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 90,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.primary,
            justifyContent: "center",
            alignItems: "center",
            elevation: 6,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            zIndex: 100,
          }}
          onPress={() => setChatOpen(true)}
        >
          <Ionicons name="chatbubbles" size={28} color="#FFF" />
        </TouchableOpacity>
      )}


      <BlogReaderModal
        blog={selectedBlog}
        visible={!!selectedBlog}
        onClose={() => setSelectedBlog(null)}
      />
      <BreathingModal
        visible={breathingOpen}
        onClose={() => setBreathingOpen(false)}
      />
      <Modal
        visible={chatOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChatOpen(false)}
      >
        {chatOpen && <ChatScreen onClose={() => setChatOpen(false)} />}
      </Modal>

      <PeriodHealthScreen 
        visible={periodHealthOpen} 
        onClose={() => setPeriodHealthOpen(false)} 
      />
      <Toast />
    </GradientBackground>
  );
};
