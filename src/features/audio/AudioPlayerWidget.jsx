import { useAudioPlayer } from "expo-audio";
import Slider from "@react-native-community/slider";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles/styles";
import { THEME } from "../../constants/theme";
import { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, ActivityIndicator } from "react-native";

const AudioPlayerWidget = ({ uri, title, subtitle }) => {
  const player = useAudioPlayer(uri);

  // We need to manage playing state and position manually or via interval if the hook doesn't provide live updates automatically
  // expo-audio useAudioPlayer typically provides a player object
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (player) {
      // Player loaded, waiting for user to play
      
      const interval = setInterval(() => {
        if (player) {
          try {
            setPosition(player.currentTime * 1000); 
            setDuration(player.duration * 1000);
            setIsPlaying(player.playing);
          } catch (e) {
            // Player might be gone
          }
        }
      }, 500);

      return () => {
        clearInterval(interval);
        try {
          player.pause();
        } catch (e) {
          // Player might already be unloaded/destroyed by the hook update
        }
      };
    }
  }, [player]);

  const togglePlayback = () => {
    if (player) {
      try {
        if (player.playing) {
          player.pause();
          setIsPlaying(false);
        } else {
          player.play();
          setIsPlaying(true);
        }
      } catch (e) {
        console.log("Toggle playback error:", e);
      }
    }
  };

  const formatTime = (millis) => {
    if (!millis) return "0:00";
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.playerCard}>
      <View style={styles.playerRow}>
        <View style={styles.playerIconBox}>
          <FontAwesome5 name="music" size={24} color="#fff" />
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.playerSubtitle}>
            {subtitle} • {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playPauseBtn}
          onPress={togglePlayback}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color={THEME.primary}
          />
        </TouchableOpacity>
      </View>
      {/* Slider */}
      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={0}
        maximumValue={duration || 1}
        value={position}
        minimumTrackTintColor="#fff"
        maximumTrackTintColor="rgba(255,255,255,0.3)"
        thumbTintColor="#fff"
        onSlidingComplete={(value) => {
          if (player) player.seekTo(value / 1000);
        }}
      />
    </View>
  );
};

export default AudioPlayerWidget;
