import React, { useState, useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, Animated, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/styles";

const BreathingModal = ({ visible, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [instruction, setInstruction] = useState("Inhale...");

  useEffect(() => {
    if (visible) {
      startBreathingCycle();
    }
  }, [visible]);

  const startBreathingCycle = () => {
    setInstruction("Inhale...");
    Animated.timing(scaleAnim, {
      toValue: 1.5,
      duration: 4000,
      useNativeDriver: true,
    }).start(() => {
      setInstruction("Hold...");
      setTimeout(() => {
        setInstruction("Exhale...");
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }).start(() => {
          setInstruction("Hold...");
          setTimeout(() => {
            if (visible) startBreathingCycle();
          }, 2000);
        });
      }, 2000);
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.breathingContainer}>
              <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.breathingTitle}>Box Breathing</Text>

              <Animated.View
                style={[
                  styles.breathingCircle,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <Text style={styles.breathingText}>{instruction}</Text>
              </Animated.View>

              <Text style={styles.breathingSub}>
                Focus on the circle. Relax your shoulders.
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BreathingModal;
