import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/theme.context";
import { useJournal } from "../journal/journal.context";
import { useNavigation } from "../navigation/navigation.context";

export default function JournalPreviewWidget() {
  const { theme } = useTheme();
  const { entries } = useJournal();
  const { navigate } = useNavigation();

  // Get last 5 entries
  const recentEntries = entries.slice(0, 5);

  if (recentEntries.length === 0) return null;

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Recent Reflections</Text>
        <TouchableOpacity onPress={() => navigate('Journal')}>
            <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 13 }}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
        {recentEntries.map((entry) => (
          <TouchableOpacity 
            key={entry.id}
            activeOpacity={0.8}
            onPress={() => navigate('Journal')} // Ideally navigate to specific entry, but Journal screen handles list
            style={[styles.card, { backgroundColor: theme.surface }]}
          >
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={[styles.dateBadge, { backgroundColor: theme.primary + '15' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primary }}>{formatDate(entry.date)}</Text>
                </View>
                {entry.photos && entry.photos.length > 0 && <Ionicons name="image" size={12} color={theme.textSecondary} />}
             </View>
             
             <Text numberOfLines={3} style={[styles.text, { color: theme.textSecondary }]}>
                {entry.items[0]}
             </Text>

             <View style={{ marginTop: 'auto', flexDirection: 'row', gap: 4 }}>
                 {entry.tags && entry.tags.slice(0, 2).map((tag, i) => (
                     <Text key={i} style={{ fontSize: 10, color: theme.textLight }}>#{tag}</Text>
                 ))}
             </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    marginBottom: 15
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    width: 160,
    height: 140,
    padding: 16,
    borderRadius: 20,
    marginLeft: 20, // Only First item needs margin left, but simplistic here
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  text: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  }
});
