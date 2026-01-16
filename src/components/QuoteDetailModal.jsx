import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { THEME } from "../constants/theme";
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

import { useQuotes } from "../features/quotes/quotes.context";
import { useAuth } from "../features/auth/auth.context";
import { useNavigation } from "../features/navigation/navigation.context";
import { useTheme } from "../features/theme/theme.context";

export default function QuoteDetailModal({ quote, visible, onClose }) {
  const { likedQuotes, toggleQuote } = useQuotes();
  const { user, setAuthPendingAction } = useAuth();
  const { navigate } = useNavigation();
  const { theme, isDarkMode } = useTheme();
  
  if (!quote) return null;

  const isLiked = likedQuotes.includes(quote.id);

  const handleSharePdf = async () => {
    try {
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          </head>
          <body style="padding: 60px 40px; font-family: 'Georgia', serif; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; height: 100vh; background-color: #f9f9f9;">
            
            <div style="background-color: white; padding: 60px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 600px;">
              <div style="font-size: 60px; color: #4ecdc4; margin-bottom: 30px;">❝</div>
              
              <div style="font-size: 28px; line-height: 1.6; color: #333; margin-bottom: 40px; font-style: italic;">
                ${quote.text}
              </div>
              
              <div style="width: 50px; height: 4px; background-color: #4ecdc4; margin: 0 auto 30px;"></div>
              
              <div style="font-size: 18px; color: #666; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                ${quote.author}
              </div>
            </div>
            
            <div style="margin-top: 50px; color: #999; font-size: 14px; font-family: sans-serif;">
              Shared from Ascend App
            </div>
            
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert("Error", "Could not generate PDF");
    }
  };

  const handleLike = () => {
    if (!user) {
      setAuthPendingAction({ type: "LIKE_QUOTE", payload: quote.id });
      onClose(); // Close modal first
      navigate("Profile", { mode: "login" });
      return;
    }
    toggleQuote(quote.id);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.surfaceHighlight }]}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={[styles.categoryBadge, { backgroundColor: theme.primary + "20" }]}>
                  <Text style={[styles.categoryText, { color: theme.primary }]}>{quote.category}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={handleLike}
                    style={[styles.shareButton, { backgroundColor: theme.surfaceHighlight }]}
                  >
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={24}
                      color={isLiked ? theme.accent : theme.text}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSharePdf} style={[styles.shareButton, { backgroundColor: theme.surfaceHighlight }]}>
                    <Ionicons name="share-outline" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quote Content */}
              <View style={styles.contentContainer}>
                <FontAwesome5
                  name="quote-left"
                  size={40}
                  color={theme.primary}
                  style={{ opacity: 0.2, marginBottom: 20 }}
                />
                <Text style={[styles.quoteText, { color: theme.text }]}>{quote.text}</Text>
                <View style={[styles.divider, { backgroundColor: theme.primary }]} />
                <Text style={[styles.authorText, { color: theme.textSecondary }]}>— {quote.author}</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    minHeight: 400,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  categoryBadge: {
    backgroundColor: THEME.secondary + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: THEME.secondary,
    fontWeight: "600",
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  quoteText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 30,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: THEME.primary,
    borderRadius: 2,
    marginBottom: 30,
    opacity: 0.3,
  },
  authorText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
    fontStyle: "italic",
  },
});
