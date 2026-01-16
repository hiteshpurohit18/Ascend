import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Dimensions, Vibration, Alert, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated, Image, LayoutAnimation, UIManager } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from "../features/theme/theme.context";
import { usePeriod } from "../features/period/period.context";
import { useAuth } from "../features/auth/auth.context";
import GradientBackground from "../components/GradientBackground";
import { MoonBunny, FortuneCookie } from "../components/CuteFeatures";
import { MagicDust } from "../components/MagicDust";
import { CustomCalendar } from "../components/CustomCalendar";
import { HealthArticles } from "../components/HealthArticles";
import { LineChart, BarChart } from "react-native-chart-kit";

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}



const COLORS = {
    primary: "#ec1392",
    backgroundLight: "#f8f6f7",
    backgroundDark: "#12090e",
    cardDark: "#22101a",
    textLight: "#1e293b",
    textDark: "#ffffff",
    slate400: "#94a3b8",
    slate200: "#e2e8f0"
};

const PHASE_INSIGHTS = {
    menstrual: {
        title: "Menstrual Phase",
        tip: "Your energy may be lower. Focus on iron-rich foods and rest.",
        recommendations: [
             "Eat iron-rich foods (Spinach, Red Meat)",
             "Gentle yoga or walking",
             "Prioritize sleep (8+ hours)",
             "Hydrate with warm tea"
        ]
    },
    follicular: {
        title: "Follicular Phase",
        tip: "Estrogen is rising. You might feel a boost in energy and creativity.",
        recommendations: [
            "Plan creative projects",
            "Try high-intensity workouts",
            "Eat fermented foods",
            "Socialize and network"
        ]
    },
    ovulation: {
        title: "Ovulation Phase",
        tip: "Peak energy levels! You are likely feeling your most confident.",
        recommendations: [
            "Schedule important meetings",
            "Strength training",
            "Eat fiber-rich veggies",
            "Stay hydrated (max water intake)"
        ]
    },
    luteal: {
        title: "Luteal Phase",
        tip: "Progesterone is high. You may feel calmer but more sensitive.",
        recommendations: [
            "Increase magnesium (Dark chocolate, Nuts)",
            "Avoid caffeine late in the day",
            "Practice journaling",
            "Light stretching before bed"
        ]
    }
};

const YOGA_POSES = [
    { name: "Child's Pose", icon: "body-outline", benefit: "Relaxes Back" },
    { name: "Cobbler's Pose", icon: "leaf-outline", benefit: "Opens Hips" },
    { name: "Spinal Twist", icon: "refresh-circle-outline", benefit: "Relieves Tension" },
    { name: "Savasana", icon: "bed-outline", benefit: "Rest & Reset" },
];

