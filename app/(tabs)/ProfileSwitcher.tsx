// app/(tabs)/ProfileSwitcher.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import BuyerProfilePage from "./_private/BuyerProfilePage";
import PenitipProfilePage from "./_private/PenitipProfilePage";
// import KurirProfilePage from "./nested/KurirProfilePage";
// import HunterProfilePage from "./nested/HunterProfilePage";

export default function ProfileSwitcher() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("role").then(r => setRole(r));
  }, []);

  if (role === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  switch (role) {
    case "pembeli":
      return <BuyerProfilePage />;
    case "penitip":
      return <PenitipProfilePage />;
    // case "kurir":
    //   return <KurirProfilePage />;
    // case "hunter":
    //   return <HunterProfilePage />;
    default:
      return <BuyerProfilePage />;
  }
}
