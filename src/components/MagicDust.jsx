import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const MagicDust = ({ children }) => {
    const [sparkles, setSparkles] = useState([]);
    
    const addSparkle = (x, y) => {
        const id = Date.now() + Math.random();
        const newSparkle = { id, x: x - 10, y: y - 10 }; 
        setSparkles(prev => [...prev.slice(-15), newSparkle]);
    };

    const handleTouch = (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        addSparkle(pageX, pageY);
    };

    return (
        <View 
            style={styles.container} 
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
        >
            {children}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {sparkles.map(s => (
                    <Sparkle key={s.id} x={s.x} y={s.y} />
                ))}
            </View>
        </View>
    );
};

const Sparkle = ({ x, y }) => {
    const fade = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 0, duration: 600, useNativeDriver: true }),
            Animated.sequence([
                Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
                Animated.timing(scale, { toValue: 0, duration: 300, useNativeDriver: true })
            ])
        ]).start();
    }, []);

    const randomColor = ['#FFD700', '#E91E63', '#00B0FF', '#FFF'][Math.floor(Math.random() * 4)];
    const randomSize = Math.floor(Math.random() * 15) + 10;

    return (
        <Animated.View 
            style={[
                styles.sparkle, 
                { 
                    left: x, 
                    top: y, 
                    opacity: fade, 
                    transform: [{ scale }] 
                }
            ]}
        >
            <Ionicons name="sparkles" size={randomSize} color={randomColor} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sparkle: {
        position: 'absolute',
    }
});
