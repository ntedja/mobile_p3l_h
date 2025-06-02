import { StyleSheet, Text, View } from "react-native";
import NotificationIcon from "./NotificationIcon";

type IntroHeaderProps = {
  notificationCount: number;
  onNotificationPress: () => void;
};

export default function IntroHeader({
  notificationCount,
  onNotificationPress,
}: IntroHeaderProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Selamat Datang</Text>
        <Text style={styles.title}>Temukan barang bekas berkualitas</Text>
      </View>
      <NotificationIcon
        count={notificationCount}
        onPress={onNotificationPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
});
