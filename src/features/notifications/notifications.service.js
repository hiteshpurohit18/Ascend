import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert } from "react-native";
import { QUOTES } from "../../constants/data";
import AsyncStorage from "@react-native-async-storage/async-storage";


const DAILY_NOTIF_KEY = "daily_notification_id";
const HYDRO_NOTIF_KEY = "hydration_notification_id";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  
  
  console.log("Checking existing permissions...");
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    console.log("Requesting new permissions...");
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permissions finally denied.");
    Alert.alert("Permission Required", "Please enable notifications to receive daily reminders.");
    return false;
  }

  
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    } catch (e) {
      console.log("Error checking/setting channel:", e);
      
    }
  }

  return true;
};



export const scheduleDailyNotification = async (hour = 9, minute = 0) => {
  
  const existingId = await AsyncStorage.getItem(DAILY_NOTIF_KEY);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId);
  }

  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const newId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Inspiration ✨",
      body: `"${randomQuote.text}"`,
      data: { quoteId: randomQuote.id },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      badge: 1,
      channelId: "default", 
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: Number(hour),
      minute: Number(minute),
    },
  });

  await AsyncStorage.setItem(DAILY_NOTIF_KEY, newId);
};

export const cancelDailyNotification = async () => {
  const existingId = await AsyncStorage.getItem(DAILY_NOTIF_KEY);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId);
    await AsyncStorage.removeItem(DAILY_NOTIF_KEY);
  }
};

const HYDRATION_MESSAGES = [
  { title: "Did you know? 🧠", body: "Dehydration can reduce concentration by 20%. Drink up!" },
  { title: "Skin Glow ✨", body: "Water flushes out toxins and keeps your skin glowing." },
  { title: "Energy Boost ⚡", body: "Feeling tired? A glass of water might be all you need." },
  { title: "Muscle Power 💪", body: "Hydrated muscles perform better and recover faster." },
  { title: "Digestive Health 🍏", body: "Water aids digestion and keeps things moving smoothly." },
  { title: "Headache Helper 🤕", body: "Water can help prevent and alleviate headaches." },
  { title: "Temperature Check 🌡️", body: "Water helps regulate your body temperature." },
  { title: "Joint Joy 🦴", body: "Water lubricates joints, reducing friction and pain." },
];

export const cancelHydrationReminder = async () => {
  
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'hydration') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
};

export const scheduleHydrationReminder = async (currentIntake = 0, dailyGoal = 2500) => {
  
  await cancelHydrationReminder();

  
  
  const INTERVAL_MINUTES = 30;
  const NOTIFICATIONS_COUNT = 24; 

  const percentage = Math.round((currentIntake / dailyGoal) * 100);

  for (let i = 1; i <= NOTIFICATIONS_COUNT; i++) {
    const delaySeconds = i * INTERVAL_MINUTES * 60;
    
    
    
    let content = {};
    const cycleIndex = i % 3;

    if (cycleIndex === 1) { 
      
      const randomMsg = HYDRATION_MESSAGES[Math.floor(Math.random() * HYDRATION_MESSAGES.length)];
      content = {
        title: randomMsg.title,
        body: randomMsg.body
      };
    } else if (cycleIndex === 2) {
      
      
      content = {
        title: "Keep the Momentum! 🌊",
        body: `You're currently at ${percentage}% (${currentIntake}ml). Let's hit that ${dailyGoal}ml goal!`
      };
    } else {
      
      content = {
        title: "Time for a Sip? 🥤",
        body: "Stay on top of your game. Grab a glass of water."
      };
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        ...content,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
        channelId: "default",
        data: { type: 'hydration' } 
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
        repeats: false,
      },
    });
  }

  
  if (currentIntake === 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
            title: "Hydration Tracking Started! 💧",
            body: "We'll keep you posted with varied tips and progress updates.",
            data: { type: 'hydration' }
        },
        trigger: null
      });
  }
};

export const sendInstantNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification",
      body: "This is an instant notification to verify your setup!",
    },
    trigger: null, 
  });
};
