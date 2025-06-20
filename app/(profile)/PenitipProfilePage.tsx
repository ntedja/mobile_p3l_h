import React, { FC, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  Appbar,
  Avatar,
  Card,
  Divider,
  List
} from "react-native-paper";

import {
  BarangHistory,
  fetchPenitipProfile,
  fetchRiwayatBarangs,
  PenitipProfile,
} from "../../api/penitipApi";
import Colors from "../../services/Colors";

const PenitipProfilePage: FC = () => {
  const [profile, setProfile] = useState<PenitipProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [barangs, setBarangs] = useState<BarangHistory[]>([]);
  const [loadingB, setLoadingB] = useState(false);
  const [errorB, setErrorB] = useState("");

  useEffect(() => {
    loadProfile();
    loadBarangHistory();
  }, []);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const me = await fetchPenitipProfile();
      setProfile(me);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadBarangHistory = async () => {
    setLoadingB(true);
    setErrorB("");
    try {
      const list = await fetchRiwayatBarangs();
      setBarangs(list);
    } catch (err: any) {
      setErrorB(err.message);
    } finally {
      setLoadingB(false);
    }
  };

  const renderItem = ({ item }: { item: BarangHistory }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemContainer}>
        <List.Icon icon="package-variant" color={Colors.BUTTON_PRIMARY} />
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.nama}</Text>
          <Text style={styles.itemSub}>{`Masuk: ${new Date(
            item.tgl_masuk
          ).toLocaleDateString()}`}</Text>
          {item.tgl_keluar && (
            <Text style={styles.itemSub}>{`Keluar: ${new Date(
              item.tgl_keluar
            ).toLocaleDateString()}`}</Text>
          )}
          <Text style={styles.itemStatus}>{`Status: ${item.status}`}</Text>
          <Text style={styles.itemCategory}>{`Kategori: ${item.kategori}`}</Text>
        </View>
        <Text style={styles.itemPrice}>Rp{item.harga.toLocaleString()}</Text>
      </View>
      <Divider />
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => {}} />
        <Appbar.Content title="Profil Penitip" />
      </Appbar.Header>

      <View style={styles.profileSection}>
        {loadingProfile ? (
          <ActivityIndicator size="large" color={Colors.BUTTON_PRIMARY} />
        ) : profile ? (
          <Card style={styles.profileCard}>
            <Card.Title
              title={profile?.name ?? "-"}
              subtitle={profile?.email ?? "-"}
              left={(props) => (
                <Avatar.Text {...props} label={profile?.name?.charAt(0) ?? "?"} />
              )}
            />
            <Card.Content style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Saldo</Text>
                <Text style={styles.statValue}>Rp{profile.saldo.toLocaleString()}</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Poin</Text>
                <Text style={styles.statValue}>{profile.point}</Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Text style={styles.error}>Profil tidak tersedia</Text>
        )}
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Riwayat Barang Titipan</Text>
        {loadingB ? (
          <ActivityIndicator size="large" color={Colors.BUTTON_PRIMARY} />
        ) : errorB ? (
          <Text style={styles.error}>{errorB}</Text>
        ) : (
          <FlatList
            data={barangs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default PenitipProfilePage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F2F5" },
  appbar: { backgroundColor: Colors.BUTTON_PRIMARY },
  profileSection: { padding: 16 },
  profileCard: { elevation: 3, borderRadius: 12 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
  statBlock: { alignItems: "center" },
  statLabel: { fontSize: 12, color: Colors.GRAY },
  statValue: { fontSize: 16, fontWeight: "600", color: Colors.TEXT_DARK },
  listSection: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  listContainer: { paddingBottom: 24 },

  itemCard: { marginVertical: 6, borderRadius: 10, overflow: "hidden" },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  itemContent: { flex: 1, marginLeft: 8 },
  itemTitle: { fontSize: 16, fontWeight: "600", color: Colors.TEXT_DARK },
  itemSub: { fontSize: 12, color: Colors.GRAY, marginTop: 2 },
  itemStatus: { fontSize: 12, marginTop: 4 },
  itemCategory: { fontSize: 12, fontStyle: "italic", marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: "700", color: Colors.BUTTON_PRIMARY },
  actions: { justifyContent: "flex-end", padding: 8 },

  error: { color: "#D32F2F", textAlign: "center", marginTop: 20 },
});
