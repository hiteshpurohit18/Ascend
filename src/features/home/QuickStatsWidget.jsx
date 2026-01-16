import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/theme.context";
import { useHydration } from "../hydration/hydration.context";
import { useJournal } from "../journal/journal.context";
import { useMood } from "../mood/mood.context";

export default function QuickStatsWidget() {
  const { theme } = useTheme();
  const { percentage } = useHydration();
  const { entries } = useJournal();
  const { checkinsToday } = useMood();

  // Count entries for today
  const today = new Date().toISOString().split('T')[0];
  const entriesToday = entries.filter(e => e.date.startsWith(today)).length;

  const stats = [
    {
      label: "Hydration",
      value: `${percentage}%`,
      icon: "water",
      color: "#4CA1AF"
    },
    {
      label: "Journal",
      value: entriesToday,
      icon: "journal",
      color: "#F6D365"
    },
    {
      label: "Check-ins",
      value: checkinsToday,
      icon: "checkmark-circle",
      color: "#4CAF50"
    }
  ];

  return (
    <View style={{ marginBottom: 20, marginTop: 15 }}>
      {/* Section Title */}
      <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          color: theme.text, 
          paddingHorizontal: 20, 
          marginBottom: 15 
      }}>
          Your Progress
      </Text>

      <View style={styles.container}>
        {stats.map((stat, i) => (
          <View 
            key={i} 
            style={[
              styles.card, 
              { 
                backgroundColor: theme.surface, 
                borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'transparent'
              }
            ]}
          >
            <View style={[styles.iconBox, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.value, { color: theme.text }]}>{stat.value}</Text>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'column',
    alignItems: 'center', // Centered card content
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  }

});
