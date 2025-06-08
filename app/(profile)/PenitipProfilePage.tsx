import React, { FC, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card, Divider } from "react-native-paper";

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
      console.error("Error fetching profile", err);
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
      setErrorB(err.message || "Gagal memuat riwayat barang");
    } finally {
      setLoadingB(false);
    }
  };

  const renderItem = ({ item }: { item: BarangHistory }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.txHeader}>
          <View style={styles.txInfo}>
            <Text style={styles.itemName}>{item.nama}</Text>
            <Text style={styles.itemDate}>
              Masuk: {new Date(item.tgl_masuk).toLocaleDateString()}
            </Text>
            {item.tgl_keluar && (
              <Text style={styles.itemDate}>
                Keluar: {new Date(item.tgl_keluar).toLocaleDateString()}
              </Text>
            )}
          </View>
          <Text style={styles.itemPrice}>Rp{item.harga.toLocaleString()}</Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.statusRow}>
          <Text style={styles.itemStatus}>Status: <Text style={styles.statusText}>{item.status}</Text></Text>
          <Text style={styles.itemCategory}>{item.kategori}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile Penitip</Text>
      </View>

      <View style={styles.profileBox}>
        {loadingProfile ? (
          <ActivityIndicator size="large" color={Colors.BUTTON_PRIMARY} />
        ) : profile ? (
          <>
            <Image
                          source={require("../../assets/images/avatar_placeholder.png")}
                          style={styles.avatar}
                        />
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <View style={styles.valuesRow}>
              <View style={styles.valueBox}>
                <Text style={styles.valueLabel}>Saldo</Text>
                <Text style={styles.valueText}>Rp{profile.saldo.toLocaleString()}</Text>
              </View>
              <View style={styles.valueBox}>
                <Text style={styles.valueLabel}>Poin</Text>
                <Text style={styles.valueText}>{profile.point}</Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.errorText}>Profil tidak tersedia</Text>
        )}
      </View>

      {loadingB ? (
        <ActivityIndicator
          size="large"
          color={Colors.BUTTON_PRIMARY}
          style={styles.loader}
        />
      ) : errorB ? (
        <Text style={styles.errorText}>{errorB}</Text>
      ) : (
        <FlatList
          data={barangs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

export default PenitipProfilePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    height: 60,
    backgroundColor: Colors.BUTTON_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    color: Colors.WHITE,
    fontSize: 22,
    fontWeight: '700',
  },
  profileBox: {
    backgroundColor: Colors.WHITE,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: Colors.GRAY,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.TEXT_DARK,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.GRAY,
    marginBottom: 12,
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  valueBox: {
    alignItems: 'center',
    flex: 1,
  },
  valueLabel: {
    fontSize: 12,
    color: Colors.GRAY,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_DARK,
    marginTop: 2,
  },
  listContainer: {
    paddingBottom: 80,
    marginTop: 8,
  },
  separator: {
    height: 12,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.WHITE,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    padding: 12,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_DARK,
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.BUTTON_PRIMARY,
  },
  divider: {
    marginVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemStatus: {
    fontSize: 14,
  },
  statusText: {
    fontWeight: '600',
    color: Colors.BUTTON_SECONDARY,
  },
  itemCategory: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.GRAY,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
});