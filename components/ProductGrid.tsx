import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Product } from "../app/(tabs)/HomePage";

type ProductGridProps = {
  products: Product[];
  onProductPress: (productId: number) => void;
};

export default function ProductGrid({
  products,
  onProductPress,
}: ProductGridProps) {
  return (
    <View style={styles.container}>
      {products.map((product) => (
        <TouchableOpacity
          key={product.id}
          style={styles.productCard}
          onPress={() => onProductPress(product.id)}
        >
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="contain"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.productPrice}>{product.price}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F5F5F5",
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#666",
  },
});
