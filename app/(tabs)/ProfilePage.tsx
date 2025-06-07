// app/(tabs)/ProfilePage.tsx

import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Divider } from "react-native-paper";
import {
  fetchTransactionDetail,
  fetchUserProfile,
  fetchUserTransactions,
  TransactionDetailResponse,
  TransactionItem,
  UserProfile
} from "../../api/profileApi";
import Colors from "../../services/Colors";

/**
 * ProfilePage:
 * - Menampilkan data profil
 * - Form filter tanggal untuk memfetch daftar transaksi
 * - Daftar transaksi (FlatList), tapi di dalam card pertama kali kita tampilkan
 *   NAMA_BARANG dari detailTransaksiPembelians[0] (jika ada).
 * - Setiap card punya tombol “Lihat Detail” → membuka modal, menampilkan daftar lengkap detail tiap barang.
 */
export default function ProfilePage() {
  // ==== State Profil ====
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  // ==== State Daftar Transaksi ====
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loadingTx, setLoadingTx] = useState<boolean>(false);
  const [errorTx, setErrorTx] = useState<string>("");

  // ==== Filter Tanggal ====
  const [startDate, setStartDate] = useState<Date>(new Date(0)); // 1970‐01‐01
  const [endDate, setEndDate] = useState<Date>(new Date());     // hari ini
  const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
  const [showEndPicker, setShowEndPicker] = useState<boolean>(false);

  // ==== State Modal Detail ====
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [errorDetail, setErrorDetail] = useState<string>("");
  const [detailData, setDetailData] = useState<TransactionDetailResponse | null>(null);
  // ratings: misal kita ingin menyimpan rating utk tiap detail item
  const [ratings, setRatings] = useState<Record<number, number>>({});

  // ==== useEffect: load profil sekali pada mount ====
  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoadingProfile(true);
      const data = await fetchUserProfile();
      setProfile(data);
    } catch (err) {
      console.error("Gagal fetch profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  }

  // ==== Ambil daftar transaksi berdasarkan filter tanggal ====
  const applyDateFilter = async () => {
    if (startDate > endDate) {
      alert("Tanggal mulai harus sebelum atau sama dengan tanggal selesai");
      return;
    }
    try {
      setLoadingTx(true);
      setErrorTx("");
      const startStr = startDate.toISOString().slice(0, 10);
      const endStr = endDate.toISOString().slice(0, 10);
      const resp = await fetchUserTransactions(startStr, endStr);
      setTransactions(resp.data);
    } catch (err: any) {
      console.error("Gagal fetch transaksi:", err);
      setErrorTx(err.message || "Terjadi kesalahan saat memuat transaksi");
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  };

  // ==== Handler date picker ====
  const onStartChange = (event: any, selectedDate?: Date) => {
    // Jika di iOS, biarkan datepicker tetap muncul, kalau di Android, langsung sembunyikan
    setShowStartPicker(Platform.OS === "ios");
    if (selectedDate) setStartDate(selectedDate);
  };
  const onEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === "ios");
    if (selectedDate) setEndDate(selectedDate);
  };

  // ==== Buka modal detail transaksi & fetch detail lewat API ====
  const openDetailModal = async (id: number) => {
    setSelectedId(id);
    setDetailData(null);
    setErrorDetail("");
    setLoadingDetail(true);
    try {
      const detail = await fetchTransactionDetail(id);
      setDetailData(detail);

      // Inisialisasi rating (default 0) utk tiap detail item
      const initialRatings: Record<number, number> = {};
      if (Array.isArray(detail.detailTransaksiPembelians)) {
        detail.detailTransaksiPembelians.forEach((d) => {
          initialRatings[d.ID_DETAIL_TRANSAKSI] = 0;
        });
      }
      setRatings(initialRatings);
    } catch (err: any) {
      console.error("Gagal fetch detail transaksi:", err);
      setErrorDetail(err.message || "Gagal mengambil detail transaksi");
    } finally {
      setLoadingDetail(false);
    }
  };

  // ==== Tutup modal detail ====
  const closeDetailModal = () => {
    setSelectedId(null);
    setDetailData(null);
    setErrorDetail("");
  };

  // ==== Render satu kartu transaksi untuk FlatList ====
  const renderTransactionItem = ({ item }: { item: TransactionItem }) => {
    // Jika ada setidaknya satu detail, ambil nama barang pertama
    const firstItemName =
      Array.isArray(item.detailTransaksiPembelians) &&
      item.detailTransaksiPembelians.length > 0
        ? item.detailTransaksiPembelians[0].barang.NAMA_BARANG
        : "—"; // jika tidak ada detail, tampilkan “—”

    // jumlah barang total (bila mau ditampilkan juga)
    const totalItemsCount = Array.isArray(item.detailTransaksiPembelians)
      ? item.detailTransaksiPembelians.length
      : 0;

    return (
      <Card style={styles.txCard}>
        <Card.Content>
          {/* Baris pertama: nama barang pertama (jika ada), beserta tanggal & total */}
          <View style={styles.txHeader}>
            <View>
              <Text style={styles.firstItemName}>{firstItemName}</Text>
              <Text style={styles.txDate}>
                {new Date(item.TGL_PESAN_PEMBELIAN).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.txTotal}>
              Rp{item.TOT_HARGA_PEMBELIAN.toLocaleString()}
            </Text>
          </View>

          {/* Status pembayaran */}
          <Text style={styles.txStatus}>Status: {item.STATUS_PEMBAYARAN}</Text>

          {/* Divider */}
          <Divider style={styles.txDivider} />

          {/* (Opsional) Jumlah total item */}
          <Text style={styles.txItemCount}>Jumlah Item: {totalItemsCount}</Text>

          {/* Tombol “Lihat Detail” */}
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => openDetailModal(item.ID_TRANSAKSI_PEMBELIAN)}
          >
            <Text style={styles.detailButtonText}>Lihat Detail</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    );
  };

  // ==== Konten modal detail: daftar semua barang, quantity, harga, subtotal, rating ★/☆ ====
  const renderDetailModalContent = () => {
    if (loadingDetail) {
      return (
        <View style={styles.modalCenter}>
          <ActivityIndicator size="large" color={Colors.BUTTON_PRIMARY} />
          <Text style={{ marginTop: 8, color: Colors.GRAY }}>Memuat detail...</Text>
        </View>
      );
    }

    if (errorDetail) {
      return (
        <View style={styles.modalCenter}>
          <Text style={{ color: "red", fontWeight: "600" }}>{errorDetail}</Text>
        </View>
      );
    }

    if (!detailData) {
      return null; // tidak menampilkan apa‐apa jika belum ada data
    }

    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* --- Header Transaksi di Modal --- */}
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.modalTitle}>
            Detail Transaksi #{detailData.ID_TRANSAKSI_PEMBELIAN}
          </Text>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Tanggal:</Text>
            <Text style={styles.modalValue}>
              {new Date(detailData.TGL_PESAN_PEMBELIAN).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Total:</Text>
            <Text style={styles.modalValue}>
              Rp{detailData.TOT_HARGA_PEMBELIAN.toLocaleString()}
            </Text>
          </View>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Status:</Text>
            <Text style={[styles.modalValue, { fontWeight: "600" }]}>
              {detailData.STATUS_PEMBAYARAN}
            </Text>
          </View>
        </View>

        <Divider />

        {/* --- List Barang di dalam transaksi --- */}
        <Text style={[styles.modalSubTitle, { marginTop: 12 }]}>Daftar Barang:</Text>
        {Array.isArray(detailData.detailTransaksiPembelians) &&
        detailData.detailTransaksiPembelians.length > 0 ? (
          detailData.detailTransaksiPembelians.map((d) => {
            const subtotal = d.JUMLAH * d.HARGA_SATUAN;
            const currentRating = ratings[d.ID_DETAIL_TRANSAKSI] || 0;
            return (
              <View key={d.ID_DETAIL_TRANSAKSI} style={styles.modalItemRow}>
                {/* Kolom kiri: Nama barang + qty × harga */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{d.barang.NAMA_BARANG}</Text>
                  <Text style={styles.itemQtyPrice}>
                    {d.JUMLAH} × Rp{d.HARGA_SATUAN.toLocaleString()}
                  </Text>
                </View>
                {/* Kolom kanan: Subtotal + rating */}
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.itemSubtotal}>
                    Rp{subtotal.toLocaleString()}
                  </Text>
                  {/* Rating bintang sederhana (★/☆) */}
                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filled = star <= currentRating;
                      return (
                        <TouchableOpacity
                          key={star}
                          onPress={() =>
                            setRatings((prev) => ({
                              ...prev,
                              [d.ID_DETAIL_TRANSAKSI]: star,
                            }))
                          }
                          style={{ marginHorizontal: 2 }}
                        >
                          <Text
                            style={{
                              fontSize: 20,
                              color: filled ? "#FBBF24" : "#D1D5DB",
                            }}
                          >
                            {filled ? "★" : "☆"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={{ textAlign: "center", color: Colors.GRAY, marginTop: 8 }}>
            Tidak ada detail barang.
          </Text>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ===== Bagian Filter & Daftar Transaksi ===== */}
      <View style={styles.container}>
        {/* === Header Profil === */}
        <View style={styles.profileContainer}>
          {loadingProfile ? (
            <ActivityIndicator size="large" color={Colors.BUTTON_PRIMARY} />
          ) : profile ? (
            <>
              <Image
                source={require("../../assets/images/avatar_placeholder.png")}
                style={styles.avatar}
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.nameText}>{profile.name}</Text>
                <Text style={styles.emailText}>{profile.email}</Text>
                <Text style={styles.pointText}>Poin Reward: {profile.point}</Text>
              </View>
            </>
          ) : (
            <Text style={{ color: Colors.GRAY }}>Profil tidak tersedia</Text>
          )}
        </View>

        {/* === Filter Tanggal === */}
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text style={styles.filterTitle}>Filter Riwayat Transaksi</Text>
            <View style={styles.datePickerRow}>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={styles.dateInput}
              >
                <Text style={styles.dateInputText}>
                  Dari: {startDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={styles.dateInput}
              >
                <Text style={styles.dateInputText}>
                  Sampai: {endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onStartChange}
                maximumDate={new Date()}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onEndChange}
                maximumDate={new Date()}
              />
            )}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={applyDateFilter}
              disabled={loadingTx}
            >
              {loadingTx ? (
                <ActivityIndicator color={Colors.TEXT_LIGHT} />
              ) : (
                <Text style={styles.filterButtonText}>Terapkan Filter</Text>
              )}
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {errorTx.length > 0 && (
          <Text style={{ color: "red", marginVertical: 4, textAlign: "center" }}>
            {errorTx}
          </Text>
        )}

        <Text style={styles.listTitle}>Riwayat Transaksi ({transactions.length})</Text>

        {loadingTx && transactions.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.BUTTON_PRIMARY} />
        ) : transactions.length === 0 ? (
          <Text style={{ textAlign: "center", color: Colors.GRAY, marginTop: 20 }}>
            Belum ada transaksi di periode ini.
          </Text>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.ID_TRANSAKSI_PEMBELIAN.toString()}
            renderItem={renderTransactionItem}
            contentContainerStyle={{ paddingBottom: 80 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            style={{ marginTop: 8 }}
          />
        )}
      </View>

      {/* ===== Modal untuk Detail Transaksi ===== */}
      <Modal
        visible={selectedId !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            {/* Tombol Tutup */}
            <TouchableOpacity onPress={closeDetailModal} style={styles.modalCloseButton}>
              <Text style={{ fontSize: 18, color: Colors.GRAY }}>✕</Text>
            </TouchableOpacity>

            {/* Isi Modal */}
            {renderDetailModalContent()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flex: 1,
  },

  // ==== Header Profil ====
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.GRAY,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.TEXT_DARK,
  },
  emailText: {
    fontSize: 14,
    color: Colors.GRAY,
    marginTop: 2,
  },
  pointText: {
    fontSize: 13,
    color: Colors.TEXT_DARK,
    marginTop: 4,
  },

  // ==== Filter Tanggal ====
  filterCard: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: Colors.WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.TEXT_DARK,
  },
  datePickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInput: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  dateInputText: {
    fontSize: 14,
    color: Colors.TEXT_DARK,
  },
  filterButton: {
    marginTop: 12,
    backgroundColor: Colors.BUTTON_PRIMARY,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  filterButtonText: {
    color: Colors.TEXT_LIGHT,
    fontSize: 14,
    fontWeight: "600",
  },

  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    color: Colors.TEXT_DARK,
  },

  // ==== Item Transaksi (Daftar) ====
  txCard: {
    borderRadius: 12,
    backgroundColor: Colors.WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    padding: 12,
  },
  txHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  firstItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.TEXT_DARK,
    marginBottom: 2,
  },
  txDate: {
    fontSize: 13,
    color: Colors.GRAY,
  },
  txTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.BUTTON_PRIMARY,
  },
  txStatus: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.TEXT_DARK,
  },
  txDivider: {
    marginVertical: 8,
    backgroundColor: Colors.GRAY + "33",
  },
  txItemCount: {
    fontSize: 14,
    color: Colors.GRAY,
    marginTop: 4,
  },
  detailButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    backgroundColor: Colors.BUTTON_SECONDARY, 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailButtonText: {
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: "600",
  },

  // ==== Modal Background & Card ====
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
    padding: 16,
  },
  modalCloseButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  modalCenter: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },

  // ==== Konten Modal ====
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.TEXT_DARK,
    marginBottom: 8,
  },
  modalSubTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.TEXT_DARK,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  modalLabel: {
    fontSize: 14,
    color: Colors.GRAY,
  },
  modalValue: {
    fontSize: 14,
    color: Colors.TEXT_DARK,
  },
  modalItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 12,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.GRAY + "33",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.TEXT_DARK,
  },
  itemQtyPrice: {
    fontSize: 13,
    color: Colors.GRAY,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.BUTTON_PRIMARY,
  },
  ratingRow: {
    flexDirection: "row",
    marginTop: 6,
  },
});
