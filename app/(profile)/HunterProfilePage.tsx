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
  const [error, setError] = useState("");
  const [selectedKomisi, setSelectedKomisi] = useState<KomisiDetail | null>(
    null
  );

  useEffect(() => {
    loadProfile();
    loadKomisi();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const idString = await AsyncStorage.getItem("pegawai_id");
      if (!idString) throw new Error("ID pegawai tidak ditemukan");
      const id = parseInt(idString, 10);

      const profileData = await fetchHunterProfile(id);
      setProfile(profileData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadKomisi = async () => {
    setLoading(true);
    try {
      const idString = await AsyncStorage.getItem("pegawai_id");
      if (!idString) throw new Error("ID pegawai tidak ditemukan");
      const id = parseInt(idString, 10);

      const komisiData = await fetchHunterKomisi(id);
      setKomisiList(komisiData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderKomisi = ({ item }: { item: KomisiDetail }) => (
    <Pressable onPress={() => setSelectedKomisi(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.kode}>ID Komisi: {item.ID_KOMISI}</Text>
          <Text>Jenis: {item.JENIS_KOMISI}</Text>
          <Text>Nominal: Rp{item.NOMINAL_KOMISI.toLocaleString()}</Text>
        </Card.Content>
      </Card>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil Hunter</Text>
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
                <Text style={styles.komisi}>
                  Total Komisi: Rp{profile.KOMISI_PEGAWAI.toLocaleString()}
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
                    <Text>ID: {selectedKomisi.ID_KOMISI}</Text>
                    <Text>Jenis: {selectedKomisi.JENIS_KOMISI}</Text>
                    <Text>
                      Nominal: Rp
                      {selectedKomisi.NOMINAL_KOMISI.toLocaleString()}
                    </Text>
                    <Text>
                      Transaksi Pembelian ID:{" "}
                      {selectedKomisi.ID_TRANSAKSI_PEMBELIAN}
                    </Text>
                    <Text>
                      Tanggal:{" "}
                      {new Date(selectedKomisi.created_at).toLocaleDateString()}
                    </Text>
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
  komisi: { fontSize: 16, fontWeight: "600", marginTop: 8 },
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
  kode: { fontSize: 16, fontWeight: "600", color: Colors.TEXT_DARK }, // 🔥 Tambahkan ini
  error: { color: "red", textAlign: "center", marginTop: 20 },
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
    width: "80%",
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  button: {
    marginTop: 16,
    backgroundColor: Colors.BUTTON_PRIMARY,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: Colors.WHITE, fontWeight: "600" },
});
