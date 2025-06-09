import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import BuyerProfilePage from "../(profile)/BuyerProfilePage";
import HunterProfilePage from "../(profile)/HunterProfilePage";
import KurirProfilePage from "../(profile)/KurirProfilePage";
import PenitipProfilePage from "../(profile)/PenitipProfilePage";

export default function ProfileSwitcher() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [jabatan, setJabatan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedRole = await AsyncStorage.getItem("role");
        const storedJabatan = await AsyncStorage.getItem("jabatan");
        const token = await AsyncStorage.getItem("token");

        console.log("Stored Role:", storedRole); 
        console.log("Stored Jabatan:", storedJabatan);

        setRole(storedRole);
        setJabatan(storedJabatan);
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
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
            backgroundColor: "#4CAF50",
            padding: 15,
            borderRadius: 5,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (role === "pembeli") {
    return <BuyerProfilePage />;
  }

  if (role === "penitip") {
    return <PenitipProfilePage />;
  }

  if (role === "pegawai") {
    if (jabatan?.toLowerCase() === "kurir") {
      return <KurirProfilePage />;
    }
    if (jabatan?.toLowerCase() === "hunter") {
      return <HunterProfilePage />;
    }
  }

  return <BuyerProfilePage />;
}
