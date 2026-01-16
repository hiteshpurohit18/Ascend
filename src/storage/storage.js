import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  get: async (key, fallback) => {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  },
  set: async (key, value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
};
