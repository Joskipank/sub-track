import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "subtrack_settings";

export const settingsStorage = {
  setSettings: async (value: string) => AsyncStorage.setItem(SETTINGS_KEY, value),
  getSettings: async () => AsyncStorage.getItem(SETTINGS_KEY)
};
