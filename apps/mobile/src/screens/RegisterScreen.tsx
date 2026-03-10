import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../context/SettingsContext";
import type { AuthStackParamList } from "../types/navigation";

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, "Register">;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { signUp } = useAuth();
  const { tr } = useI18n();
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@subtrack.app");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onRegister = async () => {
    if (!email.trim() || !password.trim()) {
      setError(tr("enterEmailPassword"));
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await signUp({ name: name.trim(), email: email.trim(), password });
    } catch (registerError) {
      const message = registerError instanceof Error ? registerError.message : tr("registerFailed");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tr("register")}</Text>
      <TextInput placeholder={tr("name")} style={styles.input} value={name} onChangeText={setName} />
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={tr("email")}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.passwordRow}>
        <TextInput
          placeholder={tr("password")}
          secureTextEntry={!showPassword}
          style={[styles.input, styles.passwordInput]}
          value={password}
          onChangeText={setPassword}
        />
        <Button title={showPassword ? tr("hide") : tr("show")} onPress={() => setShowPassword((prev) => !prev)} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.action}>
        <Button
          disabled={isSubmitting}
          title={isSubmitting ? tr("creating") : tr("createAccount")}
          onPress={onRegister}
        />
      </View>
      <Button title={tr("backToLogin")} onPress={() => navigation.navigate("Login")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12
  },
  title: {
    fontSize: 24,
    fontWeight: "700"
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  passwordRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  passwordInput: {
    flex: 1
  },
  action: {
    width: "100%"
  },
  error: {
    width: "100%",
    color: "#b91c1c"
  }
});

export default RegisterScreen;
