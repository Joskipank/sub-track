import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

const DashboardScreen = () => {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>You are signed in.</Text>
      <View style={styles.action}>
        <Button title="Sign out" onPress={() => void signOut()} />
      </View>
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
  subtitle: {
    color: "#4b5563"
  },
  action: {
    width: "100%"
  }
});

export default DashboardScreen;
