import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Badge } from "react-native-paper";

type NotificationIconProps = {
  count: number;
  onPress: () => void;
};

export default function NotificationIcon({
  count,
  onPress,
}: NotificationIconProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Ionicons name="notifications-outline" size={24} color="black" />
      {count > 0 && (
        <View style={styles.badge}>
          <Badge size={16}>{count}</Badge>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginRight: 16,
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
  },
});
