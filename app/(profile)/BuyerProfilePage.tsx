import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Card, Divider } from "react-native-paper";
import Colors from "../../services/Colors";

import {
  fetchPesananDetail,
  fetchRiwayatPesanan,
  fetchUserProfile,
  Pesanan,
  PesananDetail,
  submitRatingBarang,
  UserProfile,
} from "../../api/pembeliApi";

export default function BuyerProfilePage() {
  // ==== Profil ====
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // ==== Riwayat Pesanan ====
  const [transactions, setTransactions] = useState<Pesanan[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [errorTx, setErrorTx] = useState("");

  // ==== Filter Tanggal ====
  const [startDate, setStartDate] = useState<Date>(new Date(0));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // ==== Modal Detail ====
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<PesananDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ratings, setRatings] = useState<Record<number, number>>({});

  useEffect(() => {
    loadProfile();
    loadRiwayat();
  }, []);

  // Load profil
  async function loadProfile() {
    setLoadingProfile(true);
    try {
      const me = await fetchUserProfile();
      setProfile(me);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProfile(false);
    }
  }

  // Load riwayat dengan filter tanggal
  async function loadRiwayat() {
    setLoadingTx(true);
    setErrorTx("");
    try {
      const list = await fetchRiwayatPesanan(startDate, endDate);
      setTransactions(list);
    } catch (e: any) {
      setErrorTx(e.message);
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  }

  // Modal detail
  const openDetailModal = async (id: number) => {
    setSelectedId(id);
    setDetailData(null);
    setLoadingDetail(true);
    try {
      const det = await fetchPesananDetail(id);
      setDetailData(det);
      // init ratings
      const init: Record<number, number> = {};
      det.items.forEach((i) => (init[i.id] = 0));
      setRatings(init);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };
  const closeDetailModal = () => {
    setSelectedId(null);
    setDetailData(null);
  };

  const handleSubmitRatings = async () => {
    if (!detailData) return;
    for (const item of detailData.items) {
      const value = ratings[item.id];
      if (value > 0) {
        await submitRatingBarang(item.id, value);
      }
    }
    alert("Rating berhasil dikirim");
    closeDetailModal();
  };

  // Render transaksi
  const renderTransaction = ({ item }: { item: Pesanan }) => (
    <Card style={styles.txCard}>
      <Card.Content>
        <View style={styles.txHeader}>
          <View>
            <Text style={styles.firstItemName}>{item.kode}</Text>
            <Text>{new Date(item.tanggal).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.txTotal}>
            Rp{item.total.toLocaleString()}
          </Text>
        </View>
        <Text>Status: {item.status_transaksi}</Text>
        <Divider style={{ marginVertical: 8 }} />
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => openDetailModal(item.id)}
        >
          <Text style={styles.detailButtonText}>Lihat Detail</Text>
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  // Render modal detail dengan header & sections
  const renderDetailModalContent = () => {
    if (loadingDetail) {
      return (
        <View style={styles.modalCenter}>
          <ActivityIndicator size="large" color={Colors.BUTTON_PRIMARY} />
          <Text style={{ marginTop: 8, color: Colors.GRAY }}>
            Memuat detail...
          </Text>
        </View>
      );
    }
    if (!detailData) return null;

    return (
      <>
        {/* Header Pesanan */}
        <Text style={styles.modalTitle}>
          Detail Pesanan #{detailData.id}
        </Text>
        <Divider style={{ marginVertical: 8 }} />

        <View style={styles.section}>
          <Text style={styles.label}>Kode Pesanan:</Text>
          <Text style={styles.value}>{detailData.kode}</Text>

          <Text style={styles.label}>Tanggal Pesanan:</Text>
          <Text style={styles.value}>
            {detailData.tanggal || "-"}
          </Text>

          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>
            {detailData.status_transaksi}
          </Text>

          <Text style={styles.label}>Total Harga:</Text>
          <Text style={styles.value}>
            Rp{detailData.total.toLocaleString()}
          </Text>
        </View>

        {/* Pengiriman & Pembayaran */}
        <Divider style={{ marginVertical: 8 }} />
        <Text style={styles.sectionTitle}>
          Informasi Pengiriman & Pembayaran
        </Text>
        <View style={styles.section}>
          <Text style={styles.label}>Metode Pengiriman:</Text>
          <Text style={styles.value}>
            {detailData.delivery_method || detailData.metode_pembayaran || "-"}
          </Text>
        </View>

        {/* Status & Poin */}
        <Divider style={{ marginVertical: 8 }} />
        <Text style={styles.sectionTitle}>
          Status Pembayaran & Poin
        </Text>
        <View style={styles.section}>
          <Text style={styles.label}>Status Bukti Transfer:</Text>
          <Text style={styles.value}>
            {detailData.status_bukti_transfer || "-"}
          </Text>

          <Text style={styles.label}>Poin Didapat:</Text>
          <Text style={styles.value}>
            {detailData.poin_didapat ?? 0}
          </Text>

          <Text style={styles.label}>Poin Potongan:</Text>
          <Text style={styles.value}>
            {detailData.poin_potongan ?? 0}
          </Text>
        </View>

        {/* Daftar Barang */}
        <Divider style={{ marginVertical: 8 }} />
        {detailData.items.length > 0 ? (
          detailData.items.map((d) => {
            const cur = ratings[d.id] || 0;
            return (
              <View key={d.id} style={styles.modalItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{d.nama_produk}</Text>
                  <Text style={styles.itemQtyPrice}>
                    {d.jumlah} × Rp{d.harga_satuan.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.ratingRow}>
                  {[1,2,3,4,5].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() =>
                        setRatings((p) => ({ ...p, [d.id]: s }))
                      }
                    >
                      <Text style={{ fontSize: 20 }}>
                        {s <= cur ? "★" : "☆"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })
        ) : (
          <Text style={{ textAlign: "center", color: Colors.GRAY }}>
            Tidak ada detail barang.
          </Text>
        )}

        {/* Submit Rating */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleSubmitRatings}
        >
          <Text style={styles.filterButtonText}>
            Kirim Rating
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profil */}
      <View style={styles.profileContainer}>
        {loadingProfile ? (
          <ActivityIndicator size="large" color={Colors.BUTTON_PRIMARY} />
        ) : profile ? (
          <>
            <Image
              source={require("../../assets/images/avatar_placeholder.png")}
              style={styles.avatar}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.nameText}>{profile.name}</Text>
              <Text style={styles.emailText}>{profile.email}</Text>
              <Text style={styles.pointText}>
                Poin Reward: {profile.point}
              </Text>
            </View>
          </>
        ) : (
          <Text>Profil tidak tersedia</Text>
        )}
      </View>

      {/* Filter Periode */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartPicker(true)}
        >
          <Text>Dari: {startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndPicker(true)}
        >
          <Text>Sampai: {endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={loadRiwayat}>
          <Text style={styles.applyButtonText}>Terapkan Filter</Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowStartPicker(false);
            date && setStartDate(date);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowEndPicker(false);
            date && setEndDate(date);
          }}
        />
      )}

      {/* Riwayat Pesanan */}
      {loadingTx ? (
        <ActivityIndicator size="large" color={Colors.BUTTON_PRIMARY} />
      ) : errorTx ? (
        <Text style={{ color: "red", textAlign: "center" }}>
          {errorTx}
        </Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(t) => t.id.toString()}
          renderItem={renderTransaction}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingBottom: 80, marginTop: 12 }}
        />
      )}

      {/* Modal Detail */}
      <Modal
        visible={selectedId !== null}
        animationType="slide"
        transparent
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              onPress={closeDetailModal}
              style={styles.modalCloseButton}
            >
              <Text style={{ fontSize: 18, color: Colors.GRAY }}>✕</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {renderDetailModalContent()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.WHITE },

  // Top Bar
  headerContainer: {
    height: 56,
    backgroundColor: Colors.BUTTON_PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: Colors.WHITE,
    fontSize: 20,
    fontWeight: "700",
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
    padding: 12,
    borderRadius: 12,
    elevation: 3,
    margin: 16,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.GRAY },
  nameText: { fontSize: 18, fontWeight: "700", color: Colors.TEXT_DARK },
  emailText: { fontSize: 14, color: Colors.GRAY, marginTop: 2 },
  pointText: { fontSize: 14, color: Colors.TEXT_DARK, marginTop: 4 },

  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
  },
  dateButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 6,
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: Colors.BUTTON_PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  applyButtonText: {
    color: Colors.WHITE,
    fontWeight: "600",
  },

  txCard: {
    borderRadius: 12,
    backgroundColor: Colors.WHITE,
    elevation: 2,
    padding: 12,
    marginHorizontal: 16,
  },
  txHeader: { flexDirection: "row", justifyContent: "space-between" },
  firstItemName: { fontSize: 16, fontWeight: "600", color: Colors.TEXT_DARK },
  txTotal: { fontSize: 16, fontWeight: "600", color: Colors.BUTTON_PRIMARY },
  detailButton: {
    marginTop: 8,
    alignSelf: "flex-end",
    backgroundColor: Colors.BUTTON_SECONDARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailButtonText: { color: Colors.WHITE, fontWeight: "600" },

  sectionTitle: { fontSize: 16, fontWeight: "600", color: Colors.TEXT_DARK },
  section: { marginVertical: 4 },
  label: { fontSize: 14, color: Colors.GRAY, marginTop: 4 },
  value: { fontSize: 15, fontWeight: "500", color: Colors.TEXT_DARK },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    maxHeight: "85%",
    overflow: "hidden",
  },
  modalCloseButton: { position: "absolute", top: 12, right: 12, zIndex: 10 },

  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  modalCenter: { justifyContent: "center", alignItems: "center", padding: 16 },

  modalItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  itemName: { fontWeight: "600", color: Colors.TEXT_DARK },
  itemQtyPrice: { color: Colors.GRAY },
  ratingRow: { flexDirection: "row", marginTop: 4 },

  filterButton: {
    marginTop: 16,
    backgroundColor: Colors.BUTTON_PRIMARY,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  filterButtonText: { color: Colors.TEXT_LIGHT, fontWeight: "600" },
});
