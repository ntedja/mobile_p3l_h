import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProductGrid({ products }: { products: any[] }) {
  return (
    <View style={styles.grid}>
      {products.map((p, i) => (
        <TouchableOpacity key={i} style={styles.item}>
          <Image source={{ uri: p.image }} style={styles.image} />
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.price}>{p.price}</Text>
          <Text style={styles.category}>{p.category}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  item: {
    width: "47%",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 12,
  },
  name: { fontWeight: "bold", marginTop: 4 },
  price: { color: "#555" },
  category: { fontSize: 12, color: "#888" },
});
