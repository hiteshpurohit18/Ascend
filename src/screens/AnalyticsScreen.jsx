import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../features/theme/theme.context';
import { useMood } from '../features/mood/mood.context';
import { useHydration } from '../features/hydration/hydration.context';
import { useAuth } from '../features/auth/auth.context';
import { useNavigation } from '../features/navigation/navigation.context';
import { useGrowth } from '../features/growth/growth.context';
import GradientBackground from '../components/GradientBackground';

const SCREEN_WIDTH = Dimensions.get('window').width;

const OverallGrowthChart = () => {
    const { theme } = useTheme();
    const { getGrowthHistory } = useGrowth();

    const chartData = useMemo(() => {
        const history = getGrowthHistory();
        const labels = history.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        const data = history.map(d => d.score);
        
        return {
            labels,
            datasets: [{ 
                data,
                color: (opacity = 1) => `rgba(138, 58, 255, ${opacity})`, 
                strokeWidth: 3
            }]
        };
    }, [getGrowthHistory]);

    const chartConfig = {
        backgroundGradientFrom: 'transparent',
        backgroundGradientTo: 'transparent',
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => theme.textSecondary,
        strokeWidth: 2,
        decimalPlaces: 0,
        propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: theme.surface 
        },
        labelColor: (opacity = 1) => theme.textSecondary,
    };

    return (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Overall Growth</Text>
                    <Text style={[styles.cardSub, { color: theme.textSecondary }]}>Composite score of your habits (0-100%)</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: '#8A3AFF15', paddingHorizontal: 8 }]}>
                    <Ionicons name="rocket" size={16} color="#8A3AFF" />
                </View>
            </View>
            
            <LineChart
                data={chartData}
                width={SCREEN_WIDTH - 80}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
                fromZero
                yAxisSuffix="%"
                segments={4}
            />
        </View>
    );
};

const AnalyticsScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const { history: moodHistory, streak } = useMood();
  const { weeklyHistory, currentIntake, dailyGoal } = useHydration();

  
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  }, []);

  
  const moodChartData = useMemo(() => {
    const MOOD_SCORES = {
        "Happy": 5, "Energized": 5, 
        "Calm": 4, "Peaceful": 4, 
        "Focus": 3, 
        "Tired": 2, 
        "Sad": 1
    };

    const dataPoints = last7Days.map(date => {
        const dateStr = date.toDateString();
        
        const entry = [...moodHistory].reverse().find(m => new Date(m.date).toDateString() === dateStr);
        return entry ? (MOOD_SCORES[entry.mood.label] || 0) : 0; 
    });
    
    
    const labels = last7Days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));

    return {
        labels,
        datasets: [{ 
            data: dataPoints,
            color: (opacity = 1) => theme.primary, 
            strokeWidth: 3
        }]
    };
  }, [moodHistory, last7Days, theme.primary]);

  
  const hydrationChartData = useMemo(() => {
    
    const historyMap = {};
    weeklyHistory.forEach(item => {
        const d = new Date(item.date).toDateString();
        historyMap[d] = item.amount;
    });
    
    
    historyMap[new Date().toDateString()] = currentIntake;

    
    const dataPoints = last7Days.map(date => {
        const val = historyMap[date.toDateString()] || 0;
        return val / 1000; 
    });

    const labels = last7Days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));

    return {
        labels,
        datasets: [{ data: dataPoints }]
    };
  }, [weeklyHistory, currentIntake, dailyGoal, last7Days]);

  const chartConfig = {
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, 0.5)` : `rgba(100, 100, 100, 0.5)`, 
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalPlaces: 1,
    propsForDots: {
        r: "4",
        strokeWidth: "2",
        stroke: theme.surface 
    },
    labelColor: (opacity = 1) => theme.textSecondary,
    style: {
        borderRadius: 16
    }
  };

  if (!user) {
      return (
        <GradientBackground>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <Ionicons name="stats-chart" size={28} color={theme.primary} />
                        <Text style={[styles.screenTitle, { color: theme.text }]}>Life Insights</Text>
                    </View>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Unlock your personal data.</Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.surface, alignItems: 'center', paddingVertical: 40 }]}>
                    <Ionicons name="lock-closed" size={50} color={theme.textLight} style={{ marginBottom: 20 }} />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 10 }}>Login Required</Text>
                    <Text style={{ textAlign: 'center', color: theme.textSecondary, marginBottom: 30 }}>
                        Create an account to track your mood streaks, hydration history, and daily progress.
                    </Text>
                    
                    <TouchableOpacity 
                        style={[styles.btn, { backgroundColor: theme.primary }]}
                        onPress={() => navigate("Profile", { mode: 'login' })}
                    >
                        <Text style={styles.btnText}>Go to Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </GradientBackground>
      );
  }

  return (
    <GradientBackground>
      {}
      <View style={styles.staticHeader}>
          <View style={styles.titleRow}>
              <Ionicons name="stats-chart" size={28} color={theme.primary} />
              <Text style={[styles.screenTitle, { color: theme.text }]}>Life Insights</Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Visualize your progress toward a better you.</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {}
        <OverallGrowthChart />

        {}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Mood Trends</Text>
                    <Text style={[styles.cardSub, { color: theme.textSecondary }]}>Last 7 Days (1=Terrible, 5=Great)</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>{streak} Day Streak 🔥</Text>
                </View>
            </View>
            
            <LineChart
                data={moodChartData}
                width={SCREEN_WIDTH - 80}
                height={220}
                chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => theme.primary, 
                    propsForDots: { r: "5", strokeWidth: "2", stroke: theme.surface }
                }}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
                fromZero
                segments={4} 
            />
        </View>

        {}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Hydration History</Text>
                    <Text style={[styles.cardSub, { color: theme.textSecondary }]}>Daily water intake of last 7 days (Liters)</Text>
                </View>
            </View>
            
            <BarChart
                data={hydrationChartData}
                width={SCREEN_WIDTH - 80}
                height={220}
                yAxisSuffix="L"
                chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, 
                    fillShadowGradientFrom: '#4CAF50',
                    fillShadowGradientTo: '#4CAF50',
                }}
                style={styles.chart}
                showValuesOnTopOfBars
                fromZero
                withInnerLines={true}
            />
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 0, 
  },
  staticHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 38,
  },
  btn: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 10
  },
  btnText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 16
  }
});

export default AnalyticsScreen;
