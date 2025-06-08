import axios from "axios";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Divider, List } from "react-native-paper";

type Notification = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  productId?: number;
};

export default function NotificationScreen() {
  const API_BASE_URL = "http://172.16.36.88:8000/api";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ganti dengan API endpoint notifikasi Anda
    axios
      .get<Notification[]>(`${API_BASE_URL}/notifications`)
      .then((res) => {
        setNotifications(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal fetch notifikasi:", err);
        setLoading(false);
      });
  }, []);

  const markAsRead = (id: number) => {
    // Ganti dengan API untuk menandai notifikasi sebagai terbaca
    axios
      .patch(`${API_BASE_URL}/notifications/${id}/read`)
      .then(() => {
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      })
      .catch((err) => console.error("Gagal update notifikasi:", err));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Memuat notifikasi...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Tidak ada notifikasi</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {notifications.map((notification) => (
        <View key={notification.id}>
          <List.Item
            title={notification.title}
            description={notification.message}
            left={(props) => (
              <List.Icon
                {...props}
                icon={notification.isRead ? "email-open" : "email"}
                color={notification.isRead ? "#888" : "#3f51b5"}
              />
            )}
            onPress={() => markAsRead(notification.id)}
            style={[
              styles.notificationItem,
              !notification.isRead && styles.unreadNotification,
            ]}
          />
          <Divider />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  notificationItem: {
    paddingVertical: 12,
  },
  unreadNotification: {
    backgroundColor: "#f5f5ff",
  },
});
