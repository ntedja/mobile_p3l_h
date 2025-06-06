// app/Onboarding2.tsx
import { useRouter } from "expo-router";
import React from "react";
import {
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Colors from "../services/Colors";

export default function Onboarding2() {
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.ONBOARD2_BG }]}>
      <View style={styles.imageWrapper}>
        <Image
          source={require("../assets/images/onboarding2.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.heading}>Jual Barang Bekas Tanpa Ribet</Text>
        <Text style={styles.subtext}>
          Titipkan barangmu ke ReUseMart, biar tim kami yang urus penjualan. Aman, praktis, tanpa repot!
        </Text>
      </View>

      {/* Dot indicator (halaman 2 aktif) */}
      <View style={styles.dotsWrapper}>
        <View style={[styles.dot, { backgroundColor: Colors.DOT_INACTIVE }]} />
        <View style={[styles.dot, { backgroundColor: Colors.DOT_ACTIVE }]} />
        <View style={[styles.dot, { backgroundColor: Colors.DOT_INACTIVE }]} />
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.navButton, { borderColor: Colors.TEXT_DARK }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.navButtonText, { color: Colors.TEXT_DARK }]}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: Colors.BUTTON_SECONDARY }]}
          onPress={() => router.push("/Onboarding3")}
        >
          <Text style={[styles.navButtonText, { color: Colors.TEXT_LIGHT }]}>Next →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  imageWrapper: {
    flex: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "75%",
    height: "75%",
  },
  textWrapper: {
    flex: 2,
    justifyContent: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.TEXT_DARK,
    marginBottom: 12,
  },
  subtext: {
    fontSize: 16,
    color: Colors.TEXT_DARK,
    lineHeight: 24,
  },
  dotsWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
