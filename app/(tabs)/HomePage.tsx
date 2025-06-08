import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import axios from "axios";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import CategoryList from "../../components/CategoryList";
import IntroHeader, { BadgeInfo } from "../../components/IntroHeader";
import ProductGrid from "../../components/ProductGrid";
import NotificationScreen from "./NotificationScreen";
import ProductDetailScreen from "./ProductDetailScreen";

type RootStackParamList = {
  Home: undefined;
  Notifications: undefined;
  ProductDetail: { productId: number };
};

// Export the Product type
export type Product = {
  id: number;
  name: string;
  price: string;
  category: string;
  image: string;
  images: string[];
};

const categories = [
  {
    label: "Elektronik & Gadget",
    value: "Elektronik",
    icon: "bi-phone",
    slug: "elektronik",
  },
  {
    label: "Pakaian & Aksesoris",
    value: "Pakaian",
    icon: "bi-bag",
    slug: "pakaian",
  },
  {
    label: "Perabotan Rumah Tangga",
    value: "Perabotan",
    icon: "bi-house",
    slug: "perabotan",
  },
  {
    label: "Buku, Alat Tulis, & Peralatan Sekolah",
    value: "Buku",
    icon: "bi-book",
    slug: "buku",
  },
  {
    label: "Hobi, Mainan, & Koleksi",
    value: "Hobi",
    icon: "bi-controller",
    slug: "hobi",
  },
  {
    label: "Perlengkapan Bayi & Anak",
    value: "Bayi & Anak",
    icon: "bi-emoji-smile",
    slug: "bayi-anak",
  },
  {
    label: "Otomotif & Aksesoris",
    value: "Otomotif",
    icon: "bi-car-front",
    slug: "otomotif",
  },
  {
    label: "Perlengkapan Taman & Outdoor",
    value: "Taman & Outdoor",
    icon: "bi-flower2",
    slug: "taman-outdoor",
  },
  {
    label: "Peralatan Kantor & Industri",
    value: "Kantor & Industri",
    icon: "bi-briefcase",
    slug: "kantor-industri",
  },
  {
    label: "Kosmetik & Perawatan Diri",
    value: "Kosmetik",
    icon: "bi-heart",
    slug: "kosmetik",
  },
];

// **Perbaikan di sini:**
const API_BASE_URL = "http://172.16.36.88:8000/api";

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomePage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notificationCount, setNotificationCount] = useState(0);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("recent");
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [badge, setBadge] = useState<BadgeInfo | null>(null);

  const handleProductPress = (productId: number) => {
    navigation.navigate("ProductDetail", { productId });
  };

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");

      // ─── 1) Produk ─────────────────────────────────────
      axios
        .get<Product[]>(`${API_BASE_URL}/produk`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        .then((res) => {
          setFetchedProducts(res.data);
          const shuffled = [...res.data].sort(() => 0.5 - Math.random());
          setRecentProducts(shuffled.slice(0, 20));
        })
        .catch((err) => console.error("Gagal fetch produk:", err));

      // ─── 2) Notifikasi ─────────────────────────────────
      axios
        .get<{ count: number }>(
          `${API_BASE_URL}/notifications/unread-count`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        )
        .then((res) => setNotificationCount(res.data.count))
        .catch((err) => console.error("Gagal fetch notifikasi:", err));

      // ─── 3) Top Sellers ────────────────────────────────
      axios
        .get<{ success: boolean; data: TopSeller[] }>(
          `${API_BASE_URL}/badges/top-sellers`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        )
        .then((res) => {
          if (res.data.success && res.data.data.length) {
            setTopSellers(res.data.data);
            const first = res.data.data[0];
            setBadge({
              name: "Top Seller",
              from: first.from,
              to: first.to,
            });
          } else {
            console.warn("Top sellers kosong atau success=false", res.data);
          }
        })
        .catch((err) => {
          console.error("Gagal fetch top sellers:");
          console.error("→ Status:", err.response?.status);
          console.error("→ Response data:", err.response?.data);
          console.error("→ Request headers:", err.config?.headers);
          console.error("→ Message:", err.message);
        });
    })();
  }, []);

  const handleNotificationPress = () =>
    navigation.navigate("Notifications");

  const productList =
    selectedCategory === "recent"
      ? recentProducts
      : fetchedProducts.filter((p) => {
          const category = categories.find((c) => c.slug === selectedCategory);
          return category && p.category === category.label;
        });

  return (
    <ScrollView style={styles.container}>
      <IntroHeader
        notificationCount={notificationCount}
        onNotificationPress={handleNotificationPress}
        badge={badge}
      />

      {/* Section Top Sellers */}
      {topSellers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Seller Bulan Ini</Text>
          {topSellers.map((ts) => (
            <View key={ts.penitip_id} style={styles.topSellerItem}>
              <Text style={styles.topSellerName}>{ts.penitip_name}</Text>
              <Text style={styles.topSellerDates}>
                ({ts.from} – {ts.to})
              </Text>
            </View>
          ))}
        </View>
      )}

      <CategoryList
        selected={selectedCategory}
        setSelected={setSelectedCategory}
      />

      <Text style={styles.title}>
        {selectedCategory === "recent" ? "Produk Terkini" : selectedCategory}
      </Text>
      <ProductGrid products={productList} onProductPress={handleProductPress} />
    </ScrollView>
  );
}

export function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomePage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{ title: "Notifikasi" }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Detail Produk" }}
      />
    </Stack.Navigator>
  );
}

export default HomePage;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#FFF7E2" },
  section: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  topSellerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  topSellerName: { fontSize: 16, fontWeight: "600" },
  topSellerDates: { fontSize: 14, color: "#555" },
  title: { fontSize: 18, fontWeight: "600", marginVertical: 12 },
});
