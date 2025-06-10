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
  View,
} from "react-native";
import { Card, Divider } from "react-native-paper";

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

const API_BASE_URL = "http://10.53.11.177:8000/api";
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
      axios
        .get<Product[]>(`${API_BASE_URL}/produk`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        .then((res) => {
          setFetchedProducts(res.data);
          const sorted = res.data.sort((a, b) => a.id - b.id);
          setRecentProducts(sorted.slice(-20));
        })
        .catch((err) => console.error("Fetch produk error:", err));

      axios
        .get<{ count: number }>(
          `${API_BASE_URL}/notifications/unread-count`,
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        )
        .then((res) => setNotificationCount(res.data.count))
        .catch((err) => console.error("Fetch notifikasi error:", err));

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

      {/* Tentang ReuseMart */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoTitle}>Tentang ReuseMart</Text>
          </View>
          <Text style={styles.infoText}>
            ReuseMart adalah platform marketplace yang memfasilitasi penitipan
            barang preloved dan donasi, memastikan setiap barang mendapat
            kesempatan kedua. Temukan, titip, atau beli produk unik dengan mudah
            di sini!
          </Text>
        </Card.Content>
      </Card>

      <Divider style={styles.sectionDivider} />

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

      <Divider style={styles.sectionDivider} />

      <CategoryList
        selected={selectedCategory}
        setSelected={setSelectedCategory}
      />

      <Text style={styles.title}>
        {selectedCategory === "recent"
          ? "Produk Terkini"
          : `Kategori: ${selectedCategory}`}
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

  // Info Card
  infoCard: {
    borderRadius: 12,
    backgroundColor: Colors.WHITE,
    elevation: 3,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.BUTTON_PRIMARY,
  },
  infoText: {
    fontSize: 14,
    color: Colors.TEXT_DARK,
    lineHeight: 22,
  },

  sectionDivider: {
    marginVertical: 16,
    backgroundColor: Colors.GRAY,
    height: 1,
  },

  topSection: {
    borderRadius: 12,
    backgroundColor: Colors.WHITE,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.BUTTON_PRIMARY,
    marginBottom: 12,
  },

  sellerList: { marginTop: 4 },
  sellerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "600",
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
