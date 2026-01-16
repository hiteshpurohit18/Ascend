import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSleep } from '../features/sleep/sleep.context';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

const SleepModal = ({ visible, onClose }) => {
  const { checklist, toggleItem, progress } = useSleep();
  const [wakeTime, setWakeTime] = useState(new Date(new Date().setHours(7, 0, 0, 0)));
  const [showPicker, setShowPicker] = useState(false);
  const [sleepDuration, setSleepDuration] = useState('');

  const allDone = progress === 100;

  const handleGoodNight = () => {
    onClose();
    setTimeout(() => {
        Toast.show({
            type: 'success',
            text1: 'Good Night! 🌙',
            text2: 'Sleep well and wake up refreshed.',
            visibilityTime: 4000,
        });
    }, 300);
  };

  useEffect(() => {
    const now = new Date();
    let target = new Date(wakeTime);
    if (target < now) {
        target.setDate(target.getDate() + 1);
    }
    
    const diffMs = target - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    setSleepDuration(`${diffHrs}h ${diffMins}m`);

    const interval = setInterval(() => {
    }, 60000); 
    return () => clearInterval(interval);
  }, [wakeTime, visible]);

  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
        setShowPicker(false);
    }
    if (selectedDate) {
        setWakeTime(selectedDate);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
          
          <View style={styles.modalContent}>
             <LinearGradient
                colors={['#0f2027', '#203a43', '#2c5364']}
                style={StyleSheet.absoluteFill}
             />

            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Sleep Wind-Down</Text>
                <Text style={styles.subtitle}>Prepare for a restful night.</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              
              <View style={styles.moonContainer}>
                 <Ionicons name="moon" size={60} color="#FDFBD3" />
                 <Text style={styles.progressText}>{progress}% Ready</Text>
              </View>

              <View style={styles.calcCard}>
                 <View style={styles.calcHeader}>
                    <Ionicons name="alarm" size={20} color="#FFF" />
                    <Text style={styles.calcTitle}>Smart Sleep Calculator</Text>
                 </View>
                 
                 <View style={styles.calcRow}>
                    <View>
                        <Text style={styles.calcLabel}>Wake Up Time</Text>
                        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.timeBtn}>
                            <Text style={styles.timeText}>
                                {wakeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#B0BEC5" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.durationBox}>
                         <Text style={styles.durationLabel}>You'll get</Text>
                         <Text style={styles.durationValue}>{sleepDuration}</Text>
                         <Text style={styles.durationLabel}>of sleep</Text>
                    </View>
                 </View>

                 {showPicker && (
                    <View style={{ marginTop: 20 }}>
                     {Platform.OS === 'ios' && (
                       <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 10 }}>
                          <TouchableOpacity onPress={() => setShowPicker(false)} style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 15 }}>
                             <Text style={{ color: '#81C784', fontWeight: 'bold' }}>Done</Text>
                          </TouchableOpacity>
                       </View>
                     )}
                     <DateTimePicker
                        value={wakeTime}
                        mode="time"
                        display="spinner"
                        onChange={onTimeChange}
                        textColor='white'
                    />
                    </View>
                 )}
              </View>

              <Text style={styles.sectionTitle}>Evening Routine</Text>
              <View style={styles.listContainer}>
                {checklist.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.itemRow, item.checked && styles.itemRowChecked]}
                    onPress={() => toggleItem(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.labelContainer}>
                      <Ionicons 
                        name={getIconName(item.label)} 
                        size={22} 
                        color={item.checked ? "#4CAF50" : "#B0BEC5"} 
                        style={{ marginRight: 15 }}
                      />
                      <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
                        {item.label}
                      </Text>
                    </View>
                    
                    <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                      {item.checked && <Ionicons name="checkmark" size={16} color="#FFF" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              {allDone && (
                <TouchableOpacity style={styles.goodNightBtn} onPress={handleGoodNight}>
                  <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.goodNightGradient}
                  >
                     <Ionicons name="bed" size={24} color="#FFF" style={{ marginRight: 10 }} />
                     <View>
                        <Text style={styles.goodNightBtnText}>Good Night</Text>
                        <Text style={styles.goodNightBtnSub}>I'm ready to sleep</Text>
                     </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}

            </ScrollView>
          </View>
        </View>
    </Modal>
  );
};

const getIconName = (label) => {
  if (label.includes('Screens')) return 'phone-portrait-outline';
  if (label.includes('Brush')) return 'water-outline';
  if (label.includes('Book')) return 'book-outline';
  if (label.includes('Meditate')) return 'flower-outline';
  if (label.includes('Alarm')) return 'alarm-outline';
  return 'ellipse-outline';
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1c1c1e', // Fallback
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '92%',
    padding: 24,
    overflow: 'hidden', // Contain gradient
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
    color: '#FFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#B0BEC5',
    fontWeight: '500',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moonContainer: {
    alignItems: 'center',
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  progressText: {
    color: '#FDFBD3',
    fontSize: 18,
    fontWeight: 'bold',
  },
  calcCard: {
     backgroundColor: 'rgba(255,255,255,0.08)',
     borderRadius: 20,
     padding: 20,
     marginBottom: 30,
     borderWidth: 1,
     borderColor: 'rgba(255,255,255,0.1)',
  },
  calcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  calcTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    color: '#B0BEC5',
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  timeText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  durationBox: {
    alignItems: 'flex-end',
  },
  durationLabel: {
    color: '#B0BEC5',
    fontSize: 12,
  },
  durationValue: {
    color: '#81C784',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  listContainer: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  itemRowChecked: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green tint
    borderColor: '#4CAF50',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  itemTextChecked: {
    color: '#B0BEC5',
    textDecorationLine: 'line-through',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#B0BEC5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  goodNightBtn: {
    marginTop: 30,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  goodNightGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  goodNightBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  goodNightBtnSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  }
});

export default SleepModal;
