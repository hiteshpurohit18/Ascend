import { View, Text, StyleSheet } from "react-native";
import { useMood } from "./mood.context";
import { getWeeklyInsight } from "./mood.utils";
import { THEME } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function MoodInsights() {
  const { history } = useMood();
  const moodLabel = getWeeklyInsight(history);
  const moodColor = moodLabel ? THEME.moods[moodLabel] : THEME.textSecondary;

  if (!moodLabel)
    return (
      <View style={localStyles.emptyContainer}>
        <Text style={localStyles.emptyText}>
          Check in daily to unlock insights
        </Text>
      </View>
    );

  return (
    <View style={localStyles.container}>
      <View style={localStyles.header}>
        <Ionicons name="analytics" size={20} color={THEME.primary} />
        <Text style={localStyles.title}>Weekly Insight</Text>
      </View>
      <View style={localStyles.content}>
        <Text style={localStyles.mainText}>
          You mostly felt <Text style={{ color: moodColor }}>{moodLabel}</Text>{" "}
          this week.
        </Text>
        <Text style={localStyles.subText}>
          Keep tracking to see more patterns!
        </Text>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textPrimary,
  },
  content: {},
  mainText: {
    fontSize: 18,
    fontWeight: "500",
    color: THEME.textPrimary,
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  emptyContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
  },
  emptyText: {
    color: THEME.textSecondary,
    fontStyle: "italic",
  },
});
