import { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, KeyboardAvoidingView, Platform, Keyboard, Alert, Animated, Easing, Switch, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestNotificationPermissions, scheduleHydrationReminder, cancelHydrationReminder } from '../features/notifications/notifications.service';
import { useHydration } from '../features/hydration/hydration.context';
import { useTheme } from '../features/theme/theme.context';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import GradientBackground from './GradientBackground';

const { width } = Dimensions.get('window');

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const Wave = ({ percentage }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loop.start();

    Animated.timing(heightAnim, {
      toValue: percentage,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -140],
  });

  const translateY = heightAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [220, 0],
  });

  const wavePath = "M 0 15 Q 35 0 70 15 T 140 15 T 210 15 T 280 15 V 300 H 0 Z";

  return (
    <View style={StyleSheet.absoluteFill}>
      <AnimatedSvg
        height="300"
        width="280"
        style={{
          transform: [
            { translateX },
            { translateY }
          ],
          position: 'absolute',
          top: -15,
        }}
      >
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#4FC3F7" stopOpacity="1" />
            <Stop offset="1" stopColor="#0288D1" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path d={wavePath} fill="url(#grad)" />
      </AnimatedSvg>
    </View>
  );
};

const HydrationModal = ({ visible, onClose }) => {
  const { currentIntake, dailyGoal, addWater, undoLast, resetIntake, setGoal, percentage, history, setRemindersEnabled } = useHydration();
  const { theme, isDarkMode } = useTheme();
  
  const [customAmount, setCustomAmount] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal.toString());
  
  const prevPercentage = useRef(percentage);

  const [remindersActive, setRemindersActive] = useState(false);

  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.8) {
          Animated.timing(panY, {
            toValue: 0,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
    }
  }, [visible, panY]);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("hydrationReminders");
        if (saved !== null) {
          setRemindersActive(JSON.parse(saved));
        }
      } catch (e) { console.log(e); }
    })();
  }, [visible]);

  const toggleReminders = async (value) => {
    try {
      if (value) {
        const granted = await requestNotificationPermissions();
        if (granted) {
          await scheduleHydrationReminder(currentIntake, dailyGoal);
          setRemindersActive(true);
          setRemindersEnabled(true);
          await AsyncStorage.setItem("hydrationReminders", JSON.stringify(true));
        } else {
          setRemindersActive(false);
          setRemindersEnabled(false);
          await AsyncStorage.setItem("hydrationReminders", JSON.stringify(false));
        }
      } else {
        await cancelHydrationReminder();
        setRemindersActive(false);
        setRemindersEnabled(false);
        await AsyncStorage.setItem("hydrationReminders", JSON.stringify(false));
      }
    } catch (error) {
       console.log("Toggle error:", error);
       Alert.alert("Toggle Error", error.message || "Unknown error occurred");
    }
  };

  useEffect(() => {
    if (prevPercentage.current < 50 && percentage >= 50) {
      Toast.show({
        type: 'success',
        text1: 'Halfway There! 💧',
        text2: 'Great job staying hydrated. Keep it up!',
      });
    } else if (prevPercentage.current < 100 && percentage >= 100) {
      Toast.show({
        type: 'success',
        text1: 'Goal Reached! 🎉',
        text2: 'You hit your daily hydration goal. Amazing!',
      });
    }
    prevPercentage.current = percentage;
  }, [percentage]);

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0) {
       addWater(amount);
       setCustomAmount('');
       Keyboard.dismiss();
    }
  };

  const handleGoalSave = () => {
    const goal = parseInt(tempGoal);
    if (!isNaN(goal) && goal > 500) {
      setGoal(goal);
    }
    setIsEditingGoal(false);
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Hydration",
      "Are you sure you want to clear your drinking progress for today?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetIntake }
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
        <KeyboardAvoidingView 
           behavior={Platform.OS === "ios" ? "padding" : "height"}
           style={styles.modalContainer}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
          
          <GradientBackground 
            style={[
              styles.modalContent, 
              { backgroundColor: 'transparent', flex: 0 }
            ]}
          >
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Hydration</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary, fontSize: 12 }]} numberOfLines={1}>Quench your thirst.</Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TouchableOpacity 
                    onPress={() => toggleReminders(!remindersActive)}
                    style={{ 
                      padding: 8, 
                      backgroundColor: remindersActive ? theme.primary + "20" : "transparent",
                      borderRadius: 20
                    }}
                  >
                    <Ionicons 
                      name={remindersActive ? "alarm" : "alarm-outline"} 
                      size={24} 
                      color={remindersActive ? theme.primary : theme.textSecondary} 
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleReset} style={[styles.resetBtn, { width: 36, height: 36 }]}>
                  <Ionicons name="refresh" size={18} color="#FF6B6B" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { width: 36, height: 36, backgroundColor: theme.surfaceHighlight }]}>
                  <Ionicons name="close" size={22} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              keyboardShouldPersistTaps="handled"
            >
              
              <View style={styles.progressContainer}>
                <View style={styles.bottleContainer}>
                  <Wave percentage={percentage} />
                  
                  <View style={styles.bottleOverlay}>
                     <Text style={styles.percentageText}>{percentage}%</Text>
                  </View>
                </View>
                
                <View style={[styles.goalInfoContainer, { backgroundColor: theme.surfaceHighlight }]}>
                   {isEditingGoal ? (
                       <View style={styles.goalEditContainer}>
                          <TextInput 
                            value={tempGoal}
                            onChangeText={setTempGoal}
                            keyboardType="numeric"
                            style={styles.goalInput}
                            autoFocus
                            onBlur={handleGoalSave}
                          />
                          <Text style={styles.unitText}>ml</Text>
                          <TouchableOpacity onPress={handleGoalSave} style={styles.goalSaveBtn}>
                            <Ionicons name="checkmark" size={16} color="#FFF" />
                          </TouchableOpacity>
                       </View>
                     ) : (
                       <TouchableOpacity onPress={() => setIsEditingGoal(true)} style={styles.goalDisplay}>
                          <Text style={[styles.amountText, { color: theme.text }]}>{currentIntake} / {dailyGoal} ml</Text>
                          <Ionicons name="pencil" size={14} color="#0277BD" style={{ marginLeft: 8 }} />
                       </TouchableOpacity>
                     )}
                </View>

              </View>

              <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.addBtn} onPress={() => addWater(250)}>
                   <Ionicons name="water" size={20} color="#FFF" />
                   <Text style={styles.addBtnText}>+250ml</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#0288D1' }]} onPress={() => addWater(500)}>
                   <Ionicons name="beer-outline" size={20} color="#FFF" />
                   <Text style={styles.addBtnText}>+500ml</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.secondaryControls}>
                  <View style={[styles.customInputWrapper, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                    <TextInput 
                      placeholder="Custom ml" 
                      placeholderTextColor={theme.placeholder}
                      style={[styles.customInput, { color: theme.text }]} 
                      keyboardType="numeric"
                      value={customAmount}
                      onChangeText={setCustomAmount}
                    />
                    <TouchableOpacity onPress={handleCustomAdd} style={styles.customAddBtn}>
                      <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    style={[styles.undoBtn, { backgroundColor: theme.surfaceHighlight, borderColor: theme.divider, opacity: history.length > 0 ? 1 : 0.4 }]} 
                    onPress={undoLast}
                    disabled={history.length === 0}
                  >
                     <Ionicons name="arrow-undo" size={20} color={theme.textSecondary} />
                     <Text style={[styles.undoText, { color: theme.textSecondary }]}>Undo</Text>
                  </TouchableOpacity>
              </View>

              <View style={styles.infoSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Why Hydrate?</Text>
                
                <View style={[styles.infoCard, { backgroundColor: theme.surface, shadowColor: theme.text }]}>
                   <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#0d47a1' : '#E1F5FE' }]}>
                     <Ionicons name="flash" size={24} color="#0288D1" />
                   </View>
                   <View style={styles.infoText}>
                     <Text style={[styles.infoTitle, { color: theme.text }]}>Boosts Energy</Text>
                     <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>Dehydration causes fatigue. Water keeps you alert and focused.</Text>
                   </View>
                </View>

                <View style={[styles.infoCard, { backgroundColor: theme.surface, shadowColor: theme.text }]}>
                   <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#004d40' : '#E0F2F1' }]}>
                     <Ionicons name="happy" size={24} color="#009688" />
                   </View>
                   <View style={styles.infoText}>
                     <Text style={[styles.infoTitle, { color: theme.text }]}>Improves Mood</Text>
                     <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>Staying hydrated can prevent headaches and irritability.</Text>
                   </View>
                </View>

                <View style={[styles.infoCard, { backgroundColor: theme.surface, shadowColor: theme.text }]}>
                   <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#b71c1c' : '#FFEBEE' }]}>
                     <Ionicons name="body" size={24} color="#E57373" />
                   </View>
                   <View style={styles.infoText}>
                     <Text style={[styles.infoTitle, { color: theme.text }]}>Physical Performance</Text>
                     <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>Essential for muscle function and joint lubrication.</Text>
                   </View>
                </View>

                 <Text style={[styles.sectionTitle, { marginTop: 20, color: theme.text }]}>Risks of Dehydration</Text>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    <View style={[styles.riskCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                       <Text style={styles.riskEmoji}>🤕</Text>
                       <Text style={[styles.riskTitle, { color: theme.textSecondary }]}>Headaches</Text>
                    </View>
                    <View style={[styles.riskCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                       <Text style={styles.riskEmoji}>📉</Text>
                       <Text style={[styles.riskTitle, { color: theme.textSecondary }]}>Fatigue</Text>
                    </View>
                     <View style={[styles.riskCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                       <Text style={styles.riskEmoji}>🧶</Text>
                       <Text style={[styles.riskTitle, { color: theme.textSecondary }]}>Dry Skin</Text>
                    </View>
                    <View style={[styles.riskCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                       <Text style={styles.riskEmoji}>🧠</Text>
                       <Text style={[styles.riskTitle, { color: theme.textSecondary }]}>Brain Fog</Text>
                    </View>
                 </ScrollView>

              </View>

            </ScrollView>
          </GradientBackground>
          <Toast />
        </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '90%',
    padding: 24,
    paddingTop: 10,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 5,
  },
  dragHandle: {
    width: 50,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0277BD',
  },
  subtitle: {
    fontSize: 14,
    color: '#546E7A',
    fontWeight: '500',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECEFF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    height: 40,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  bottleContainer: {
    width: 140,
    height: 220,
    borderWidth: 4,
    borderColor: '#0288D1',
    borderRadius: 70, 
    overflow: 'hidden',
    backgroundColor: '#E1F5FE',
    position: 'relative',
    elevation: 5,
    shadowColor: "#0288D1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 15,
  },
  bottleFill: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  bottleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#01579B', 
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555',
  },
  goalInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECEFF1',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  goalDisplay: {
    flexDirection: 'row', 
    alignItems: 'center',
  },
  goalEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
  },
  goalInput: {
    width: 60,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0277BD',
    textAlign: 'center',
    padding: 0,
  },
  unitText: {
    fontSize: 14,
    color: '#888',
    marginRight: 6,
  },
  goalSaveBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 15,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginBottom: 30,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#29B6F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 2,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 6,
  },
  customInputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 44,
    alignItems: 'center',
    paddingLeft: 12,
    width: 140,
  },
  customInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  customAddBtn: {
    backgroundColor: '#0277BD',
    height: '100%',
    width: 40,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECEFF1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    height: 44,
    borderWidth: 1,
    borderColor: '#CFD8DC',
  },
  undoText: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#546E7A',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#37474F',
    marginBottom: 15,
  },
  infoSection: {
    marginBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  horizontalScroll: {
    paddingBottom: 10,
  },
  riskCard: {
    width: 100,
    height: 100,
    backgroundColor: '#FFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  riskEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  riskTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
});

export default HydrationModal;
