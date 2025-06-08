import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import BuyerProfilePage from "../(profile)/BuyerProfilePage";
import HunterProfilePage from "../(profile)/HunterProfilePage";
import KurirProfilePage from "../(profile)/KurirProfilePage";
import PenitipProfilePage from "../(profile)/PenitipProfilePage";

export default function ProfileSwitcher() {
  const [role, setRole] = useState<string | null>(null);
  const [jabatan, setJabatan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoleAndJabatan = async () => {
      const storedRole = await AsyncStorage.getItem("role");
      const storedJabatan = await AsyncStorage.getItem("jabatan");
      setRole(storedRole);
      setJabatan(storedJabatan);
      setLoading(false);
    };
    loadRoleAndJabatan();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
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

  // fallback
  return <BuyerProfilePage />;
}
