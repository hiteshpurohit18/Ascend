import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { BLOG_POSTS, QUOTES, CATEGORIES } from "../constants/data";
import { styles } from "../styles/styles";
import Tag from "../components/Tag";
import QuoteDetailModal from "../components/QuoteDetailModal";
import { useBlogs } from "../features/blogs/blogs.context";
import { useQuotes } from "../features/quotes/quotes.context";
import { useTheme } from "../features/theme/theme.context";

export default function ExploreScreen({ onOpenBlog }) {
  const { theme, isDarkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [activeTab, setActiveTab] = useState("Articles");
  const [selectedQuote, setSelectedQuote] = useState(null);

  const { bookmarkedBlogs } = useBlogs();
  const { likedQuotes } = useQuotes();

  const filteredBlogs = BLOG_POSTS.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === "All" || b.category === activeCat;
    return matchesSearch && matchesCat;
  });

  const filteredQuotes = QUOTES.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      q.author.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === "All" || q.category === activeCat;
    return matchesSearch && matchesCat;
  });

  const renderBlogItem = ({ item }) => {
    const isBookmarked = bookmarkedBlogs.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.blogRowCard,
          { backgroundColor: theme.surface, borderColor: theme.divider },
          isBookmarked && { 
            borderWidth: 1, 
            borderColor: theme.primary, 
            backgroundColor: isDarkMode ? 'rgba(63, 136, 197, 0.1)' : "#F0FCFC" 
          }
        ]}
        onPress={() => onOpenBlog(item)}
      >
        <Image source={{ uri: item.image }} style={styles.blogRowImage} />
        <View style={styles.blogRowContent}>
          <Text style={[styles.blogRowCategory, { color: theme.primary }]}>{item.category}</Text>
          <Text style={[styles.blogRowTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.blogRowMeta, { color: theme.textSecondary }]}>{item.readTime}</Text>
        </View>
        
        {isBookmarked && (
          <Ionicons 
            name="bookmark" 
            size={20} 
            color={theme.primary} 
            style={{ marginRight: 8 }}
          />
        )}
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  const renderQuoteItem = ({ item }) => {
    const isLiked = likedQuotes.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          componentStyles.quoteCard,
          { backgroundColor: theme.surface, shadowColor: theme.text },
          isLiked && { borderWidth: 1, borderColor: theme.accent, backgroundColor: isDarkMode ? 'rgba(255, 107, 107, 0.1)' : "#FFF5F7" }
        ]}
        onPress={() => setSelectedQuote(item)}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <FontAwesome5
            name="quote-left"
            size={20}
            color={isLiked ? theme.accent : theme.primary}
            style={{ marginBottom: 12, opacity: 0.5 }}
          />
          {isLiked && (
            <Ionicons name="heart" size={16} color={theme.accent} />
          )}
        </View>
        
        <Text style={[componentStyles.quoteText, { color: theme.text }]} numberOfLines={4}>
          "{item.text}"
        </Text>
        <View style={componentStyles.quoteFooter}>
          <Text style={[componentStyles.quoteAuthor, { color: theme.textSecondary }]}>— {item.author}</Text>
          <Text style={[componentStyles.quoteCategory, { backgroundColor: theme.surfaceHighlight, color: theme.textLight }]}>{item.category}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <View style={[styles.exploreHeader, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Explore</Text>

        {}
        <View style={[componentStyles.tabContainer, { backgroundColor: theme.surface }]}>
          {["Articles", "Quotes"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                componentStyles.tabButton,
                activeTab === tab && { backgroundColor: theme.background, shadowColor: theme.text },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  componentStyles.tabText,
                  activeTab === tab ? { color: theme.text } : { color: theme.textSecondary },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            placeholderTextColor={theme.placeholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={{ height: 50 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            alignItems: "center",
          }}
        >
          {CATEGORIES.map((cat) => (
            <Tag
              key={cat}
              text={cat}
              active={activeCat === cat}
              onPress={() => setActiveCat(cat)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={activeTab === "Articles" ? filteredBlogs : filteredQuotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 50, color: "#999" }}>
            No {activeTab.toLowerCase()} found.
          </Text>
        }
        renderItem={activeTab === "Articles" ? renderBlogItem : renderQuoteItem}
      />

      <QuoteDetailModal
        quote={selectedQuote}
        visible={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
      />
    </View>
  );
}

const componentStyles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  activeTabText: {
    color: "#333",
  },
  quoteCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quoteText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: "italic",
  },
  quoteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  quoteCategory: {
    fontSize: 12,
    color: "#999",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
