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
  // ... (kategori lainnya tetap sama)
];

const API_BASE_URL = "http://10.31.248.95:8000/api";

// Perbaikan: Gunakan createNativeStackNavigator untuk membuat Stack
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function HomePage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState("recent");
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    axios.get<Product[]>(`${API_BASE_URL}/produk`).then((res) => {
      const products = res.data.map((item) => {
        const catObj = categories.find(
          (c: { value: string }) =>
            c.value.toLowerCase() === item.category.toLowerCase()
        );
        return {
          ...item,
          category: catObj?.label || item.category,
        };
      });

      setFetchedProducts(products);
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      setRecentProducts(shuffled.slice(0, 7));
    });

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
