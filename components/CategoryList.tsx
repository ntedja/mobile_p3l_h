import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

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

export default function CategoryList({
  selected,
  setSelected,
}: {
  selected: string;
  setSelected: (c: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
    >
      {categories.map((cat, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.category, selected === cat.slug && styles.active]}
          onPress={() => {
            setSelected(selected === cat.slug ? "recent" : cat.slug);
          }}
        >
          <Text style={styles.label}>{cat.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexDirection: "row", marginBottom: 20 },
  category: {
    padding: 10,
    marginRight: 8,
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  active: {
    backgroundColor: "#C2F2C2",
  },
  label: { fontSize: 12 },
});
