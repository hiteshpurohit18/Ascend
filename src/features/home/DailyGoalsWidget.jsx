import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/theme.context";
import { useGrowth } from "../growth/growth.context";

export default function DailyGoalsWidget() {
  const { theme } = useTheme();
  const { completedGoals, toggleGoal, defaultGoals } = useGrowth();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.text }]}>Daily Goals</Text>
      
      <View style={styles.grid}>
        {defaultGoals.map((goal) => {
          const isDone = completedGoals.includes(goal.id);
          return (
            <TouchableOpacity
              key={goal.id}
              activeOpacity={0.7}
              onPress={() => toggleGoal(goal.id)}
              style={[
                styles.goalCard,
                { 
                  backgroundColor: isDone ? theme.primary : theme.surfaceHighlight,
                  borderColor: isDone ? theme.primary : theme.divider 
                }
              ]}
            >
              <Ionicons 
                name={isDone ? "checkmark-circle" : goal.icon} 
                size={22} 
                color={isDone ? "#FFF" : theme.textSecondary} 
              />
              <Text 
                numberOfLines={1} 
                style={[
                  styles.goalText, 
                  { 
                    color: isDone ? "#FFF" : theme.textSecondary,
                    textDecorationLine: isDone ? 'line-through' : 'none'
                  }
                ]}
              >
                {goal.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    flexGrow: 1,
  },
  goalText: {
    fontSize: 14,
    fontWeight: "600",
  }
});