export default function PeriodHealthScreen({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme(); 
  const { user } = useAuth();
  const { logs, logPeriod, deleteLog, getCycleStatus, getLastCycleAnalysis, getHistoryChartData, loveNotes, saveLoveNote, deleteNote, getCurrentCycleDay, cycleReviews, saveCycleReview } = usePeriod();
  
  const [padActive, setPadActive] = useState(false);
  const [comfortMessage, setComfortMessage] = useState("");
  const [viewMode, setViewMode] = useState('monthly'); 
  const [showRecModal, setShowRecModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ flow: 'medium', pain: 3, clots: false, mood: 'neutral' });

  
  const [showNoteWriter, setShowNoteWriter] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [activeNote, setActiveNote] = useState(null); 

  const cycleStatus = getCycleStatus();
  const historyData = getHistoryChartData(); 
  const currentDay = getCurrentCycleDay() || 1;
  const isPeriodWeek = currentDay <= 7;
  const hasNotes = loveNotes.length > 0;
  
  
  const isReviewDue = logs.length > 0 && currentDay > 5 && !cycleReviews.find(r => r.date === logs[0]);

  
  const isDark = isDarkMode; 
  const bg = isDark ? COLORS.backgroundDark : COLORS.backgroundLight;
  const cardBg = isDark ? COLORS.cardDark : "#FFFFFF";
  const txt = isDark ? COLORS.textDark : COLORS.textLight;
  const txtSec = isDark ? COLORS.slate400 : "#64748b"; 

  
  const getPhaseKey = () => {
      
      if (cycleStatus.status === 'due' || cycleStatus.status === 'late') return 'menstrual';
      if (currentDay <= 5) return 'menstrual';
      if (currentDay <= 11) return 'follicular';
      if (currentDay <= 16) return 'ovulation';
      return 'luteal';
  };
  const currentPhase = getPhaseKey();
  const phaseData = PHASE_INSIGHTS[currentPhase];

  const handleSaveNote = () => {
      if (!noteText.trim()) return;
      saveLoveNote(noteText);
      setNoteText("");
      setShowNoteWriter(false);
      Alert.alert("Letter Saved 💌", "We will keep this safe for you.");
  };

  const openLoveNote = () => {
      if (loveNotes.length > 0) setActiveNote(loveNotes[0]);
  };

  const dismissNote = () => {
      if (activeNote) {
          deleteNote(activeNote.id);
          setActiveNote(null);
      }
  };

  const toggleCalendar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCalendar(!showCalendar);
  };

  const togglePad = () => {
    const newState = !padActive;
    setPadActive(newState);
    if (newState) Vibration.vibrate(100);
  };

  const handleSaveReview = () => {
      let analysis = "Your cycle was balanced and healthy. 🌸";
      let advice = "Keep nurturing your body with good food and rest.";
      
      if (reviewData.pain >= 4) {
           analysis = "You showed incredible strength through the discomfort. ❤️";
           advice = "Heat, rest, and magnesium are your best friends right now.";
      } else if (reviewData.flow === 'heavy') {
           analysis = "Your body worked hard this cycle. 🌊";
           advice = "Replenish your energy with iron-rich greens and dark chocolate.";
      } else if (reviewData.mood === 'sad' || reviewData.mood === 'anxious') {
           analysis = "It's okay to feel deeply. Be gentle with yourself. ☁️";
           advice = "Slow styling, warm tea, and gentle yoga can help soothe the mind.";
      } else if (reviewData.mood === 'happy') {
           analysis = "You're glowing! Your energy is vibrant. ✨";
           advice = "Channel this beautiful energy into something you love.";
      }
      
      saveCycleReview(logs[0], { ...reviewData, analysis, advice });
      setShowReviewModal(false);
      Alert.alert("Analysis Ready", "Your cycle insights have been generated.");
  };

  const handleDayPress = (day) => {
      Alert.alert(
          "Log Period Start",
          `Did your period start on ${day.dateString}?`,
          [
              { text: "Cancel", style: "cancel" },
              { text: "Yes, Log It", onPress: () => { logPeriod(day.dateString); Alert.alert("Recorded"); } }
          ]
      );
  };

  
  const markedDates = useMemo(() => {
      const marks = {};
      logs.forEach(startDate => {
          
          const start = new Date(startDate);
          
          for (let i = 0; i < 5; i++) {
              const current = new Date(start);
              current.setDate(start.getDate() + i);
              const dateStr = current.toISOString().split('T')[0];
              
              
              const intensity = 1 - (i * 0.2); 
              
              marks[dateStr] = { 
                  selected: true, 
                  intensity: intensity,
                  isStart: i === 0 
              };
          }
      });
      return marks;
  }, [logs]);

  
  const renderChart = () => {
      
      if (historyData.data.length < 2 && viewMode !== 'monthly') {
           let iconName = "stats-chart-outline";
           let title = "Last 4 Cycles Duration";
           if (viewMode === 'yearly') { iconName = "trending-up-outline"; title = "Last 12 Cycles Trends"; }

           return (
              <View>
                 <View style={[styles.chartHeader, { marginBottom: 15 }]}>
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name={iconName} size={16} color={COLORS.primary} />
                            <Text style={{ color: txtSec, fontSize: 13, fontWeight: '500' }}>{title}</Text>
                       </View>
                  </View>
                  <View style={[styles.emptyChart, { backgroundColor: 'transparent' }]}>
                      <Text style={{ color: txtSec }}>Log at least 2 cycles to see trends.</Text>
                  </View>
              </View>
           );
      }

      const chartConfig = {
        backgroundGradientFrom: 'transparent',
        backgroundGradientTo: 'transparent',
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(236, 19, 146, ${opacity})`,
        labelColor: (opacity = 1) => txtSec,
        strokeWidth: 2,
        barPercentage: 0.7,
        decimalPlaces: 0,
      };

      if (viewMode === 'monthly') {
          
          return (
              <View style={styles.chartContainer}>
                  <View style={[styles.chartHeader, { marginBottom: 10 }]}>
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                            <Ionicons name="rose-outline" size={16} color={COLORS.primary} />
                            <Text style={{ color: txtSec, fontSize: 13, fontWeight: '500' }}>Current Cycle Phase</Text>
                       </View>
                       <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
                            <Text style={{ fontSize: 24, fontWeight: '800', color: txt }}>Day {currentDay}</Text>
                            <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: '600' }}>{currentPhase.toUpperCase()}</Text>
                       </View>
                  </View>
                  
                  {}
                  <MoonBunny phase={currentPhase} />

                   {}
                   <View style={{ flexDirection: 'row', height: 140, paddingTop: 30, alignItems: 'flex-end', gap: 8 }}>
                         <ChartBar label="Mens." value="1-5" height={currentPhase === 'menstrual' ? '100%' : '30%'} color={COLORS.primary} isPrimary={currentPhase === 'menstrual'} isDark={isDark} />
                        <ChartBar label="Folli." value="6-11" height={currentPhase === 'follicular' ? '100%' : '40%'} color={COLORS.primary} isPrimary={currentPhase === 'follicular'} isDark={isDark} />
                        <ChartBar label="Ovul." value="12-16" height={currentPhase === 'ovulation' ? '100%' : '50%'} color={COLORS.primary} isPrimary={currentPhase === 'ovulation'} isDark={isDark} />
                        <ChartBar label="Luteal" value="17-28" height={currentPhase === 'luteal' ? '100%' : '60%'} color={COLORS.primary} isPrimary={currentPhase === 'luteal'} isDark={isDark} />
                   </View>
              </View>
          );
      } else if (viewMode === 'quarterly') {
          
          return (
            <View>
                 <View style={[styles.chartHeader, { marginBottom: 15 }]}>
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="stats-chart-outline" size={16} color={COLORS.primary} />
                            <Text style={{ color: txtSec, fontSize: 13, fontWeight: '500' }}>Last 4 Cycles Duration</Text>
                       </View>
                       <Text style={{ fontSize: 24, fontWeight: '800', color: txt, marginTop: 5 }}>{historyData.data.length > 0 ? Math.round(historyData.data.reduce((a,b)=>a+b,0)/historyData.data.length) : 0} Days <Text style={{fontSize:14, color:txtSec}}>Avg</Text></Text>
                  </View>
                <BarChart
                    data={{
                        labels: historyData.labels.slice(0, 4),
                        datasets: [{ data: historyData.data.slice(0, 4) }]
                    }}
                    width={width - 80}
                    height={180}
                    chartConfig={chartConfig}
                    style={{ borderRadius: 16, paddingRight: 40 }}
                    showValuesOnTopOfBars
                />
            </View>
          );
      } else {
          
          return (
            <View>
                 <View style={[styles.chartHeader, { marginBottom: 15 }]}>
                       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="trending-up-outline" size={16} color={COLORS.primary} />
                            <Text style={{ color: txtSec, fontSize: 13, fontWeight: '500' }}>Last 12 Cycles Trends</Text>
                       </View>
                  </View>
                <LineChart
                    data={{
                        labels: historyData.labels,
                        datasets: [{ data: historyData.data }] 
                    }}
                    width={width - 80}
                    height={180}
                    chartConfig={chartConfig}
                    bezier
                    style={{ borderRadius: 16, paddingRight: 30 }}
                />
            </View>
          );
      }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => { setPadActive(false); onClose(); }}
    >
        <View style={{ flex: 1, backgroundColor: bg }}>
            <MagicDust>
            <View style={[styles.header, { 
                backgroundColor: isDark ? 'rgba(18, 9, 14, 0.95)' : 'rgba(248, 246, 247, 0.95)', 
                borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                paddingTop: insets.top + 10
            }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: COLORS.primary + '33', borderColor: COLORS.primary + '4D', borderWidth: 1, overflow: 'hidden' }]}>
                         {user?.profileImage ? (
                             <Image source={{ uri: user.profileImage }} style={{ width: '100%', height: '100%' }} />
                         ) : (
                             <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
                         )}
                    </TouchableOpacity>
                </View>
                <Text style={[styles.headerTitle, { color: txt }]}>Analytics & Insights</Text>
                <View style={styles.headerRight}>
                     <TouchableOpacity onPress={() => setShowNotifications(true)} style={styles.iconButtonGhost}>
                        <Ionicons name="notifications-outline" size={24} color={txtSec} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons name="close" size={22} color={txt} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={[styles.toggleContainer, { backgroundColor: isDark ? COLORS.cardDark : COLORS.slate200 }]}>
                    {['Monthly', 'Quarterly', 'Yearly'].map((mode) => (
                        <TouchableOpacity 
                            key={mode} 
                            onPress={() => setViewMode(mode.toLowerCase())}
                            style={[
                                styles.toggleItem, 
                                viewMode === mode.toLowerCase() && { backgroundColor: isDark ? COLORS.backgroundDark : '#FFF', shadowOpacity: 0.1 }
                            ]}
                        >
                            <Text style={[
                                styles.toggleText, 
                                { color: viewMode === mode.toLowerCase() ? COLORS.primary : txtSec }
                            ]}>{mode}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {}
                {isReviewDue && (
                    <TouchableOpacity onPress={() => setShowReviewModal(true)} style={[styles.sectionContainer, styles.checkInCard, { backgroundColor: COLORS.primary }]}>
                        <View style={{flexDirection:'row', alignItems:'center', gap:15}}>
                             <View style={{width:50, height:50, borderRadius:25, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center'}}>
                                 <Ionicons name="clipboard-outline" size={28} color="#FFF" />
                             </View>
                             <View style={{flex:1}}>
                                 <Text style={{color:'#FFF', fontSize:18, fontWeight:'bold'}}>Cycle Check-in</Text>
                                 <Text style={{color:'rgba(255,255,255,0.9)', fontSize:13}}>How was your period? Log symptoms to get AI insights.</Text>
                             </View>
                             <Ionicons name="chevron-forward" size={24} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                )}

                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionTitle, { color: txt }]}>Flow Intensity</Text>
                        <TouchableOpacity 
                            onPress={toggleCalendar}
                            activeOpacity={0.8}
                            style={[
                                styles.dateBadge, 
                                { 
                                    backgroundColor: isDark ? '#3d162c' : '#fce4ec', 
                                    paddingHorizontal: 12, 
                                    paddingVertical: 6, 
                                    borderRadius: 20,
                                    borderWidth: 1,
                                    borderColor: isDark ? '#b0116d' : '#f8bbd0'
                                }
                            ]}
                        >
                            <Ionicons 
                                name="calendar-outline" 
                                size={14} 
                                color={COLORS.primary} 
                            />
                            <Text style={[styles.dateBadgeText, { color: COLORS.primary, marginLeft: 4, fontWeight: '800' }]}>
                                {showCalendar ? "HIDE" : "SHOW"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {showCalendar && (
                        <View style={[styles.card, { backgroundColor: cardBg, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                             <CustomCalendar onDayPress={handleDayPress} markedDates={markedDates} activeColor={COLORS.primary} showLegend={true} />
                        </View>
                    )}
                </View>

                {}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: txt }]}>Comparison</Text>
                    <View style={[styles.glassCard, { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                         {renderChart()}
                    </View>
                </View>
                
                {}
                {cycleReviews.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: txt }]}>Past Cycle Insights</Text>
                    {cycleReviews.map((review, i) => (
                        <LinearGradient
                            key={i}
                            colors={isDark ? ['#331020', '#1a0b12'] : ['#FFF0F5', '#FFF']}
                            start={{x:0, y:0}} end={{x:1, y:1}}
                            style={[styles.card, { padding: 24, marginBottom: 16, borderWidth: 0, elevation: 2 }]}
                        >
                            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
                                <View>
                                    <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
                                         <Ionicons name="calendar-clear-outline" size={16} color={COLORS.primary}/>
                                         <Text style={{fontWeight:'800', fontSize:18, color:txt}}>{new Date(review.date).toLocaleDateString('en-US', { month:'long' })}</Text>
                                    </View>
                                    <Text style={{fontSize:13, color:txtSec, marginTop:4, marginLeft: 24}}>{new Date(review.date).getDate()}{['st','nd','rd'][((new Date(review.date).getDate()+90)%100-10)%10-1]||'th'} • {review.flow.charAt(0).toUpperCase() + review.flow.slice(1)} Flow</Text>
                                </View>
                                <View style={{width:44, height:44, borderRadius:22, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' :'#FFF', justifyContent:'center', alignItems:'center', shadowColor:COLORS.primary, shadowOpacity:0.1, elevation:3}}>
                                    <Text style={{fontSize:22}}>{review.mood === 'happy' ? '✨' : review.mood === 'sad' ? '🌧️' : review.mood === 'anxious' ? '🍃' : '🌸'}</Text>
                                </View>
                            </View>
                            
                            <Text style={{color:txt, fontSize:16, fontStyle:'italic', lineHeight:24, marginBottom:16, opacity: 0.9}}>“{review.analysis}”</Text>
                            
                            {review.advice && (
                                <View style={{flexDirection:'row', gap:10, marginBottom:16, backgroundColor: isDark?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.6)', padding:12, borderRadius:12}}>
                                    <Ionicons name="sparkles-sharp" size={16} color={COLORS.primary} style={{marginTop:2}} />
                                    <View style={{flex:1}}>
                                        <Text style={{fontSize:11, color:COLORS.primary, fontWeight:'bold', letterSpacing:1, marginBottom:4, textTransform:'uppercase'}}>Suggestion</Text>
                                        <Text style={{fontSize:14, color:txt, lineHeight:20}}>{review.advice}</Text>
                                    </View>
                                </View>
                            )}
                            
                            <View style={{flexDirection:'row', gap:10, borderTopWidth:1, borderTopColor: isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.05)', paddingTop:16}}>
                                {review.clots && (
                                    <View style={{flexDirection:'row', alignItems:'center', gap:6, backgroundColor: isDark?'rgba(236, 19, 146, 0.2)':'#FCE4EC', paddingHorizontal:12, paddingVertical:6, borderRadius:12}}>
                                        <Ionicons name="water" size={14} color={COLORS.primary}/>
                                        <Text style={{fontSize:12, color:COLORS.primary, fontWeight:'bold'}}>Clots</Text>
                                    </View>
                                )}
                                <View style={{flexDirection:'row', alignItems:'center', gap:6, backgroundColor: isDark?'rgba(255,255,255,0.1)':'#F1F5F9', paddingHorizontal:12, paddingVertical:6, borderRadius:12}}>
                                    <Ionicons name="fitness" size={14} color={txtSec}/>
                                    <Text style={{fontSize:12, color:txtSec, fontWeight:'bold'}}>Pain: {review.pain}/5</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    ))}
                </View>
                )}

                {}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: txt }]}>AI Wellness Insights</Text>
                    <LinearGradient
                        colors={['rgba(236, 19, 146, 0.8)', 'rgba(147, 51, 234, 0.8)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.aiCard}
                    >
                         <View style={styles.aiHeader}>
                            <View style={styles.aiIconBox}>
                                <Ionicons name="bulb-outline" size={24} color="#FFF" />
                            </View>
                            <View>
                                <Text style={styles.aiLabel}>PERSONALIZED TIP</Text>
                                <Text style={styles.aiTitle}>{phaseData.title}</Text>
                            </View>
                         </View>
                         <Text style={styles.aiText}>
                            {phaseData.tip}
                         </Text>
                         <View style={styles.aiFooter}>
                                <View style={styles.avatars}>
                                    <View style={[styles.avatar, { backgroundColor: '#334155' }]}><Ionicons name="person" size={12} color="#FFF"/></View>
                                    <View style={[styles.avatar, { backgroundColor: '#475569', marginLeft: -8 }]}><Text style={{fontSize: 8, color:'#FFF', fontWeight:'bold'}}>AI</Text></View>
                                </View>
                                <TouchableOpacity style={styles.aiBtn} onPress={() => setShowRecModal(true)}>
                                    <Text style={styles.aiBtnText}>VIEW RECOMMENDATIONS</Text>
                                </TouchableOpacity>
                         </View>
                    </LinearGradient>
                </View>

                {}
                
                 {}
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: txt }]}>Comfort Toolkit</Text>
                     <View style={styles.actionGrid}>
                        <TouchableOpacity style={[ styles.actionCard, { backgroundColor: padActive ? '#FF8A80' : cardBg } ]} onPress={togglePad}>
                            <Ionicons name={padActive ? "flame" : "flame-outline"} size={32} color={padActive ? "#FFF" : "#FF5252"} />
                            <Text style={[styles.actionText, { color: padActive ? '#FFF' : txt }]}>Heat Pad</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionCard, { backgroundColor: cardBg }]} onPress={() => { setComfortMessage("🍫 You deserve sweetness!"); setTimeout(() => setComfortMessage(""), 3000); }}>
                            <Ionicons name="cafe-outline" size={32} color="#795548" />
                            <Text style={[styles.actionText, { color: txt }]}>Chocolate</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionCard, { backgroundColor: cardBg }]} onPress={() => { setComfortMessage("❤️ You are loved."); setTimeout(() => setComfortMessage(""), 3000); }}>
                            <Ionicons name="heart-outline" size={32} color="#E91E63" />
                            <Text style={[styles.actionText, { color: txt }]}>Hug</Text>
                        </TouchableOpacity>
                    </View>
                    <FortuneCookie />
                </View>
                 
                 {}
                 <View style={styles.sectionContainer}>
                     {isPeriodWeek && hasNotes ? (
                        <PulsingGift onPress={openLoveNote} isDark={isDark} />
                    ) : (
                         <TouchableOpacity style={[styles.loveNoteCard, { backgroundColor: cardBg }]} onPress={() => setShowNoteWriter(true)}>
                            <View style={[styles.loveIconBox, { backgroundColor: isDark ? '#4a1025' : '#FCE4EC' }]}>
                                <Ionicons name="mail-outline" size={24} color="#E91E63" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.loveTitle, { color: txt }]}>Write a Love Note</Text>
                                <Text style={[styles.loveSub, { color: txtSec }]}>
                                    {isPeriodWeek ? "Write a note for tomorrow." : "Send supportive message for next cycle."}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                 {}
                 <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: txt }]}>Gentle Movement</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                        {YOGA_POSES.map((pose, i) => (
                            <View key={i} style={[styles.yogaCard, { backgroundColor: cardBg }]}>
                                <Ionicons name={pose.icon} size={40} color={COLORS.primary} />
                                <Text style={[styles.yogaTitle, { color: txt }]}>{pose.name}</Text>
                                <Text style={[styles.yogaSub, { color: txtSec }]}>{pose.benefit}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                 <HealthArticles />
                 <View style={{ height: 100 }} />
            </ScrollView>

            {}
             <Modal visible={showNoteWriter} transparent animationType="slide" onRequestClose={() => setShowNoteWriter(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={[styles.writerContainer, { backgroundColor: cardBg }]}>
                            <Text style={[styles.modalTitle, { color: txt }]}>To My Future Self...</Text>
                            <TextInput style={[styles.input, { color: txt, borderColor: txtSec, backgroundColor: bg }]} multiline placeholder="Dear me..." placeholderTextColor={theme.placeholder} value={noteText} onChangeText={setNoteText} />
                            <View style={styles.btnRow}>
                                <TouchableOpacity onPress={() => setShowNoteWriter(false)} style={{ padding: 15 }}><Text style={{ color: txtSec }}>Cancel</Text></TouchableOpacity>
                                <TouchableOpacity onPress={handleSaveNote} style={[styles.saveBtn, { backgroundColor: COLORS.primary }]}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Seal Letter 💌</Text></TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
            {}
            <Modal visible={showReviewModal} transparent animationType="slide" onRequestClose={() => setShowReviewModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.writerContainer, { backgroundColor: cardBg }]}>
                         <Text style={[styles.modalTitle, { color: txt }]}>Cycle Check-in</Text>
                         
                         {}
                         <Text style={{color:txtSec, fontWeight:'bold', marginBottom:10}}>Flow Intensity</Text>
                         <View style={{flexDirection:'row', gap:10, marginBottom:20}}>
                             {['light', 'medium', 'heavy'].map(f => (
                                 <TouchableOpacity key={f} onPress={() => setReviewData({...reviewData, flow: f})} style={[styles.optionBtn, reviewData.flow === f && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                                     <Text style={[styles.optionText, reviewData.flow === f && { color:'#FFF' }]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                                 </TouchableOpacity>
                             ))}
                         </View>

                         {}
                         <Text style={{color:txtSec, fontWeight:'bold', marginBottom:10}}>Pain Level (1-5)</Text>
                         <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:20}}>
                             {[1,2,3,4,5].map(p => (
                                 <TouchableOpacity key={p} onPress={() => setReviewData({...reviewData, pain: p})} style={[styles.circleBtn, reviewData.pain === p && { backgroundColor: COLORS.primary }]}>
                                     <Text style={[styles.optionText, reviewData.pain === p && { color:'#FFF' }]}>{p}</Text>
                                 </TouchableOpacity>
                             ))}
                         </View>
                         
                         {}
                         <View style={{flexDirection:'row',alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
                             <Text style={{color:txtSec, fontWeight:'bold'}}>Experienced Clots?</Text>
                             <TouchableOpacity onPress={() => setReviewData({...reviewData, clots: !reviewData.clots})} style={[styles.toggleBtn, reviewData.clots && { backgroundColor: COLORS.primary }]}>
                                 <View style={[styles.toggleCircle, reviewData.clots && { alignSelf:'flex-end' }]} />
                             </TouchableOpacity>
                         </View>

                          {}
                          <Text style={{color:txtSec, fontWeight:'bold', marginBottom:10}}>Mood</Text>
                         <View style={{flexDirection:'row', gap:10, marginBottom:20, flexWrap:'wrap'}}>
                             {['happy', 'neutral', 'sad', 'anxious'].map(m => (
                                 <TouchableOpacity key={m} onPress={() => setReviewData({...reviewData, mood: m})} style={[styles.optionBtn, reviewData.mood === m && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                                     <Text style={[styles.optionText, reviewData.mood === m && { color:'#FFF' }]}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text>
                                 </TouchableOpacity>
                             ))}
                         </View>

                         <TouchableOpacity onPress={handleSaveReview} style={[styles.saveBtn, { backgroundColor: COLORS.primary, marginTop:10 }]}>
                             <Text style={{ color: '#FFF', fontWeight: 'bold', textAlign:'center' }}>Analyze & Save</Text>
                         </TouchableOpacity>
                         <TouchableOpacity onPress={()=>setShowReviewModal(false)} style={{padding:15, alignItems:'center'}}>
                             <Text style={{color:txtSec}}>Cancel</Text>
                         </TouchableOpacity>
                    </View>
                </View>
            </Modal>

             {}
            <Modal visible={!!activeNote} transparent animationType="fade" onRequestClose={dismissNote}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.letterContainer, { backgroundColor: isDark ? '#220e18' : '#FFF0F5', borderColor: isDark ? '#880E4F' : '#E91E63' }]}>
                        <Ionicons name="heart" size={48} color={isDark ? '#F48FB1' : '#E91E63'} style={{ marginBottom: 20 }} />
                        <Text style={[styles.letterTitle, { color: isDark ? '#F48FB1' : '#880E4F' }]}>From You, With Love</Text>
                        <Text style={[styles.letterText, { color: isDark ? '#F8BBD0' : '#AD1457' }]}>"{activeNote?.text}"</Text>
                        <TouchableOpacity onPress={dismissNote} style={styles.letterBtn}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Thank You, Me ❤️</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
             {}
            <Modal visible={showRecModal} transparent animationType="slide" onRequestClose={() => setShowRecModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.writerContainer, { backgroundColor: cardBg }]}>
                        <View style={{flexDirection:'row', alignItems:'center', gap:10, marginBottom:10}}>
                             <Ionicons name="sparkles" size={24} color={COLORS.primary} />
                             <Text style={[styles.modalTitle, { color: txt, marginBottom:0 }]}>{phaseData.title} Tips</Text>
                        </View>
                        <Text style={{color: txtSec, marginBottom:20}}>{phaseData.tip}</Text>
                        {phaseData.recommendations.map((rec, i) => (
                             <View key={i} style={{flexDirection:'row', gap:10, marginBottom:12, alignItems:'flex-start'}}>
                                 <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                 <Text style={{color: txt, fontSize:16, flex:1}}>{rec}</Text>
                             </View>
                        ))}
                        <TouchableOpacity onPress={() => setShowRecModal(false)} style={[styles.saveBtn, { backgroundColor: COLORS.primary, marginTop:20, alignSelf:'center' }]}>
                             <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Got it!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {}
            <Modal visible={showNotifications} transparent animationType="fade" onRequestClose={() => setShowNotifications(false)}>
                <TouchableOpacity activeOpacity={1} onPress={() => setShowNotifications(false)} style={styles.modalOverlay}>
                    <View style={[styles.writerContainer, { backgroundColor: cardBg, width:'85%', padding:0, overflow:'hidden' }]}>
                         <View style={{padding:20, borderBottomWidth:1, borderBottomColor: isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.05)', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                              <Text style={[styles.modalTitle, { marginBottom:0 }]}>Reminders 🔔</Text>
                              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                                  <Ionicons name="close" size={24} color={txtSec} />
                              </TouchableOpacity>
                         </View>
                         <View style={{padding:20}}>
                             {(() => {
                                const items = [];
                                
                                if (cycleStatus.status === 'period') items.push({ icon: 'water', color: COLORS.primary, title: 'Period Log', msg: `Day ${currentDay} of your cycle.` });
                                else if (cycleStatus.status === 'due') items.push({ icon: 'alert-circle', color: '#fbbf24', title: 'Upcoming', msg: `Period expected in ${cycleStatus.daysUntil} days.` });
                                else items.push({ icon: 'calendar', color: txtSec, title: 'Cycle Status', msg: `Current Phase: ${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}` });

                                
                                items.push({ icon: 'leaf', color: '#4ade80', title: 'Wellness Tip', msg: phaseData.tip });

                                
                                items.push({ icon: 'heart', color: '#f472b6', title: 'Self Care', msg: "Remember to drink 2L of water today! 💧" });
                                
                                return items;
                             })().map((item, i) => (
                                 <View key={i} style={{flexDirection:'row', gap:15, marginBottom:20}}>
                                      <View style={{width:40, height:40, borderRadius:20, backgroundColor: isDark?'rgba(255,255,255,0.05)':'#F8FAFC', justifyContent:'center', alignItems:'center'}}>
                                          <Ionicons name={item.icon} size={20} color={item.color} />
                                      </View>
                                      <View style={{flex:1}}>
                                          <Text style={{fontWeight:'bold', color:txt, fontSize:15}}>{item.title}</Text>
                                          <Text style={{color:txtSec, fontSize:13, lineHeight:18}}>{item.msg}</Text>
                                      </View>
                                 </View>
                             ))}
                             <TouchableOpacity onPress={() => setShowNotifications(false)} style={{marginTop:10, alignSelf:'center'}}>
                                 <Text style={{color:COLORS.primary, fontWeight:'600'}}>Got it!</Text>
                             </TouchableOpacity>
                         </View>
                    </View>
                </TouchableOpacity>
            </Modal>

             {comfortMessage ? <View style={[styles.toast, { backgroundColor: txt }]}><Text style={[styles.toastText, { color: bg }]}>{comfortMessage}</Text></View> : null}
        </MagicDust>
        </View>
    </Modal>
  );
}

const ChartBar = ({ label, value, height, color, isPrimary, isDark }) => (
    <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: '100%', flex:1, gap: 8 }}>
        <View style={{ width: '80%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
             <View style={{ 
                width: '100%', 
                height: height, 
                backgroundColor: isPrimary ? color : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'),
                borderRadius: 8, 
                alignItems: 'center',
                position: 'relative'
             }}>
                 <View style={{ position: 'absolute', top: -20, width: 80, alignItems:'center' }}>
                     <Text style={{  fontSize: 10, fontWeight: 'bold', color: isDark ? '#A0A0A0' : '#94a3b8' }}>{value}</Text>
                 </View>
             </View>
        </View>
        <Text style={{ fontSize: 10,  fontWeight: 'bold', color: isDark ? '#A0A0A0' : '#94a3b8', textTransform: 'uppercase' }}>{label}</Text>
    </View>
);

const PulsingGift = ({ onPress, isDark }) => {
    const scale = React.useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(scale, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])).start();
    }, []);
    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View style={[styles.loveNoteCard, { 
                backgroundColor: isDark ? '#331020' : '#FFF0F5', 
                borderColor: isDark ? '#880E4F' : '#E91E63', 
                borderWidth: 2, 
                transform: [{ scale }] 
            }]}>
                <View style={[styles.loveIconBox, { backgroundColor: isDark ? '#880E4F' : '#E91E63' }]}>
                    <Ionicons name="gift" size={24} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.loveTitle, { color: isDark ? '#F48FB1' : '#C2185B' }]}>A Gift For You</Text>
                    <Text style={[styles.loveSub, { color: isDark ? '#F8BBD0' : '#D81B60' }]}>Tap to open.</Text>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', letterSpacing: -0.5 },
    headerRight: { flexDirection: 'row', gap: 10 },
    iconButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    iconButtonGhost: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },
    toggleContainer: { flexDirection: 'row', padding: 4, borderRadius: 12, height: 44, marginBottom: 20 },
    toggleItem: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
    toggleText: { fontSize: 13, fontWeight: '600' },
    sectionContainer: { marginBottom: 24 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', letterSpacing: -0.5, marginBottom: 10 },
    dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dateBadgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    card: { borderRadius: 20, padding: 10, borderWidth: 1 },
    glassCard: { borderRadius: 20, padding: 20, borderWidth: 1, overflow: 'hidden' },
    chartContainer: { },
    chartHeader: { marginBottom: 20 },
    aiCard: { borderRadius: 20, padding: 24 },
    aiHeader: { flexDirection: 'row', gap: 12, marginBottom: 15, alignItems: 'center' },
    aiIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    aiLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 'bold', uppercase: true, letterSpacing: 1 },
    aiTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    aiText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 22 },
    aiFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 15 },
    avatars: { flexDirection: 'row' },
    avatar: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#12090e' },
    aiBtn: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    aiBtnText: { color: COLORS.primary, fontSize: 10, fontWeight: '800' },
    loveNoteCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, gap: 15, elevation: 2 },
    loveIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FCE4EC', justifyContent: 'center', alignItems: 'center' },
    loveTitle: { fontSize: 16, fontWeight: 'bold' },
    loveSub: { fontSize: 12 },
    actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 10 },
    actionCard: { flex: 1, padding: 15, borderRadius: 20, alignItems: 'center', justifyContent: 'center', height: 100 },
    actionText: { fontWeight: '600', marginTop: 8, fontSize: 12 },
    yogaCard: { width: 140, height: 140, borderRadius: 20, padding: 15, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    yogaTitle: { fontWeight: 'bold', marginTop: 10, marginBottom: 4, textAlign: 'center' },
    yogaSub: { fontSize: 12, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    writerContainer: { width: '90%', borderRadius: 24, padding: 25 },
    input: { borderWidth: 1, borderRadius: 16, padding: 15, height: 120, textAlignVertical: 'top', fontSize: 16, marginBottom: 20 },
    btnRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10 },
    saveBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    toast: { position: 'absolute', top: '50%', alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, zIndex: 100, elevation: 10 },
    toastText: { fontWeight: 'bold', textAlign: 'center' },
    letterContainer: { width: '85%', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 2, borderColor: '#E91E63', elevation: 10 },
    letterTitle: { fontSize: 22, fontWeight: 'bold', color: '#880E4F', marginBottom: 20 },
    letterText: { fontSize: 18, color: '#AD1457', textAlign: 'center', fontStyle: 'italic', lineHeight: 28, marginBottom: 20 },
    letterBtn: { backgroundColor: '#E91E63', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    emptyChart: { height: 150, justifyContent: 'center', alignItems: 'center' },
    checkInCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, marginBottom: 24, paddingVertical: 25 },
    tag: { backgroundColor:'rgba(255,255,255,0.05)', borderRadius:8, paddingHorizontal:8, paddingVertical:4, borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
    tagText: { fontSize:10, color:'#94a3b8' },
    optionBtn: { paddingVertical:8, paddingHorizontal:16, borderRadius:20, backgroundColor:'rgba(148, 163, 184, 0.1)', borderWidth:1, borderColor:'rgba(148, 163, 184, 0.2)' },
    optionText: { fontWeight:'600' },
    circleBtn: { width:40, height:40, borderRadius:20, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(148, 163, 184, 0.1)' },
    toggleBtn: { width:50, height:28, borderRadius:14, backgroundColor:'rgba(148, 163, 184, 0.2)', justifyContent:'center', paddingHorizontal:2 },
    toggleCircle: { width:24, height:24, borderRadius:12, backgroundColor:'#FFF', shadowOpacity:0.1, elevation:2 }
});
