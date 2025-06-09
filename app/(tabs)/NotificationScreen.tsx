// app/(tabs)/NotificationScreen.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Divider, List } from "react-native-paper";
import Colors from "../../services/Colors";

type Notification = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  productId?: number;
};

export default function NotificationScreen() {
  const API_BASE_URL = "http://172.16.33.96:8000/api";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      // Jika backend Anda memakai /api/notifications (bukan /user/notifications),
      // ubah URL di bawah sesuai:
      const url = `${API_BASE_URL}/notifications`;
      const response = await axios.get<{
        success: boolean;
        data: Notification[];
        message?: string;
      }>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        setNotifications(response.data.data);
      } else {
        console.warn("Respons notifikasi tidak seperti yang diharapkan");
      }
    } catch (error: any) {
      console.error("Gagal fetch notifikasi:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      // Sesuaikan endpoint jika berbeda:
      const url = `${API_BASE_URL}/notifications/${id}/read`;
      await axios.patch(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Gagal update notifikasi:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Memuat notifikasi...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.center}>
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
                color={notification.isRead ? "#888" : Colors.BUTTON_PRIMARY}
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
    backgroundColor: Colors.WHITE,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationItem: {
    paddingVertical: 12,
  },
  unreadNotification: {
    backgroundColor: "#F5F5FF",
  },
});
