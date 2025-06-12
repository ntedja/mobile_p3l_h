// app/Onboarding3.tsx
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

export default function Onboarding3() {
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.ONBOARD3_BG }]}>
      <View style={styles.imageWrapper}>
        <Image
          source={require("../assets/images/onboarding3.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.heading}>Belanja Cerdas & Ramah Lingkungan</Text>
        <Text style={styles.subtext}>
          Temukan barang keren dengan harga miring. Kurangi limbah, jaga bumi, dan tetap stylish!
        </Text>
      </View>

      {/* Dot indicator (halaman 3 aktif) */}
      <View style={styles.dotsWrapper}>
        <View style={[styles.dot, { backgroundColor: Colors.DOT_INACTIVE }]} />
        <View style={[styles.dot, { backgroundColor: Colors.DOT_INACTIVE }]} />
        <View style={[styles.dot, { backgroundColor: Colors.DOT_ACTIVE }]} />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Colors.BUTTON_TERTIARY }]}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonText}>Finish →</Text>
      </TouchableOpacity>
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
    width: "80%",
    height: "80%",
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
  button: {
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: {
    color: Colors.TEXT_LIGHT,
    fontSize: 16,
    fontWeight: "600",
  },
});
