import { Image, StyleSheet, View } from "react-native";

export default function IntroHeader() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/i1.png")}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
});
