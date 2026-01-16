import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuth } from "../features/auth/auth.context";
import { useTheme } from "../features/theme/theme.context";
import SwipeBackView from "../components/SwipeBackView";

export default function SignupScreen({ onBack, onSwitchToLogin }) {
  const { signup } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [userTag, setUserTag] = useState("");
  const [gender, setGender] = useState(null); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !name || !surname || !gender) {
      Alert.alert("Error", "Please fill in all required fields, including gender.");
      return;
    }

    setLoading(true);
    try {
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      await signup(name, surname, email, password, userTag, gender);
      
      Toast.show({
        type: 'success',
        text1: 'Account Created!',
        text2: 'Welcome to Ascend! 🚀'
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
               <Ionicons name="person-add" size={48} color={theme.primary} />
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to start your journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Name <Text style={{color: theme.accent}}>*</Text></Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                  placeholderTextColor={theme.placeholder}
                        value={name}
                        onChangeText={setName}
                    />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Surname <Text style={{color: theme.accent}}>*</Text></Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                  placeholderTextColor={theme.placeholder}
                        value={surname}
                        onChangeText={setSurname}
                    />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hero Name (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="star-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Hero in Training"
                  placeholderTextColor={theme.placeholder}
                  value={userTag}
                  onChangeText={setUserTag}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email <Text style={{color: theme.accent}}>*</Text></Text>
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
              <Text style={styles.label}>Password <Text style={{color: theme.accent}}>*</Text></Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
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

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender <Text style={{color: theme.accent}}>*</Text></Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <TouchableOpacity 
                        style={[
                            styles.genderBtn, 
                            gender === 'male' && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                        onPress={() => setGender('male')}
                    >
                        <Ionicons name="male" size={20} color={gender === 'male' ? "#FFF" : theme.text} />
                        <Text style={[styles.genderBtnText, gender === 'male' && { color: "#FFF" }]}>Male</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[
                            styles.genderBtn, 
                            gender === 'female' && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                        onPress={() => setGender('female')}
                    >
                        <Ionicons name="female" size={20} color={gender === 'female' ? "#FFF" : theme.text} />
                        <Text style={[styles.genderBtnText, gender === 'female' && { color: "#FFF" }]}>Female</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerBox}>
               <View style={styles.dividerLine} />
               <Text style={styles.dividerText}>OR</Text>
               <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              onPress={onSwitchToLogin}
              style={styles.switchAuthBtn}
            >
              <Text style={styles.switchAuthText}>
                Already have an account? <Text style={styles.linkText}>Log In</Text>
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
    marginBottom: 30, 
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
    width: 70, 
    height: 70,
    borderRadius: 22,
    backgroundColor: theme.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 30, 
    fontWeight: "800",
    color: theme.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 24,
  },
  form: {
    flex: 1,
    gap: 15, 
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    gap: 15,
  },
  inputGroup: {
    marginBottom: 5,
    gap: 6,
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
    backgroundColor: theme.surfaceHighlight,
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
    marginTop: 15,
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
    marginVertical: 15,
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
    padding: 10,
  },
  switchAuthText: {
    fontSize: 15,
    color: theme.textSecondary,
  },
  linkText: {
    color: theme.accent,
    fontWeight: "bold",
  },
  genderBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.divider,
      backgroundColor: theme.surfaceHighlight,
  },
  genderBtnText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
  },
});
