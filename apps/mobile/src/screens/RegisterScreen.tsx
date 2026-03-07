import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import type { AuthStackParamList } from "../types/navigation";

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, "Register">;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { signUp } = useAuth();
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@subtrack.app");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onRegister = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Enter email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await signUp({ name: name.trim(), email: email.trim(), password });
    } catch (registerError) {
      const message = registerError instanceof Error ? registerError.message : "Registration failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.action}>
        <Button
          disabled={isSubmitting}
          title={isSubmitting ? "Creating..." : "Create account"}
          onPress={onRegister}
        />
      </View>
      <Button title="Back to login" onPress={() => navigation.navigate("Login")} />
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
  action: {
    width: "100%"
  },
  error: {
    width: "100%",
    color: "#b91c1c"
  }
});

export default RegisterScreen;
