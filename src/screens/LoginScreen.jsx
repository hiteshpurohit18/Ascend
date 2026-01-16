import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuth } from "../features/auth/auth.context";
import { useTheme } from "../features/theme/theme.context";
import SwipeBackView from "../components/SwipeBackView";

export default function LoginScreen({ onBack, onSwitchToSignup }) {
  const { login } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const styles = getStyles(theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await login(email, password);
      
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'Logged in successfully ✨'
      });
      
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SwipeBackView onBack={onBack} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={theme.text} />
            </TouchableOpacity>
            
            <View style={styles.heroIconStub}>
               <Ionicons name="log-in" size={48} color={theme.primary} />
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                   <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerBox}>
               <View style={styles.dividerLine} />
               <Text style={styles.dividerText}>OR</Text>
               <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              onPress={onSwitchToSignup}
              style={styles.switchAuthBtn}
            >
              <Text style={styles.switchAuthText}>
                Don't have an account? <Text style={styles.linkText}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SwipeBackView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 25,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heroIconStub: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: theme.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: theme.text,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 24,
  },
  form: {
    flex: 1,
    gap: 20,
  },
  inputGroup: {
    marginBottom: 5,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceHighlight, // Use theme based background
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.divider,
  },
  inputIcon: {
    marginLeft: 15,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: theme.text,
  },
  eyeIcon: {
    padding: 10,
    marginRight: 5,
  },
  submitButton: {
    backgroundColor: theme.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.divider,
  },
  dividerText: {
    marginHorizontal: 15,
    color: theme.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  switchAuthBtn: {
    alignItems: "center",
    marginBottom: 30, // Extra padding at bottom
  },
  switchAuthText: {
    fontSize: 15,
    color: theme.textSecondary,
  },
  linkText: {
    color: theme.accent,
    fontWeight: "bold",
  },
});
