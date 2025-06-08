import { Feather, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { TextInput } from "react-native";

import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE_URL = "http://172.16.36.88:8000/api";

type Product = {
  id: number;
  name: string;
  price: string;
  category: string;
  status: string;
  image: string;
  images: string[];
  garansi: string;
  berat: string;
  deskripsi: string;
  penitip_name: string;
  penitip_since: string;
  penitip_rating: number;
  rating: number;
};

type Diskusi = {
  id: number;
  isi: string;
  jawaban: string | null;
  created_at: string;
  pembeli: {
    nama: string;
  };
};

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams();
  const navigation = useNavigation();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [diskusi, setDiskusi] = useState<Diskusi[]>([]);
  const [newDiskusi, setNewDiskusi] = useState("");
  const [showFormDiskusi, setShowFormDiskusi] = useState(false);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get<Product>(
          `${API_BASE_URL}/produk/${productId}`
        );
        const raw = res.data;

        const mapped: Product = {
          id: raw.id,
          name: raw.name,
          price: raw.price,
          category: raw.category,
          status: raw.status,
          image: raw.image,
          images: Array.isArray(raw.images) ? raw.images : [raw.image],
          garansi: raw.garansi ?? "-",
          berat: raw.berat ?? "-",
          deskripsi: raw.deskripsi ?? "",
          penitip_name: raw.penitip_name ?? "-",
          penitip_since: raw.penitip_since ?? "-",
          penitip_rating: raw.penitip_rating ?? 0,
          rating: raw.rating ?? 0,
        };

        setProduct(mapped);
        setSelectedImage(mapped.image);
      } catch (err) {
        console.error("Gagal mengambil data produk", err);
        Alert.alert("Error", "Gagal mengambil data produk");
      }
    };

    const fetchDiskusi = async () => {
      try {
        const res = await axios.get<Diskusi[]>(
          `${API_BASE_URL}/produk/${productId}/diskusi`
        );
        const dataArr = Array.isArray(res.data) ? res.data : res.data;
        const diskusiData: Diskusi[] = dataArr.map((d: any) => ({
          id: d.ID_DISKUSI,
          isi: d.PERTANYAAN,
          jawaban: d.JAWABAN || null,
          created_at: d.CREATE_AT,
          pembeli: { nama: d.pembeli?.NAMA_PEMBELI || "Pengguna" },
        }));
        setDiskusi(diskusiData);
      } catch (err) {
        console.error("Gagal mengambil data diskusi", err);
      }
    };

    fetchProduct();
    fetchDiskusi();
  }, [productId]);

  const handleCartToggle = async () => {
    if (!product) return;

    try {
      // Implementasi logika keranjang belanja disini
      // Anda perlu menambahkan autentikasi dan API calls
      setInCart(!inCart);
      Alert.alert(
        "Success",
        inCart
          ? "Produk dihapus dari keranjang"
          : "Produk ditambahkan ke keranjang"
      );
    } catch (err) {
      console.error("Gagal update cart:", err);
      Alert.alert("Error", "Gagal update cart. Pastikan sudah login.");
    }
  };

  const handleSubmitDiskusi = async () => {
    if (!newDiskusi.trim()) return;

    try {
      // Implementasi pengiriman diskusi disini
      // Anda perlu menambahkan autentikasi dan API calls
      const newItem = {
        id: Math.random(),
        isi: newDiskusi,
        created_at: new Date().toISOString(),
        pembeli: { nama: "Anda" },
        jawaban: null,
      };
      setDiskusi((prev) => [...prev, newItem]);
      setNewDiskusi("");
      setShowFormDiskusi(false);
      Alert.alert("Success", "Diskusi berhasil dikirim");
    } catch (err) {
      console.error("Gagal mengirim diskusi", err);
      Alert.alert(
        "Error",
        "Gagal mengirim diskusi. Periksa apakah Anda sudah login."
      );
    }
  };

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#1E2B32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Produk</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Product Images */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: selectedImage }}
          style={styles.mainImage}
          resizeMode="contain"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailContainer}
        >
          {product.images.map((imgUrl, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedImage(imgUrl)}
            >
              <Image
                source={{ uri: imgUrl }}
                style={[
                  styles.thumbnail,
                  selectedImage === imgUrl && styles.selectedThumbnail,
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price}</Text>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Detail</Text>
          <View style={styles.detailRow}>
            <Text>Garansi:</Text>
            <Text style={styles.detailValue}>{product.garansi}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text>Berat:</Text>
            <Text style={styles.detailValue}>{product.berat}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text>Kategori:</Text>
            <Text style={styles.detailValue}>{product.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text>Status:</Text>
            <Text style={styles.detailValue}>{product.status}</Text>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.descriptionText}>
            {showMore
              ? product.deskripsi
              : `${product.deskripsi.substring(0, 100)}${
                  product.deskripsi.length > 100 ? "..." : ""
                }`}
          </Text>
          {product.deskripsi.length > 100 && (
            <TouchableOpacity onPress={() => setShowMore(!showMore)}>
              <Text style={styles.showMoreText}>
                {showMore ? "Lihat Sedikit" : "Lihat Selengkapnya"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Penitip Info */}
        <View style={styles.penitipSection}>
          <Text style={styles.sectionTitle}>Penitip</Text>
          <View style={styles.penitipRow}>
            <View style={styles.penitipAvatar}>
              <Text style={styles.avatarText}>
                {product.penitip_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.penitipInfo}>
              <Text style={styles.penitipName}>{product.penitip_name}</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MaterialIcons
                    key={star}
                    name={
                      star <= Math.round(product.penitip_rating)
                        ? "star"
                        : "star-border"
                    }
                    size={16}
                    color={
                      star <= Math.round(product.penitip_rating)
                        ? "#FFD700"
                        : "#CCCCCC"
                    }
                  />
                ))}
                <Text style={styles.ratingText}>
                  {product.penitip_rating.toFixed(1)}/5
                </Text>
              </View>
              <Text style={styles.penitipSince}>
                Bergabung sejak {product.penitip_since}
              </Text>
            </View>
          </View>
        </View>

        {/* Shipping Info */}
        <View style={styles.shippingSection}>
          <Text style={styles.sectionTitle}>Pengiriman</Text>
          <View style={styles.shippingRow}>
            <Text style={styles.shippingMethod}>Standard</Text>
            <Text style={styles.shippingPrice}>Rp. 10.000</Text>
          </View>
          <Text style={styles.shippingTime}>Operasional 08.00 – 20.00</Text>
          <Text style={styles.shippingNote}>
            Pembelian setelah jam 16.00 dikirim keesokan harinya
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.buyButton]}
          onPress={() =>
            Alert.alert(
              "Info",
              "Fitur beli sekarang akan diimplementasi kemudian"
            )
          }
        >
          <Text style={styles.actionButtonText}>Beli Sekarang</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            inCart ? styles.removeCartButton : styles.addCartButton,
          ]}
          onPress={handleCartToggle}
        >
          <Text style={styles.actionButtonText}>
            {inCart ? "Hapus dari Keranjang" : "Tambahkan ke Keranjang"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.wishlistButton]}
          onPress={() =>
            Alert.alert("Info", "Fitur wishlist akan diimplementasi kemudian")
          }
        >
          <Text style={styles.actionButtonText}>Sukai</Text>
        </TouchableOpacity>
      </View>

      {/* Diskusi Section */}
      <View style={styles.diskusiContainer}>
        <Text style={styles.sectionTitle}>Diskusi</Text>

        {diskusi.length === 0 ? (
          <View style={styles.emptyDiskusi}>
            <Text style={styles.emptyDiskusiText}>
              Belum ada diskusi mengenai produk ini. Langsung saja mulai diskusi
              yuk!
            </Text>
            {!showFormDiskusi && (
              <TouchableOpacity
                style={styles.startDiskusiButton}
                onPress={() => setShowFormDiskusi(true)}
              >
                <Text style={styles.startDiskusiButtonText}>Mulai Diskusi</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.diskusiList}>
            {diskusi.map((d) => (
              <View key={d.id} style={styles.diskusiItem}>
                <View style={styles.diskusiHeader}>
                  <Text style={styles.diskusiAuthor}>{d.pembeli.nama}</Text>
                  <Text style={styles.diskusiDate}>
                    {new Date(d.created_at).toLocaleDateString("id-ID")}
                  </Text>
                </View>
                <Text style={styles.diskusiContent}>{d.isi}</Text>

                {d.jawaban && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerAuthor}>Admin</Text>
                    <Text style={styles.answerContent}>{d.jawaban}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {(showFormDiskusi || diskusi.length > 0) && (
          <View style={styles.diskusiForm}>
            <TextInput
              value={newDiskusi}
              onChangeText={setNewDiskusi}
              placeholder="Tulis pertanyaanmu di sini..."
              style={styles.diskusiInput}
              multiline
            />
            <TouchableOpacity
              style={styles.diskusiSubmit}
              onPress={handleSubmitDiskusi}
            >
              <Text style={styles.diskusiSubmitText}>Kirim</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF7E2",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF7E2",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E2B32",
  },
  imageContainer: {
    padding: 16,
  },
  mainImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    backgroundColor: "#CFCAB5",
  },
  thumbnailContainer: {
    marginTop: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: "#CFCAB5",
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: "#5B8482",
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E2B32",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E2B32",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E2B32",
    marginBottom: 8,
    textDecorationLine: "underline",
  },
  detailSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailValue: {
    fontStyle: "italic",
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionText: {
    marginBottom: 8,
    lineHeight: 20,
  },
  showMoreText: {
    color: "#2D4C41",
    fontWeight: "bold",
    fontSize: 12,
  },
  penitipSection: {
    marginBottom: 16,
  },
  penitipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  penitipAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5B8482",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  penitipInfo: {
    flex: 1,
  },
  penitipName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  penitipSince: {
    fontSize: 12,
    color: "#666",
  },
  shippingSection: {
    marginBottom: 16,
  },
  shippingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  shippingMethod: {
    fontWeight: "500",
  },
  shippingPrice: {
    fontWeight: "500",
  },
  shippingTime: {
    fontSize: 14,
    marginBottom: 2,
  },
  shippingNote: {
    fontSize: 12,
    color: "#666",
  },
  actionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "white",
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: "#5B8482",
  },
  addCartButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#48635B",
  },
  removeCartButton: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  wishlistButton: {
    backgroundColor: "#4f9897",
    borderWidth: 1,
    borderColor: "#5B8482",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "500",
  },
  diskusiContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#D8D8D8",
  },
  emptyDiskusi: {
    backgroundColor: "#FFF7E2",
    borderWidth: 1,
    borderColor: "#8FC5C1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  emptyDiskusiText: {
    fontSize: 14,
    color: "#2D4C41",
    marginBottom: 12,
  },
  startDiskusiButton: {
    borderWidth: 1,
    borderColor: "#2D4C41",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  startDiskusiButtonText: {
    color: "#2D4C41",
    fontSize: 14,
  },
  diskusiList: {
    marginBottom: 16,
  },
  diskusiItem: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#8FC5C1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  diskusiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  diskusiAuthor: {
    fontWeight: "600",
    color: "#2D4C41",
  },
  diskusiDate: {
    fontSize: 12,
    color: "#666",
  },
  diskusiContent: {
    fontSize: 14,
    color: "#1E2B32",
  },
  answerContainer: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#5B8482",
    backgroundColor: "#F0F7F7",
    borderRadius: 6,
    padding: 8,
  },
  answerAuthor: {
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 14,
  },
  answerContent: {
    fontSize: 14,
  },
  diskusiForm: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  diskusiInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#8FC5C1",
    backgroundColor: "white",
    color: "#1E2B32",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 50,
  },
  diskusiSubmit: {
    backgroundColor: "#5B8482",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  diskusiSubmitText: {
    color: "white",
    fontWeight: "500",
  },
});
