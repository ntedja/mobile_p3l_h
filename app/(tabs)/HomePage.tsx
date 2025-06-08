import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import axios from "axios";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import CategoryList from "../../components/CategoryList";
import IntroHeader from "../../components/IntroHeader";
import ProductGrid from "../../components/ProductGrid";
import NotificationScreen from "./NotificationScreen";

type RootStackParamList = {
  Home: undefined;
  Notifications: undefined;
};

type Product = {
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
const API_BASE_URL = "http://192.168.18.73:8000/api";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function HomePage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState("recent");
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Fetch semua produk
    axios
      .get<Product[]>(`${API_BASE_URL}/produk`)
      .then((res) => {
        const products = res.data.map((item) => {
          const catObj = categories.find(
            (c) => c.value.toLowerCase() === item.category.toLowerCase()
          );
          return {
            ...item,
            category: catObj?.label || item.category,
          };
        });

        setFetchedProducts(products);
        // Ambil 20 produk acak untuk “Produk Terkini”
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        setRecentProducts(shuffled.slice(0, 20));
      })
      .catch((err) => console.error("Gagal fetch produk:", err));

    // Fetch jumlah notifikasi belum dibaca
    axios
      .get<{ count: number }>(`${API_BASE_URL}/notifications/unread-count`)
      .then((res) => setNotificationCount(res.data.count))
      .catch((err) => console.error("Gagal fetch notifikasi:", err));
  }, []);

  const handleNotificationPress = () => {
    navigation.navigate("Notifications");
  };

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
      />
      <CategoryList
        selected={selectedCategory}
        setSelected={setSelectedCategory}
      />
      <Text style={styles.title}>
        {selectedCategory === "recent" ? "Produk Terkini" : selectedCategory}
      </Text>
      <ProductGrid products={productList} />
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
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFF7E2",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },
});
