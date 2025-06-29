import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { Card, Divider } from "react-native-paper";
import {
  fetchKurirHistory,
  fetchKurirHistorySelesai,
  fetchKurirProfile,
  KurirProfile,
  TugasPengiriman,
  updateStatusPengiriman,
} from "../../api/kurirApi";
import Colors from "../../services/Colors";

export default function KurirProfilePage() {
  const [profile, setProfile] = useState<KurirProfile | null>(null);
  const [tugas, setTugas] = useState<TugasPengiriman[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [tugasSelesai, setTugasSelesai] = useState<TugasPengiriman[]>([]);

  useEffect(() => {
    console.log("Mounting KurirProfilePage");
    const init = async () => {
      const id = await AsyncStorage.getItem("pegawai_id");
      console.log("Stored pegawai_id:", id);
    };
    init();

    loadProfile();
    loadTugas();
    loadTugasSelesai();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    await loadTugas();
    await loadTugasSelesai();
    setRefreshing(false);
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const idKurirString = await AsyncStorage.getItem("pegawai_id");
      if (!idKurirString) {
        throw new Error("ID pegawai tidak ditemukan di penyimpanan lokal");
      }

      const idKurir = parseInt(idKurirString, 10);
      if (isNaN(idKurir)) {
        throw new Error("ID pegawai tidak valid");
      }

      const profileData = await fetchKurirProfile(idKurir);
      console.log("Profile data:", profileData); // Debug log
      setProfile(profileData);
      setError("");
    } catch (err: any) {
      console.error("Error loading profile:", err);
      setError(err.message || "Gagal memuat profil");
      Alert.alert("Error", err.message || "Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const loadTugas = async () => {
    setLoading(true);
    try {
      const idKurirString = await AsyncStorage.getItem("pegawai_id");
      if (!idKurirString) throw new Error("ID pegawai tidak ditemukan");
      const idKurir = parseInt(idKurirString, 10);
      console.log("Fetching tasks for ID:", idKurir); // Debug log
      const tugasData = await fetchKurirHistory(idKurir);
      setTugas(tugasData);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTugasSelesai = async () => {
    setLoading(true);
    try {
      const idKurirString = await AsyncStorage.getItem("pegawai_id");
      if (!idKurirString) throw new Error("ID pegawai tidak ditemukan");
      const idKurir = parseInt(idKurirString, 10);

      const tugasData = await fetchKurirHistorySelesai(idKurir); // Selesai
      setTugasSelesai(tugasData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number) => {
    Alert.alert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menandai pengiriman ini sebagai selesai?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya",
          onPress: async () => {
            try {
              await updateStatusPengiriman(id);
              Alert.alert("Sukses", "Status pengiriman berhasil diperbarui.");
              loadTugas();
            } catch (err) {
              Alert.alert("Gagal", "Gagal memperbarui status pengiriman.");
            }
          },
        },
      ]
    );
  };

  const renderTugas = ({ item }: { item: TugasPengiriman }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.txHeader}>
          <View>
            <Text style={styles.kode}>
              ID Transaksi: {item.ID_TRANSAKSI_PEMBELIAN}
            </Text>
            <Text>
              Tanggal: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.status}>{item.STATUS_TRANSAKSI}</Text>
        </View>
        <Text>Metode Pengiriman: {item.DELIVERY_METHOD}</Text>
        <Divider style={{ marginVertical: 8 }} />
        <Button
          title={
            item.STATUS_TRANSAKSI === "Selesai"
              ? "Sudah Selesai"
              : "Tandai Selesai"
          }
          onPress={() => handleUpdateStatus(item.ID_TRANSAKSI_PEMBELIAN)}
          disabled={item.STATUS_TRANSAKSI === "Selesai"}
          color={
            item.STATUS_TRANSAKSI === "Selesai"
              ? Colors.GRAY
              : Colors.BUTTON_PRIMARY
          }
        />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil Kurir</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.BUTTON_PRIMARY}
          style={{ marginTop: 20 }}
        />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <View style={styles.profileContainer}>
            {profile ? (
              <>
                <Text style={styles.name}>{profile.NAMA_PEGAWAI}</Text>
                <Text style={styles.email}>{profile.EMAIL_PEGAWAI}</Text>
              </>
            ) : (
              <Text>Profil tidak tersedia</Text>
            )}
          </View>

          <Text style={styles.subHeader}>Daftar Tugas Pengiriman</Text>
          <FlatList
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            data={tugas}
            keyExtractor={(item) => item.ID_TRANSAKSI_PEMBELIAN.toString()}
            renderItem={renderTugas}
            contentContainerStyle={{ paddingBottom: 80, marginTop: 12 }}
          />

          <Text style={styles.subHeader}>History Tugas Pengiriman</Text>
          <FlatList
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            data={tugasSelesai}
            keyExtractor={(item) => item.ID_TRANSAKSI_PEMBELIAN.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.kode}>
                  ID Transaksi: {item.ID_TRANSAKSI_PEMBELIAN}
                </Text>
                <Text>Status Transaksi: {item.STATUS_TRANSAKSI}</Text>
                <Text>Delivery Method: {item.DELIVERY_METHOD}</Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 80, marginTop: 12 }}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.WHITE },
  header: {
    height: 56,
    backgroundColor: Colors.BUTTON_PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: Colors.WHITE, fontSize: 20, fontWeight: "700" },

  profileContainer: {
    backgroundColor: Colors.WHITE,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 3,
  },
  name: { fontSize: 18, fontWeight: "700", color: Colors.TEXT_DARK },
  email: { fontSize: 14, color: Colors.GRAY, marginTop: 4 },

  subHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 16,
    marginTop: 8,
    color: Colors.TEXT_DARK,
  },

  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.WHITE,
    elevation: 2,
    padding: 12,
  },
  txHeader: { flexDirection: "row", justifyContent: "space-between" },
  kode: { fontSize: 16, fontWeight: "600", color: Colors.TEXT_DARK },
  status: { fontSize: 16, fontWeight: "600", color: Colors.BUTTON_PRIMARY },

  button: {
    backgroundColor: Colors.BUTTON_PRIMARY,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: Colors.GRAY,
  },
  buttonText: { color: Colors.WHITE, fontWeight: "600" },

  error: { color: "red", textAlign: "center", marginTop: 20 },
});
