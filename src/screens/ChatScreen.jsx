import { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet,
  ActivityIndicator,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "../constants/theme";
import { getGeminiResponse } from "../features/ai/gemini.service";
import { useAuth } from "../features/auth/auth.context";
import { useChat } from "../features/ai/chat.context";
import { useTheme } from "../features/theme/theme.context";

export default function ChatScreen({ onClose }) {
  const { messages, isTyping, sendMessage, initGreeting } = useChat();
  const { theme, isDarkMode } = useTheme();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);

  useEffect(() => {
    initGreeting();
  }, []);

  const { user } = useAuth();


  const handleSend = async () => {
    if (inputText.trim().length === 0) return;

    await sendMessage(inputText);
    setInputText("");
  };

  const renderItem = ({ item }) => {
    const isUser = item.user._id === 1;
    return (
      <View style={[
        localStyles.msgRow, 
        isUser ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }
      ]}>
        {!isUser && (
          <View style={[localStyles.botAvatar, { backgroundColor: theme.primary }]}>
            <Ionicons name="sparkles" size={16} color="#FFF" />
          </View>
        )}
        <View style={[
          localStyles.bubble,
          isUser 
            ? { backgroundColor: theme.primary, borderBottomRightRadius: 4 } 
            : { backgroundColor: theme.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.divider }
        ]}>
          <Text style={[
            localStyles.msgText,
            isUser ? { color: "#FFF" } : { color: theme.text }
          ]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[localStyles.container, { backgroundColor: theme.background }]}>
      <View style={[localStyles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <Text style={[localStyles.headerTitle, { color: theme.text }]}>Peace AI</Text>
        <TouchableOpacity onPress={onClose} style={localStyles.closeBtn}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item._id.toString()}
          inverted
          contentContainerStyle={{ padding: 20 }}
          ListHeaderComponent={
            isTyping ? (
              <View style={{ marginBottom: 10, marginLeft: 40 }}>
                <Text style={{ color: "#999", fontStyle: "italic", fontSize: 12 }}>Peace AI is typing...</Text>
              </View>
            ) : null
          }
        />

        <View style={[localStyles.inputArea, { backgroundColor: theme.surface, borderTopColor: theme.divider }]}>
          <TextInput
            style={[localStyles.input, { backgroundColor: isDarkMode ? theme.background : "#F5F5F5", color: theme.text }]}
            placeholder="Type a message..."
            placeholderTextColor={theme.placeholder}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={200}
          />
          <TouchableOpacity 
            style={[localStyles.sendBtn, { backgroundColor: theme.primary }, !inputText.trim() && { backgroundColor: theme.divider }]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeBtn: {
    position: "absolute",
    right: 20,
    top: 50,
  },
  msgRow: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-end",
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  bubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: "75%",
  },
  userBubble: {
    backgroundColor: THEME.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  msgText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
  },
  inputArea: {
    padding: 15,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
