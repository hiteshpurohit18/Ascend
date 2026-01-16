import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
  BackHandler,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMood } from "../features/mood/mood.context";
import { useBlogs } from "../features/blogs/blogs.context";
import { useAuth } from "../features/auth/auth.context";
import { useQuotes } from "../features/quotes/quotes.context"; 
import { useNavigation } from "../features/navigation/navigation.context"; 
import { styles as globalStyles } from "../styles/styles";
import { useTheme } from "../features/theme/theme.context";
import { requestNotificationPermissions, scheduleDailyNotification, cancelDailyNotification, sendInstantNotification } from "../features/notifications/notifications.service";
import LoginScreen from "./LoginScreen";
import SignupScreen from "./SignupScreen";

export default function ProfileScreen({ onOpenPeriodHealth }) {
  const { user, logout, updateProfileImage, updateProfile, consumePendingAction } = useAuth();
  const { history, streak, checkinsToday } = useMood();
  const { readBlogs, toggleBookmark, readsToday } = useBlogs();
  const { toggleQuote } = useQuotes();
  const { routeParams, setRouteParams, navigate } = useNavigation();
  const { theme, toggleTheme, isDarkMode } = useTheme();

  const [authView, setAuthView] = useState(null); 
  const [dailyReminders, setDailyReminders] = useState(false);
  
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSurname, setEditSurname] = useState("");
  const [editTag, setEditTag] = useState("");
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false); 

  const styles = getStyles(theme);

  
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditSurname(user.surname || "");
      setEditTag(user.userTag || "Hero in Training");
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out? Your data will be safely saved.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
             setIsLogoutLoading(true);
             
             
             await new Promise(resolve => setTimeout(resolve, 2000));
             
             
             await logout();
             
             
             Toast.show({
               type: 'success',
               text1: 'Logged Out Successfully',
               text2: 'See you soon! 👋'
             });
             
             setIsLogoutLoading(false);
          }
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
     if (!editName || !editSurname) {
         Alert.alert("Error", "Name and Surname are required");
         return;
     }

     try {
         await updateProfile({
             name: editName,
             surname: editSurname,
             userTag: editTag
         });
         setIsEditing(false);
         Alert.alert("Success", "Profile updated successfully");
     } catch (err) {
         Alert.alert("Error", "Failed to update profile");
     }
  };

  const handleMenstrualHealth = () => {
    if (!user) return;
    
    if (user.gender === 'female') {
      onOpenPeriodHealth();
    } else if (user.gender === 'male') {
      setShowRestrictedModal(true);
    } else {
      
      Alert.alert(
        "Complete Your Profile",
        "To access this feature, please confirm your biological sex:",
        [
          { 
            text: "Male", 
            onPress: async () => {
               await updateProfile({ gender: 'male' });
               setShowRestrictedModal(true);
            }
          },
          { 
            text: "Female", 
            onPress: async () => {
               await updateProfile({ gender: 'female' });
               onOpenPeriodHealth();
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
    }
  };

  
  useEffect(() => {
    if (routeParams?.mode === 'login') {
      setAuthView('login');
      setRouteParams({}); 
    } else if (routeParams?.mode === 'signup') {
        setAuthView('signup');
        setRouteParams({});
    }
  }, [routeParams, setRouteParams]);

  
  useEffect(() => {
    (async () => {
      try {
        const savedState = await AsyncStorage.getItem("dailyReminders");
        if (savedState !== null) {
          setDailyReminders(JSON.parse(savedState));
        }
      } catch (e) {
        console.log("Error loading reminder state", e);
      }
    })();
  }, []);
  
  
  useEffect(() => {
    const backAction = () => {
      if (authView !== null) {
        setAuthView(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [authView]);

  const toggleNotifications = async (value) => {
    try {
      if (value) {
        
        const granted = await requestNotificationPermissions();
        
        
        if (granted) {
          await scheduleDailyNotification();
          setDailyReminders(true);
          await AsyncStorage.setItem("dailyReminders", JSON.stringify(true));
          Alert.alert("Notifications Enabled", "You will receive a daily inspiration at 9:00 AM.");
        } else {
          setDailyReminders(false);
          await AsyncStorage.setItem("dailyReminders", JSON.stringify(false));
        }
      } else {
        await cancelDailyNotification();
        setDailyReminders(false);
        await AsyncStorage.setItem("dailyReminders", JSON.stringify(false));
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      Alert.alert("Error", "Failed to enable notifications: " + error.message);
      setDailyReminders(false);
    }
  };

  
  useEffect(() => {
    if (user) {
      
      const action = consumePendingAction();
      if (action) {
        if (action.type === "LIKE_QUOTE") {
          toggleQuote(action.payload);
          Alert.alert("Success", "Quote added to favorites!");
        } else if (action.type === "BOOKMARK_BLOG") {
          toggleBookmark(action.payload);
          Alert.alert("Success", "Article bookmarked!");
        }
      }
      
      setAuthView(null);
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        await updateProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const getInitials = () => {
    if (!user) return "G";
    const first = user.name ? user.name[0] : "";
    const last = user.surname ? user.surname[0] : "";
    return (first + last).toUpperCase();
  };

  if (authView === "login") {
    return <LoginScreen onBack={() => setAuthView(null)} onSwitchToSignup={() => setAuthView("signup")} />;
  }

  if (authView === "signup") {
    return <SignupScreen onBack={() => setAuthView(null)} onSwitchToLogin={() => setAuthView("login")} />;
  }

  if (!user) {
    return (
      <View style={[globalStyles.screenContainer, { justifyContent: "center", padding: 20, backgroundColor: theme.background }]}>
        <View style={styles.guestCard}>
          <View style={styles.guestIcon}>
            <Ionicons name="person" size={40} color={theme.primary} />
          </View>
          <Text style={styles.guestTitle}>Welcome, Guest</Text>
          <Text style={styles.guestSubtitle}>
            Unlock your full potential. Sign in to track streaks, save favorites, and sync your progress.
          </Text>
          
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setAuthView("login")}
          >
            <Text style={styles.primaryBtnText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAuthView("signup")}
            style={{ padding: 10 }}
          >
            <Text style={styles.secondaryLinkText}>Create an Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[globalStyles.screenContainer, { backgroundColor: 'transparent' }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerWrapper}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarShadow}>
            {user.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.bigAvatar}
              />
            ) : (
              <View style={[styles.bigAvatar, styles.initialsAvatar]}>
                <Text style={styles.initialsText}>{getInitials()}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={12} color="#FFF" />
            </View>
          </TouchableOpacity>
          
          <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
            <Text style={styles.userName}>{user.name} {user.surname}</Text>
            <TouchableOpacity 
                onPress={() => setIsEditing(true)}
                style={{ position: 'absolute', right: -30, top: 4 }}
            >
                <Ionicons name="pencil-sharp" size={20} color={theme.textLight} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userTag}>{user.userTag || "Hero in Training"}</Text>
        </View>
      </View>

      {}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditing(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <TouchableOpacity 
                style={{ flex: 1 }} 
                activeOpacity={1} 
                onPress={() => setIsEditing(false)} 
            />
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
                        <TouchableOpacity onPress={() => setIsEditing(false)}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalForm}>
                        <View style={styles.modalInputGroup}>
                            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>First Name</Text>
                            <TextInput 
                                style={[styles.modalInput, { backgroundColor: theme.surfaceHighlight, color: theme.text }]}
                                value={editName}
                                onChangeText={setEditName}
                            />
                        </View>
                        <View style={styles.modalInputGroup}>
                            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Last Name</Text>
                            <TextInput 
                                style={[styles.modalInput, { backgroundColor: theme.surfaceHighlight, color: theme.text }]}
                                value={editSurname}
                                onChangeText={setEditSurname}
                            />
                        </View>
                        <View style={styles.modalInputGroup}>
                            <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Hero Name (Tagline)</Text>
                            <TextInput 
                                style={[styles.modalInput, { backgroundColor: theme.surfaceHighlight, color: theme.text }]}
                                value={editTag}
                                onChangeText={setEditTag}
                                placeholder="e.g. Hero in Training"
                                placeholderTextColor={theme.placeholder}
                            />
                        </View>

                        <TouchableOpacity style={[styles.primaryBtn, { marginTop: 20 }]} onPress={handleSaveProfile}>
                            <Text style={styles.primaryBtnText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      {}
      <Modal
         visible={showRestrictedModal}
         animationType="fade"
         presentationStyle="fullScreen"
         onRequestClose={() => setShowRestrictedModal(false)}
      >
         <View style={[styles.modalOverlay, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
             <Ionicons name="information-circle-outline" size={80} color={theme.textLight} style={{ marginBottom: 20 }} />
             <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, textAlign: 'center', marginBottom: 15 }}>
                Access Restricted
             </Text>
             <Text style={{ fontSize: 16, color: theme.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 40 }}>
                This section is specifically designed for women to track menstrual health cycles. 
             </Text>
             
             <TouchableOpacity 
                style={[styles.primaryBtn, { width: '80%' }]}
                onPress={() => setShowRestrictedModal(false)}
             >
                <Text style={styles.primaryBtnText}>Go Back</Text>
             </TouchableOpacity>

             <TouchableOpacity 
                style={{ marginTop: 20, padding: 10 }}
                onPress={async () => {
                    await updateProfile({ gender: null });
                    setShowRestrictedModal(false);
                    Alert.alert("Reset", "Gender setting cleared.");
                }}
             >
                <Text style={{ color: theme.textLight, fontSize: 14 }}>Mistake? Reset Gender</Text>
             </TouchableOpacity>
         </View>
      </Modal>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.primary + "15" }]}>
              <Ionicons name="flame" size={20} color={theme.primary} />
            </View>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: theme.accent + "15" }]}>
              <Ionicons name="book" size={20} color={theme.accent} />
            </View>
            <Text style={styles.statValue}>{readsToday}</Text>
            <Text style={styles.statLabel}>Reads Today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#4CAF5015" }]}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>{checkinsToday}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
        </View>

        {}
        <TouchableOpacity 
           style={[styles.insightCard, { backgroundColor: theme.surface }]}
           onPress={() => navigate("Insights")}
        >
           <View style={{ 
               width: 50, height: 50, borderRadius: 15, 
               backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' 
           }}>
              <Ionicons name="stats-chart" size={24} color="#FFF" />
           </View>
           <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 4 }}>Life Insights</Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>View your personalized growth data</Text>
           </View>
           <Ionicons name="chevron-forward" size={24} color={theme.textLight} />
        </TouchableOpacity>

        <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Account Settings</Text>
        <View style={styles.menuCard}>
          
          {}
          <View style={styles.menuItem}>
            <View style={styles.menuIconBox}>
                <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={theme.text} />
            </View>
            <Text style={styles.menuText}>Dark Mode</Text>
            <Switch
                trackColor={{ false: "#767577", true: theme.secondary }}
                thumbColor={isDarkMode ? theme.primary : "#f4f3f4"}
                onValueChange={toggleTheme}
                value={isDarkMode}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Ionicons name="notifications-outline" size={20} color={theme.text} />
            </View>
            <Text style={styles.menuText}>Daily Reminders</Text>
            <Switch
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor={dailyReminders ? "#fff" : "#f4f3f4"}
              onValueChange={toggleNotifications}
              value={dailyReminders}
            />
            {}
          </View>
          
          <View style={styles.divider} />

          {}
          <TouchableOpacity style={styles.menuItem} onPress={handleMenstrualHealth}>
            <View style={[styles.menuIconBox, { backgroundColor: theme.mode === 'dark' ? 'rgba(233, 30, 99, 0.1)' : "#FCE4EC" }]}>
              <Ionicons name="rose" size={20} color="#E91E63" />
            </View>
            <Text style={styles.menuText}>Menstrual Health</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleLogout} 
            disabled={isLogoutLoading}
          >
            <View style={[styles.menuIconBox, { backgroundColor: theme.mode === 'dark' ? 'rgba(233, 79, 55, 0.1)' : "#FFEBEE" }]}>
              {isLogoutLoading ? (
                 <ActivityIndicator size="small" color={theme.accent} />
              ) : (
                 <Ionicons name="log-out-outline" size={20} color={theme.accent} />
              )}
            </View>
            <Text style={[styles.menuText, { color: theme.accent }]}>
                {isLogoutLoading ? "Logging Out..." : "Log Out"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made for Ascend</Text>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  
  guestCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  guestIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.primary + "10",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  primaryBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryLinkText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: "600",
  },

  
  headerWrapper: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: theme.surface,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 4,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  headerContent: {
    alignItems: "center",
  },
  avatarShadow: {
    elevation: 10,
    shadowColor: theme.primary,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    marginBottom: 15,
  },
  bigAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: theme.surface,
  },
  initialsAvatar: {
    backgroundColor: theme.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    color: "#FFF",
    fontSize: 40,
    fontWeight: "bold",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: theme.surface,
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 4,
  },
  userTag: {
    fontSize: 14,
    color: theme.textLight,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  
  
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  
  
  insightCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: theme.textLight,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 15,
    marginLeft: 5,
  },
  menuCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 5,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: theme.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.divider,
    marginLeft: 66,
  },
  footer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 10,
  },
  footerText: {
    color: "#ccc",
    fontSize: 12,
    fontWeight: "600",
  },
  versionText: {
    color: "#eee", 
    fontSize: 10,
    marginTop: 4,
  },
  
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    paddingBottom: 50,
    minHeight: 500,
    elevation: 20,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 30,
  },
  modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
  },
  modalForm: {
      gap: 20,
  },
  modalInputGroup: {
      gap: 8,
  },
  modalLabel: {
      fontSize: 14,
      fontWeight: '600',
  },
  modalInput: {
      padding: 16,
      borderRadius: 16,
      fontSize: 16,
  },
});
