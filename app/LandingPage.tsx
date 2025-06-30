import { Marquee } from "@animatereactnative/marquee";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Colors from "../services/Colors";

export default function LandingPage() {
  const router = useRouter();
  const imageList = [
    require("./../assets/images/1.jpeg"),
    require("./../assets/images/c1.jpeg"),
    require("./../assets/images/2.png"),
    require("./../assets/images/c2.jpeg"),
    require("./../assets/images/3.jpeg"),
    require("./../assets/images/c3.jpeg"),
    require("./../assets/images/4.jpeg"),
    require("./../assets/images/c4.jpeg"),
    require("./../assets/images/5.jpeg"),
    require("./../assets/images/c5.jpeg"),
  ];

  return (
    <GestureHandlerRootView>
      <View>
        <Marquee
          spacing={10}
          speed={0.7}
          style={{
            transform: [{ rotate: "-4deg" }],
          }}
        >
          <View style={styles.imageContainer}>
            {imageList.map((image, index) => (
              <Image
                key={`marquee1-${index}`}
                source={image}
                style={styles.image}
              />
            ))}
          </View>
        </Marquee>
        <Marquee
          spacing={10}
          speed={0.4}
          style={{
            transform: [{ rotate: "-4deg" }],
            marginTop: 10,
          }}
        >
          <View style={styles.imageContainer}>
            {imageList.map((image, index) => (
              <Image
                key={`marquee2-${index}`}
                source={image}
                style={styles.image}
              />
            ))}
          </View>
        </Marquee>
        <Marquee
          spacing={10}
          speed={0.5}
          style={{
            transform: [{ rotate: "-4deg" }],
            marginTop: 10,
          }}
        >
          <View style={styles.imageContainer}>
            {imageList.map((image, index) => (
              <Image
                key={`marquee3-${index}`}
                source={image}
                style={styles.image}
              />
            ))}
          </View>
        </Marquee>
      </View>

      <View
        style={{
          backgroundColor: Colors.WHITE,
          height: "100%",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontFamily: "outfit-bold",
            fontSize: 30,
            textAlign: "center",
          }}
        >
          ReUseMart
        </Text>

        <Text
          style={{
            textAlign: "center",
            fontFamily: "outfit",
            fontSize: 17,
            color: Colors.GRAY,
            marginTop: 7,
          }}
        >
          ReUseMart
        </Text>
        <TouchableOpacity
          // onPress={() => router.push("./login")}
          onPress={() => router.push("./(tabs)/HomePage")}
          style={styles.button}
        >
          <Text
            style={{
              textAlign: "center",
              color: Colors.WHITE,
              fontSize: 17,
              fontFamily: "outfit",
            }}
          >
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 160,
    height: 160,
    borderRadius: 25,
  },
  imageContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 1,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
  },
});
