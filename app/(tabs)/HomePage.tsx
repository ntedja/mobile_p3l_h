import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import CategoryList from "../../components/CategoryList";
import IntroHeader, { BadgeInfo } from "../../components/IntroHeader";
import ProductGrid from "../../components/ProductGrid";
import Colors from "../../services/Colors";
import NotificationScreen from "./NotificationScreen";

type RootStackParamList = { Home: undefined; Notifications: undefined };

type Product = {
  id: number;
  name: string;
  price: string;
  category: string;
  image: string;
  images: string[];
};

type TopSeller = {
  penitip_id: number;
  penitip_name: string;
  from: string;
  to: string;
};

const API_BASE_URL = "http://172.16.33.96:8000/api";
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function HomePage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notificationCount, setNotificationCount] = useState(0);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("recent");
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [badge, setBadge] = useState<BadgeInfo | null>(null);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      // Fetch products
      axios
        .get<Product[]>(`${API_BASE_URL}/produk`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        .then((res) => {
          setFetchedProducts(res.data);
          // Ambil 20 produk terakhir
          const sorted = res.data.sort((a, b) => a.id - b.id);
          setRecentProducts(sorted.slice(-20));
        })
        .catch((err) => console.error("Fetch produk error:", err));

      // Fetch notifications
      axios
        .get<{ count: number }>(
          `${API_BASE_URL}/notifications/unread-count`,
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        )
        .then((res) => setNotificationCount(res.data.count))
        .catch((err) => console.error("Fetch notifikasi error:", err));

      // Fetch top sellers
      axios
        .get<{ success: boolean; data: TopSeller[] }>(
          `${API_BASE_URL}/badges/top-sellers`,
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        )
        .then((res) => {
          if (res.data.success) {
            setTopSellers(res.data.data);
            const first = res.data.data[0];
            setBadge({ name: "Top Seller", from: first.from, to: first.to });
          }
        })
        .catch((err) => console.error("Fetch top sellers error:", err));
    })();
  }, []);

  const goToNotifications = () => navigation.navigate("Notifications");

  const filteredProducts =
    selectedCategory === "recent"
      ? recentProducts
      : fetchedProducts.filter((p) => p.category === selectedCategory);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <IntroHeader
        notificationCount={notificationCount}
        onNotificationPress={goToNotifications}
        badge={badge}
      />

      {topSellers.length > 0 && (
        <View style={styles.topSection}>
          <Text style={styles.sectionTitle}>Top Seller Bulan Ini</Text>
          <View style={styles.sellerList}>
            {topSellers.map((ts) => (
              <View key={ts.penitip_id} style={styles.sellerItem}>
                <Text style={styles.sellerName}>{ts.penitip_name}</Text>
                <Text style={styles.sellerDates}>
                  {ts.from} – {ts.to}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ marginTop: 16 }}>
        <CategoryList
          selected={selectedCategory}
          setSelected={setSelectedCategory}
        />
      </View>


      <Text style={styles.title}>
        {selectedCategory === "recent" ? "Produk Terkini" : `Kategori: ${selectedCategory}`}
      </Text>

      <ProductGrid products={filteredProducts} />
    </ScrollView>
  );
}

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{ headerShown: true, title: "Notifikasi" }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.WHITE },
  content: { padding: 16 },

  topSection: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.BUTTON_PRIMARY,
  },

  sellerList: { marginTop: 12 },
  sellerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.TEXT_DARK,
  },
  sellerDates: {
    fontSize: 14,
    color: Colors.GRAY,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.BUTTON_PRIMARY,
    marginVertical: 16,
  },
});
