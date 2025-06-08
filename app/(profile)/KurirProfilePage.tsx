import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Divider } from "react-native-paper";
import {
  fetchKurirHistory,
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
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) throw new Error("Token tidak ditemukan");

      const idKurirString = await AsyncStorage.getItem("pegawai_id");
      if (!idKurirString) throw new Error("ID pegawai tidak ditemukan");
      const idKurir = parseInt(idKurirString, 10);

      const profileData = await fetchKurirProfile(idKurir, token);
      setProfile(profileData);

      const tugasData = await fetchKurirHistory(idKurir, token);
      setTugas(tugasData);
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
      "Apakah kamu yakin ingin menyelesaikan tugas pengiriman ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("auth_token");
              if (!token) throw new Error("Token tidak ditemukan");
              await updateStatusPengiriman(id, token);
              Alert.alert("Sukses", "Status pengiriman telah diperbarui.");
              loadData();
            } catch (err) {
              Alert.alert("Gagal", "Gagal memperbarui status.");
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
            <Text style={styles.kode}>Kode: {item.kode}</Text>
            <Text>Tanggal: {new Date(item.tanggal).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.nilai}>Status: {item.status}</Text>
        </View>
        <Text>Metode Pengiriman: {item.metode_pengiriman}</Text>
        <Divider style={{ marginVertical: 8 }} />
        <TouchableOpacity
          style={styles.selesaiButton}
          onPress={() => handleUpdateStatus(item.id)}
          disabled={item.status === "Selesai"}
        >
          <Text style={styles.selesaiButtonText}>
            {item.status === "Selesai" ? "Sudah Selesai" : "Tandai Selesai"}
          </Text>
        </TouchableOpacity>
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
                <Text style={styles.value}>
                  Komisi: Rp{profile.KOMISI_PEGAWAI.toLocaleString()}
                </Text>
                <Text style={styles.value}>
                  Jabatan: {profile.jabatans.NAMA_JABATAN}
                </Text>
              </>
            ) : (
              <Text>Profil tidak tersedia</Text>
            )}
          </View>

          <Text style={styles.subHeader}>History Tugas Pengiriman</Text>
          <FlatList
            data={tugas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTugas}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
  value: { fontSize: 14, color: Colors.TEXT_DARK, marginTop: 6 },

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
  nilai: { fontSize: 16, fontWeight: "600", color: Colors.BUTTON_PRIMARY },

  selesaiButton: {
    backgroundColor: Colors.BUTTON_PRIMARY,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  selesaiButtonText: { color: Colors.WHITE, fontWeight: "600" },

  error: { color: "red", textAlign: "center", marginTop: 20 },
});
