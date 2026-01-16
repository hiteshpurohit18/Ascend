import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions, Platform } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useQuotes } from "../features/quotes/quotes.context";
import { useAuth } from "../features/auth/auth.context";
import { useBlogs } from "../features/blogs/blogs.context";
import { QUOTES, BLOG_POSTS } from "../constants/data";
import { styles } from "../styles/styles";
import { THEME } from "../constants/theme";
import { useTheme } from "../features/theme/theme.context";

const { width } = Dimensions.get("window");

export default function FavoritesScreen({ onOpenBlog }) {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const { likedQuotes, toggleQuote } = useQuotes();
  const { bookmarkedBlogs, toggleBookmark } = useBlogs();
  const [activeTab, setActiveTab] = useState("Quotes");

  const favQuotes = QUOTES.filter((q) => likedQuotes.includes(q.id));
  const savedBlogs = BLOG_POSTS.filter((b) => bookmarkedBlogs.includes(b.id));

  if (!user) {
    return (
      <View style={[styles.screenContainer, { justifyContent: "center", alignItems: "center", padding: 20 }]}>
        <Ionicons name="lock-closed-outline" size={60} color="#ccc" style={{ marginBottom: 20 }} />
        <Text style={styles.screenTitle}>Login Required</Text>
        <Text style={[styles.subTitle, { textAlign: "center", marginTop: 10 }]}>
          Please log in to save and view your favorite quotes and articles.
        </Text>
      </View>
    );
  }

  const renderQuoteItem = ({ item }) => (
    <View style={[
      localStyles.quoteCard, 
      { backgroundColor: theme.surface, borderColor: theme.divider }
    ]}>
      <FontAwesome5 
        name="quote-left" 
        size={80} 
        color={theme.primary} 
        style={localStyles.watermarkQuote} 
      />
      <View style={localStyles.quoteContent}>
        <Text style={[localStyles.quoteText, { color: theme.text }]} numberOfLines={6}>
          {item.text}
        </Text>
        <View style={[localStyles.divider, { backgroundColor: theme.primary }]} />
        <Text style={[localStyles.quoteAuthor, { color: theme.textSecondary }]}>— {item.author.toUpperCase()}</Text>
      </View>
      
      <View style={[localStyles.quoteActions, { borderTopColor: theme.surfaceHighlight }]}>
        <View style={[localStyles.categoryPill, { backgroundColor: theme.surfaceHighlight }]}>
          <Text style={[localStyles.categoryText, { color: theme.textSecondary }]}>{item.category}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => toggleQuote(item.id)}
          style={localStyles.actionBtn}
        >
          <Ionicons name="heart" size={22} color={theme.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBlogItem = ({ item }) => (
    <TouchableOpacity
      style={[
        localStyles.blogCard,
        { backgroundColor: theme.surface }
      ]}
      onPress={() => onOpenBlog(item)}
      activeOpacity={0.9}
    >
      <View style={localStyles.blogImageContainer}>
        <Image source={{ uri: item.image }} style={localStyles.blogImage} />
        <View style={localStyles.blogTimeBadge}>
          <Ionicons name="time-outline" size={12} color="#FFF" />
          <Text style={localStyles.blogTimeText}>{item.readTime}</Text>
        </View>
      </View>
      
      <View style={localStyles.blogContent}>
        <Text style={[localStyles.blogCategory, { color: theme.primary }]}>{item.category}</Text>
        <Text style={[localStyles.blogTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
        
        <View style={localStyles.blogFooter}>
          <Text style={[localStyles.readMore, { color: theme.textSecondary }]}>Read Article</Text>
          <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
            <Ionicons name="bookmark" size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screenContainer}>
      <View style={[styles.exploreHeader, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Favorites</Text>
        
        {}
        <View style={[localStyles.tabWrapper, { borderBottomColor: theme.divider }]}>
          <TouchableOpacity 
            style={[localStyles.tabItem, activeTab === "Quotes" && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]} 
            onPress={() => setActiveTab("Quotes")}
          >
            <Text style={[localStyles.tabLabel, activeTab === "Quotes" ? { color: theme.text } : { color: theme.textSecondary }]}>Quotes</Text>
            {favQuotes.length > 0 && <View style={[localStyles.dot, { backgroundColor: theme.accent }]} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[localStyles.tabItem, activeTab === "Articles" && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]} 
            onPress={() => setActiveTab("Articles")}
          >
            <Text style={[localStyles.tabLabel, activeTab === "Articles" ? { color: theme.text } : { color: theme.textSecondary }]}>Articles</Text>
            {savedBlogs.length > 0 && <View style={[localStyles.dot, { backgroundColor: theme.accent }]} />}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={activeTab === "Quotes" ? favQuotes : savedBlogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[localStyles.emptyCircle, { backgroundColor: theme.surfaceHighlight }]}>
              <Ionicons 
                name={activeTab === "Quotes" ? "heart" : "bookmark"} 
                size={40} 
                color={theme.divider} 
              />
            </View>
            <Text style={[styles.emptyStateText, { color: theme.text }]}>Collection Empty</Text>
            <Text style={[styles.emptyStateSub, { color: theme.textSecondary }]}>
              Start building your personal library of {activeTab === "Quotes" ? "wisdom" : "insights"}.
            </Text>
          </View>
        }
        renderItem={activeTab === "Quotes" ? renderQuoteItem : renderBlogItem}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  tabWrapper: {
    flexDirection: "row",
    marginTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: THEME.primary,
  },
  tabLabel: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  activeTabLabel: {
    color: "#333",
    fontWeight: "700",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.accent,
    marginTop: -8,
  },
  
  quoteCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 20,
    padding: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  watermarkQuote: {
    position: "absolute",
    top: -10,
    left: 20,
    opacity: 0.1,
  },
  quoteContent: {
    alignItems: "center",
    marginVertical: 10,
  },
  quoteText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    lineHeight: 28,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    fontStyle: "italic",
    marginBottom: 20,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: THEME.primary,
    opacity: 0.3,
    marginBottom: 15,
  },
  quoteAuthor: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 1.5,
  },
  quoteActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#FAFAFA",
  },
  categoryPill: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    color: "#888",
    fontWeight: "600",
  },
  actionBtn: {
    padding: 4,
  },
  
  blogCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  blogImageContainer: {
    height: 180,
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  blogImage: {
    width: "100%",
    height: "100%",
  },
  blogTimeBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  blogTimeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  blogContent: {
    padding: 20,
  },
  blogCategory: {
    color: THEME.primary,
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    lineHeight: 26,
    marginBottom: 16,
  },
  blogFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readMore: {
    color: "#999",
    fontSize: 13,
    fontWeight: "500",
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
});
