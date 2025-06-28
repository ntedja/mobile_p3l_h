import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { Card } from "react-native-paper";
import {
  fetchHunterKomisi,
  fetchHunterProfile,
  HunterProfile,
  KomisiDetail,
} from "../../api/hunterApi";
import Colors from "../../services/Colors";

export default function HunterProfilePage() {
  const [profile, setProfile] = useState<HunterProfile | null>(null);
  const [komisiList, setKomisiList] = useState<KomisiDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedKomisi, setSelectedKomisi] = useState<KomisiDetail | null>(
    null
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadProfile();
    await loadKomisi();
  };

  const loadProfile = async () => {
    try {
      const idString = await AsyncStorage.getItem("pegawai_id");
      if (!idString) throw new Error("ID pegawai tidak ditemukan");
      const id = parseInt(idString, 10);

      const profileData = await fetchHunterProfile(id);
      setProfile(profileData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const loadKomisi = async () => {
    setLoading(true);
    try {
      const idString = await AsyncStorage.getItem("pegawai_id");
      if (!idString) throw new Error("ID pegawai tidak ditemukan");
      const id = parseInt(idString, 10);

      const komisiData = await fetchHunterKomisi(id);
      // Format data komisi
      const formattedKomisi = komisiData.map((item: any) => ({
        ID_KOMISI: item.ID_KOMISI,
        JENIS_KOMISI: item.JENIS_KOMISI || "Komisi Transaksi",
        NOMINAL_KOMISI: item.NOMINAL_KOMISI,
        ID_TRANSAKSI_PEMBELIAN: item.ID_TRANSAKSI_PEMBELIAN || "N/A",
        created_at: item.created_at
          ? new Date(item.created_at).toISOString()
          : new Date().toISOString(),
        STATUS_BARANG: item.transaksiPembelian?.STATUS_BARANG || "Unknown",
      }));
      setKomisiList(formattedKomisi);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const renderKomisi = ({ item }: { item: KomisiDetail }) => (
    <Pressable onPress={() => setSelectedKomisi(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.kode}>ID Komisi: {item.ID_KOMISI}</Text>
          <Text>Jenis: {item.JENIS_KOMISI}</Text>
          <Text>Nominal: Rp{item.NOMINAL_KOMISI.toLocaleString("id-ID")}</Text>
          <Text>Status: {item.STATUS_BARANG}</Text>
        </Card.Content>
      </Card>
    </Pressable>
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Tanggal tidak valid";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil Hunter</Text>
      </View>

      {loading && !refreshing ? (
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
                <Text style={styles.phone}>
                  No. Telp: {profile.NO_TELP_PEGAWAI}
                </Text>
                <Text style={styles.komisi}>
                  Total Komisi: Rp
                  {profile.KOMISI_PEGAWAI.toLocaleString("id-ID")}
                </Text>
              </>
            ) : (
              <Text>Profil tidak tersedia</Text>
            )}
          </View>

          <Text style={styles.subHeader}>History Komisi</Text>
          <FlatList
            data={komisiList}
            keyExtractor={(item) => item.ID_KOMISI.toString()}
            renderItem={renderKomisi}
            contentContainerStyle={{ paddingBottom: 80, marginTop: 12 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.BUTTON_PRIMARY]}
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Belum ada riwayat komisi</Text>
            }
          />

          {/* Modal detail */}
          <Modal
            visible={!!selectedKomisi}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSelectedKomisi(null)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {selectedKomisi && (
                  <>
                    <Text style={styles.modalTitle}>Detail Komisi</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>ID Komisi:</Text>
                      <Text style={styles.detailValue}>
                        {selectedKomisi.ID_KOMISI}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Jenis:</Text>
                      <Text style={styles.detailValue}>
                        {selectedKomisi.JENIS_KOMISI}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Nominal:</Text>
                      <Text style={styles.detailValue}>
                        Rp
                        {selectedKomisi.NOMINAL_KOMISI.toLocaleString("id-ID")}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>ID Transaksi:</Text>
                      <Text style={styles.detailValue}>
                        {selectedKomisi.ID_TRANSAKSI_PEMBELIAN}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text style={styles.detailValue}>
                        {selectedKomisi.STATUS_BARANG}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tanggal:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedKomisi.created_at)}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.button}
                      onPress={() => setSelectedKomisi(null)}
                    >
                      <Text style={styles.buttonText}>Tutup</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          </Modal>
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
  phone: { fontSize: 14, color: Colors.GRAY, marginTop: 4 },
  komisi: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    color: Colors.SUCCESS,
  },
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
    marginBottom: 8,
  },
  kode: { fontSize: 16, fontWeight: "600", color: Colors.TEXT_DARK },
  error: { color: Colors.DANGER, textAlign: "center", marginTop: 20 },
  emptyText: { textAlign: "center", marginTop: 20, color: Colors.GRAY },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    padding: 20,
    borderRadius: 12,
    width: "90%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: Colors.TEXT_DARK,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: "600",
    color: Colors.TEXT_DARK,
    width: "40%",
  },
  detailValue: {
    flex: 1,
    color: Colors.TEXT_DARK,
    textAlign: "right",
  },
  button: {
    marginTop: 20,
    backgroundColor: Colors.BUTTON_PRIMARY,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.WHITE,
    fontWeight: "600",
    fontSize: 16,
  },
});
