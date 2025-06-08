// app/(tabs)/ProfileSwitcher.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import BuyerProfilePage from "../(profile)/BuyerProfilePage";
import KurirProfilePage from "../(profile)/KurirProfilePage";
import PenitipProfilePage from "../(profile)/PenitipProfilePage";

export default function ProfileSwitcher() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userRole = await AsyncStorage.getItem("role");

        setIsLoggedIn(!!token);
        setRole(userRole);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ marginBottom: 20, textAlign: "center" }}>
          Anda belum login. Silakan login untuk mengakses profil Anda.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={{
            backgroundColor: "#007AFF",
            padding: 15,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  switch (role) {
    case "pembeli":
      return <BuyerProfilePage />;
    case "penitip":
      return <PenitipProfilePage />;
    case "kurir":
      return <KurirProfilePage />;
    default:
      return <BuyerProfilePage />;
  }
}
