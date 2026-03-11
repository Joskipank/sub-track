import React, { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../context/SettingsContext";
import type { AppLanguage } from "../types/settings";

const languageOptions: Array<{ code: AppLanguage; label: string }> = [
  { code: "en", label: "English" },
  { code: "ru", label: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439" }
];

const SettingsScreen = () => {
  const { signOut } = useAuth();
  const { language, setLanguage, tr } = useI18n();
  const [error, setError] = useState<string | null>(null);

  const onSelectLanguage = async (nextLanguage: AppLanguage) => {
    try {
      setError(null);
      await setLanguage(nextLanguage);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : tr("failedSaveLanguage"));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{tr("settingsTitle")}</Text>
      <Text style={styles.sectionTitle}>{tr("language")}</Text>
      <View style={styles.row}>
        {languageOptions.map((option) => (
          <TouchableOpacity
            key={option.code}
            style={[styles.pill, language === option.code ? styles.pillActive : null]}
            onPress={() => void onSelectLanguage(option.code)}
          >
            <Text>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.subtitle}>
        {tr("selected")}: {language.toUpperCase()}
      </Text>
      <View style={styles.signOutWrap}>
        <Button title={tr("signOut")} onPress={() => void signOut()} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "700"
  },
  sectionTitle: {
    fontWeight: "700"
  },
  subtitle: {
    color: "#4b5563"
  },
  row: {
    flexDirection: "row",
    gap: 8
  },
  pill: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  pillActive: {
    backgroundColor: "#dbeafe"
  },
  signOutWrap: {
    marginTop: 8
  },
  error: {
    color: "#b91c1c"
  }
});

export default SettingsScreen;
