import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../features/theme/theme.context';

export const MoonBunny = ({ phase = 'menstrual' }) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const [hearts, setHearts] = useState([]);

    useEffect(() => {
        startAnimation();
    }, [phase]);

    const startAnimation = () => {
        if (phase === 'menstrual') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scale, { toValue: 1.1, duration: 2000, useNativeDriver: true }),
                    Animated.timing(scale, { toValue: 1, duration: 2000, useNativeDriver: true })
                ])
            ).start();
        } else if (phase === 'ovulation') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(translateY, { toValue: -20, duration: 400, easing: Easing.bounce, useNativeDriver: true }),
                    Animated.timing(translateY, { toValue: 0, duration: 400, easing: Easing.bounce, useNativeDriver: true })
                ])
            ).start();
        } else {
             Animated.loop(
                Animated.sequence([
                    Animated.timing(rotate, { toValue: 1, duration: 500, useNativeDriver: true }),
                    Animated.timing(rotate, { toValue: -1, duration: 500, useNativeDriver: true }),
                    Animated.timing(rotate, { toValue: 0, duration: 500, useNativeDriver: true }),
                    Animated.delay(2000)
                ])
            ).start();
        }
    };

    const handlePet = () => {
        Vibration.vibrate(50);
        const newHeart = { id: Date.now(), x: Math.random() * 40 - 20, y: -50 };
        setHearts(prev => [...prev.slice(-4), newHeart]);
    };

    const spin = rotate.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-10deg', '10deg']
    });

    const getBunnyEmoji = () => {
        switch(phase) {
            case 'menstrual': return '🐇💤';
            case 'ovulation': return '🐇💃';
            case 'luteal': return '🐇🧶';
            case 'follicular': return '🐇🌱';
            default: return '🐇'; 
        }
    };

    return (
        <View style={styles.bunnyContainer}>
            <TouchableOpacity onPress={handlePet} activeOpacity={0.8}>
                <Animated.Text 
                    style={[
                        styles.bunnyText, 
                        { 
                            transform: [{ translateY }, { scale }, { rotate: spin }] 
                        }
                    ]}
                >
                    {getBunnyEmoji()}
                </Animated.Text>
            </TouchableOpacity>
            
            {hearts.map(h => (
                <PetHeart key={h.id} x={h.x} y={h.y} />
            ))}
        </View>
    );
};

const PetHeart = ({ x, y }) => {
    const fade = useRef(new Animated.Value(1)).current;
    const float = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 0, duration: 1000, useNativeDriver: true }),
            Animated.timing(float, { toValue: -100, duration: 1000, useNativeDriver: true })
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.petHeart, { transform: [{ translateX: x }, { translateY: float }], opacity: fade }]}>
            <Ionicons name="heart" size={20} color="#FF4081" />
        </Animated.View>
    );
};


export const FortuneCookie = () => {
    const { theme } = useTheme();
    const [opened, setOpened] = useState(false);
    const [fortune, setFortune] = useState("");
    const shake = useRef(new Animated.Value(0)).current;

    const fortunes = [
        "Your kindness is a superpower.",
        "Rest is productive too.",
        "You are exactly where you need to be.",
        "Big magic is coming your way.",
        "Trust your intuition today.",
        "You are loved more than you know."
    ];

    const openCookie = () => {
        if (opened) return;
        
        Vibration.vibrate(50);
        Animated.sequence([
            Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shake, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start(() => {
            setOpened(true);
            setFortune(fortunes[Math.floor(Math.random() * fortunes.length)]);
        });
    };

    return (
        <TouchableOpacity onPress={openCookie} style={[styles.cookieCard, { backgroundColor: theme.surface }]}>
            {!opened ? (
                <Animated.View style={{ transform: [{ translateX: shake }] }}>
                     <Text style={{ fontSize: 40 }}>🥠</Text>
                     <Text style={[styles.cookieText, { color: theme.textSecondary }]}>Tap for Fortune</Text>
                </Animated.View>
            ) : (
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 40 }}>✨</Text>
                    <Text style={[styles.fortuneText, { color: theme.primary }]}>"{fortune}"</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    bunnyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        marginVertical: 10,
        overflow: 'visible',
    },
    bunnyText: {
        fontSize: 60,
    },
    petHeart: {
        position: 'absolute',
        top: 20,
    },
    cookieCard: {
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        marginVertical: 10,
        elevation: 2,
    },
    cookieText: {
        marginTop: 10,
        fontWeight: '600',
    },
    fortuneText: {
        marginTop: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
        fontStyle: 'italic',
    },
});
