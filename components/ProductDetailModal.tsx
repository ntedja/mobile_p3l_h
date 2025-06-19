import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../app/(tabs)/HomePage";

type ProductDetail = {
  id: number;
  name: string;
  price: string;
  category: string;
  image: string;
  images: string[];
  garansi: string;
  berat: string;
  deskripsi: string;
  penitip_name: string;
  penitip_since: string;
  penitip_rating: number;
  rating: number;
  status: string;
};

type ProductDetailModalProps = {
  visible: boolean;
  productId: number | null;
  onClose: () => void;
  onRateProduct: (productId: number, rating: number) => Promise<void>;
};

const { width } = Dimensions.get("window");

export default function ProductDetailModal({
  visible,
  productId,
  onClose,
  onRateProduct,
}: ProductDetailModalProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (productId && visible) {
      fetchProductDetail();
    }
  }, [productId, visible]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get<ProductDetail>(
        `${API_BASE_URL}/produk/${productId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      setProduct(response.data);
    } catch (err) {
      console.error("Failed to fetch product details:", err);
      setError("Failed to load product details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!productId) return;
    try {
      await onRateProduct(productId, rating);
      fetchProductDetail();
    } catch (err) {
      console.error("Failed to rate product:", err);
    }
  };

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>

        {loading && <Text style={styles.loadingText}>Loading...</Text>}

        {error && <Text style={styles.errorText}>{error}</Text>}

        {product && (
          <>
            {/* Product Images */}
            <View style={styles.imageContainer}>
              {product.images.length > 1 && (
                <TouchableOpacity
                  style={styles.navButtonLeft}
                  onPress={prevImage}
                >
                  <AntDesign name="left" size={24} color="white" />
                </TouchableOpacity>
              )}
              <Image
                source={{ uri: product.images[currentImageIndex] }}
                style={styles.productImage}
                resizeMode="contain"
              />
              {product.images.length > 1 && (
                <TouchableOpacity
                  style={styles.navButtonRight}
                  onPress={nextImage}
                >
                  <AntDesign name="right" size={24} color="white" />
                </TouchableOpacity>
              )}
              <Text style={styles.imageCounter}>
                {currentImageIndex + 1}/{product.images.length}
              </Text>
            </View>

            {/* Product Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>

              <View style={styles.ratingContainer}>
                <Text style={styles.sectionTitle}>Rating Produk:</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => handleRate(star)}
                    >
                      <AntDesign
                        name={star <= product.rating ? "star" : "staro"}
                        size={24}
                        color={star <= product.rating ? "#FFD700" : "#CCCCCC"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.ratingText}>{product.rating}/5</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Kategori:</Text>
                <Text style={styles.detailValue}>{product.category}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Berat:</Text>
                <Text style={styles.detailValue}>{product.berat} gram</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Garansi:</Text>
                <Text style={styles.detailValue}>{product.garansi}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Deskripsi Produk</Text>
                <Text style={styles.productDescription}>
                  {product.deskripsi}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Penitip</Text>
                <View style={styles.penitipContainer}>
                  <Text style={styles.penitipName}>{product.penitip_name}</Text>
                  <Text style={styles.penitipSince}>
                    Bergabung sejak {product.penitip_since}
                  </Text>
                  <View style={styles.penitipRatingContainer}>
                    <AntDesign name="star" size={16} color="#FFD700" />
                    <Text style={styles.penitipRating}>
                      {product.penitip_rating.toFixed(1)}/5
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7E2",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    padding: 8,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "red",
  },
  imageContainer: {
    height: 300,
    width: "100%",
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  navButtonLeft: {
    position: "absolute",
    left: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
  navButtonRight: {
    position: "absolute",
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
  imageCounter: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  infoContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 16,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: "bold",
    width: 100,
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    flex: 1,
  },
  penitipContainer: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
  },
  penitipName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  penitipSince: {
    fontSize: 14,
    color: "#666",
    marginVertical: 4,
  },
  penitipRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  penitipRating: {
    marginLeft: 4,
    fontSize: 14,
  },
  ratingContainer: {
    marginVertical: 12,
  },
  starsContainer: {
    flexDirection: "row",
    marginVertical: 8,
  },
  ratingText: {
    fontSize: 16,
    marginLeft: 8,
  },
});
