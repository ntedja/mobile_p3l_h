import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Divider } from "react-native-paper";
import {
  fetchPenitipProfile,
  fetchRiwayatTitipan,
  PenitipProfile,
  Titipan,
} from "../../api/penitipApi";
import Colors from "../../services/Colors";

export default function PenitipProfilePage() {
  const [profile, setProfile] = useState<PenitipProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [titipans, setTitipans] = useState<Titipan[]>([]);
  const [loadingT, setLoadingT] = useState(false);
  const [errorT, setErrorT] = useState("");

  const [startDate, setStartDate] = useState<Date>(new Date(0));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadProfile();
    loadTitipan();
  }, []);

  async function loadProfile() {
    setLoadingProfile(true);
    try {
      const me = await fetchPenitipProfile();
      setProfile(me);
    } catch (e) {
      console.error("Error fetchPenitipProfile:", e);
    } finally {
      setLoadingProfile(false);
    }
  }

  async function loadTitipan() {
    setLoadingT(true);
    setErrorT("");
    try {
      const list = await fetchRiwayatTitipan(startDate, endDate);
      setTitipans(list);
    } catch (e: any) {
      setErrorT(e.message);
      setTitipans([]);
    } finally {
      setLoadingT(false);
    }
  }

  const renderTitipan = ({ item }: { item: Titipan }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.txHeader}>
          <View>
            <Text style={styles.kode}>{item.kode}</Text>
            <Text>{new Date(item.tanggal).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.nilai}>Rp{item.nilai.toLocaleString()}</Text>
        </View>
        <Text>Status: {item.status}</Text>
        <Divider style={{ marginVertical: 8 }} />
        <Text>Jumlah Barang: {item.jumlah}</Text>
        {/* daftar nama & harga satuan */}
        {item.items.map((it) => (
          <View
            key={it.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <Text style={{ fontWeight: "600" }}>{it.nama}</Text>
            <Text>
              {it.jumlah} × Rp{it.harga_satuan.toLocaleString()}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile Penitip</Text>
      </View>

      <View style={styles.profileContainer}>
        {loadingProfile ? (
          <ActivityIndicator size="large" color={Colors.BUTTON_PRIMARY} />
        ) : profile ? (
          <>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.email}>{profile.email}</Text>
            <Text style={styles.value}>
              Saldo: Rp{profile.saldo.toLocaleString()}
            </Text>
            <Text style={styles.value}>Poin: {profile.point}</Text>
          </>
        ) : (
          <Text>Profil tidak tersedia</Text>
        )}
      </View>

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
        <TouchableOpacity style={styles.applyButton} onPress={loadTitipan}>
          <Text style={styles.applyButtonText}>Terapkan</Text>
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

      {loadingT ? (
        <ActivityIndicator
          size="large"
          color={Colors.BUTTON_PRIMARY}
          style={{ marginTop: 20 }}
        />
      ) : errorT ? (
        <Text style={styles.error}>{errorT}</Text>
      ) : (
        <FlatList
          data={titipans}
          keyExtractor={(i) => i.id.toString()}
          renderItem={renderTitipan}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingBottom: 80, marginTop: 12 }}
        />
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

  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
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
  applyButtonText: { color: Colors.WHITE, fontWeight: "600" },

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

  error: { color: "red", textAlign: "center", marginTop: 20 },
});