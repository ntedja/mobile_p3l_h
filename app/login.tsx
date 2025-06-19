// app/login.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { login } from "../api/apiAuth";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await login(email, password);
      console.log("login response:", data);

      await AsyncStorage.setItem("token", data.token);

      const role = data.user?.role ?? data.role;
      if (typeof role === "string") {
        await AsyncStorage.setItem("role", role);
      } else {
        await AsyncStorage.removeItem("role");
      }

      router.replace("/(tabs)/HomePage");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      // Set role sebagai guest di AsyncStorage
      await AsyncStorage.setItem("role", "guest");
      // Bersihkan token jika ada
      await AsyncStorage.removeItem("token");
      // Redirect ke homepage
      router.replace("/(tabs)/HomePage");
    } catch (err) {
      console.error("Guest login error:", err);
      setErrorMsg("Failed to login as guest");
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <Text style={styles.label}>Email address:</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
        />

        <Text style={styles.label}>Password:</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showPasswordBtn}
          >
            <Text style={{ color: "#3E5B50" }}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {!!errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* Tambahkan divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Tombol login sebagai tamu */}
        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleGuestLogin}
          disabled={loading}
        >
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFF7E2",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#3E5B50",
  },
  label: {
    fontWeight: "500",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderColor: "#CFCAB5",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
    color: "#2F3F3A",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  showPasswordBtn: {
    paddingHorizontal: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#3E5B50",
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  // Styles baru untuk guest login
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#CFCAB5",
  },
  dividerText: {
    width: 50,
    textAlign: "center",
    color: "#64748B",
  },
  guestButton: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CFCAB5",
  },
  guestButtonText: {
    color: "#3E5B50",
    fontWeight: "600",
    fontSize: 16,
  },
});
