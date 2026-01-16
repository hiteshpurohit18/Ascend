import {
  Modal,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { useAuth } from "../features/auth/auth.context";
import { useBlogs } from "../features/blogs/blogs.context";
import { useNavigation } from "../features/navigation/navigation.context";
import { styles } from "../styles/styles";
import { THEME } from "../constants/theme";
import { useTheme } from "../features/theme/theme.context";
import GradientBackground from "../components/GradientBackground";

const BlogReaderModal = ({ blog, visible, onClose }) => {
  const { user, setAuthPendingAction } = useAuth();
  const { bookmarkedBlogs, toggleBookmark } = useBlogs();
  const { navigate } = useNavigation();
  const { theme, isDarkMode } = useTheme();

  if (!blog) return null;

  const isBookmarked = bookmarkedBlogs.includes(blog.id);

  const handleBookmark = () => {
    if (!user) {
      setAuthPendingAction({ type: "BOOKMARK_BLOG", payload: blog.id });
      onClose();
      navigate("Profile", { mode: "login" });
      return;
    }
    toggleBookmark(blog.id);
  };

  const handleSharePdf = async () => {
    try {
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          </head>
          <body style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">${blog.title}</h1>
              <p style="color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                ${blog.category} • ${blog.readTime}
              </p>
            </div>
            
            <img src="${blog.image}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 30px;" />
            
            <div style="font-size: 18px; line-height: 1.8; color: #444;">
              ${blog.content}
            </div>
            
            <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
              Shared from Ascend App
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert("Error", "Could not generate PDF");
    }
  };

  const renderContent = (content) => {
    const parts = content.split(/\*\*(.*?)\*\*/g);
    
    return (
      <Text style={[styles.readerBody, { color: theme.text }]}>
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            return (
              <Text key={index} style={{ fontWeight: "bold", color: theme.text }}>
                {part}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <GradientBackground>
      <SafeAreaView style={{ 
        flex: 1, 
        backgroundColor: 'transparent',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
      }}>
        <View style={[styles.readerHeader, { borderBottomColor: theme.divider, backgroundColor: 'transparent' }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="chevron-down" size={30} color={theme.text} />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", gap: 15 }}>
            <TouchableOpacity onPress={handleSharePdf}>
              <Ionicons name="share-outline" size={24} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBookmark}>
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={theme.text} 
              />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.readerContent}>
          <Text style={[styles.readerCategory, { color: theme.primary }]}>
            {blog.category.toUpperCase()}
          </Text>
          <Text style={[styles.readerTitle, { color: theme.text }]}>{blog.title}</Text>
          <View style={styles.readerMeta}>
            <Image
              source={{
                uri: "https://randomuser.me/api/portraits/women/44.jpg",
              }}
              style={styles.authorAvatar}
            />
            <View>
              <Text style={[styles.authorName, { color: theme.text }]}>Sarah Jenkins</Text>
              <Text style={[styles.publishDate, { color: theme.textSecondary }]}>Oct 24 • {blog.readTime}</Text>
            </View>
          </View>
          <Image source={{ uri: blog.image }} style={styles.readerImage} />
          {renderContent(blog.content)}
          <View style={styles.endMarker}>
            <Text style={{ color: "#ccc" }}>***</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      </GradientBackground>
    </Modal>
  );
};

export default BlogReaderModal;
