import { StyleSheet, Text, View } from "react-native";

export type BadgeInfo = {
  name: string;
  from: string;
  to: string;
};

type IntroHeaderProps = {
  notificationCount: number;
  onNotificationPress: () => void;
  badge?: BadgeInfo | null;
};

export default function IntroHeader({
  notificationCount,
  onNotificationPress,
  badge = null,
}: IntroHeaderProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Selamat Datang</Text>
        <Text style={styles.title}>Temukan barang bekas berkualitas</Text>

        {/* → INI BAGIAN BADGE ← */}
        {badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              ⭐ {badge.name} ({badge.from}–{badge.to})
            </Text>
          </View>
        )}
      </View>
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

  /* ← STYLE UNTUK BADGE → */
  badgeContainer: {
    backgroundColor: "#FFF1B8",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  badgeText: {
    color: "#B47F15",
    fontWeight: "600",
  },
});
