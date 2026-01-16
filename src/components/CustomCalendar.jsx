import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../features/theme/theme.context';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width - 40;
const DAY_SIZE = (CALENDAR_WIDTH - 30) / 7;

export const CustomCalendar = ({ onDayPress, markedDates = {}, activeColor = '#ec1392', showLegend = false }) => {
    const { theme } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDate = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const days = useMemo(() => {
        const daysInMonth = getDaysInMonth(currentDate);
        const startDay = getFirstDayOfMonth(currentDate);
        const totalSlots = Math.ceil((daysInMonth + startDay) / 7) * 7;
        
        const daysArray = [];
        for (let i = 0; i < totalSlots; i++) {
            if (i < startDay || i >= startDay + daysInMonth) {
                daysArray.push(null);
            } else {
                daysArray.push(i - startDay + 1);
            }
        }
        return daysArray;
    }, [currentDate]);

    const changeMonth = (increment) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setCurrentDate(newDate);
    };

    const handlePress = (day) => {
        if (!day) return;
        const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
        onDayPress({ dateString });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <View style={styles.header}>
                <Text style={[styles.monthTitle, { color: theme.text }]}>
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                 <View style={styles.navRow}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
                        <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.weekRow}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <Text key={i} style={[styles.weekDayText, { color: theme.textSecondary }]}>{day}</Text>
                ))}
            </View>

            <View style={styles.daysGrid}>
                {days.map((day, index) => {
                    if (!day) return <View key={index} style={styles.dayCellContainer} />;
                    
                    const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const mark = markedDates[dateString];
                    const isSelected = mark?.selected;
                    const intensity = mark?.intensity || 1;
                    const isToday = dateString === formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
                    
                    return (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.dayCellContainer}
                            onPress={() => handlePress(day)}
                        >
                            <View style={[
                                styles.dayCell, 
                                isSelected && { 
                                    backgroundColor: activeColor, 
                                    borderRadius: 8,
                                },
                                !isSelected && { backgroundColor: theme.background }, 
                                isToday && !isSelected && { borderWidth: 1, borderColor: activeColor }
                            ]}>
                                <Text style={[
                                    styles.dayText, 
                                    { color: isSelected ? '#FFF' : theme.text },
                                    isToday && !isSelected && { color: activeColor, fontWeight: 'bold' }
                                ]}>
                                    {day}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
            
            {showLegend && (
            <View style={styles.legendRow}>
                <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>LOW INTENSITY</Text>
                <View style={styles.legendDots}>
                    <View style={[styles.dot, { width: 6, height: 6, backgroundColor: activeColor, opacity: 0.2 }]} />
                    <View style={[styles.dot, { width: 8, height: 8, backgroundColor: activeColor, opacity: 0.5 }]} />
                    <View style={[styles.dot, { width: 10, height: 10, backgroundColor: activeColor }]} />
                </View>
                 <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>HEAVY FLOW</Text>
            </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        width: '100%',
        paddingVertical: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    navRow: {
        flexDirection: 'row',
        gap: 10,
    },
    arrowBtn: {
        padding: 5,
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    weekDayText: {
        width: '14%', 
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
    },
    dayCellContainer: {
        width: '14%', 
        aspectRatio: 1,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayCell: {
        width: '100%',
        height: '100%',
        borderRadius: 8, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 12,
        fontWeight: '500',
    },
    legendRow: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    legendLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    legendDots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        borderRadius: 999,
    }
});
