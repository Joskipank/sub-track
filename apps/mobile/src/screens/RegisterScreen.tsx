import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import type { AuthStackParamList } from "../types/navigation";

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, "Register">;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { signIn } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <View style={styles.action}>
        <Button title="Create account (demo)" onPress={signIn} />
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
    gap: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "700"
  },
  action: {
    width: "100%"
  }
});

export default RegisterScreen;
