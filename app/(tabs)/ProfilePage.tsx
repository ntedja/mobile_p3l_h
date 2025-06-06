import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, Divider } from 'react-native-paper';
import {
  fetchUserProfile,
  fetchUserTransactions,
  TransactionItem,
  UserProfile,
} from '../../api/profileApi';
import Colors from '../../services/Colors';

export default function ProfilePage() {
  // === State Profil ===
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  // === State Riwayat Transaksi ===
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loadingTx, setLoadingTx] = useState<boolean>(false);
  const [errorTx, setErrorTx] = useState<string>("");

  // === State untuk Filter Tanggal ===
  const [startDate, setStartDate] = useState<Date>(new Date(0)); // default: 1970-01-01
  const [endDate, setEndDate] = useState<Date>(new Date());       // default: hari ini
  const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
  const [showEndPicker, setShowEndPicker] = useState<boolean>(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await fetchUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Gagal fetch profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const applyDateFilter = async () => {
    if (startDate > endDate) {
      alert('Tanggal mulai harus sebelum atau sama dengan tanggal selesai');
      return;
    }
    try {
      setLoadingTx(true);
      const startStr = startDate.toISOString().slice(0, 10);
      const endStr   = endDate.toISOString().slice(0, 10);
      const response = await fetchUserTransactions(startStr, endStr);
      setTransactions(response.data);
    } catch (error: any) {
      console.error('Gagal fetch transaksi:', error);
      setErrorTx(error.message);
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  };

  const onStartChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setStartDate(selectedDate);
  };

  const onEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) setEndDate(selectedDate);
  };

  const renderTransactionItem = ({ item }: { item: TransactionItem }) => {
    const itemCount = Array.isArray(item.detail) ? item.detail.length : 0;
    return (
      <Card style={styles.txCard}>
        <Card.Content>
          <View style={styles.txHeader}>
            <Text style={styles.txDate}>
              {new Date(item.TGL_PESAN_PEMBELIAN).toLocaleDateString()}
            </Text>
            <Text style={styles.txTotal}>
              Rp{item.TOT_HARGA_PEMBELIAN.toLocaleString()}
            </Text>
          </View>
          <Text style={styles.txStatus}>
            Status: {item.STATUS_PEMBAYARAN}
          </Text>
          <Divider style={styles.txDivider} />
          <Text style={styles.txItemCount}>
            Jumlah Item: {itemCount}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.profileContainer}>
              {loadingProfile ? (
                <ActivityIndicator size="large" color={Colors.BUTTON_PRIMARY} />
              ) : (
                profile && (
                  <View style={styles.profileInfo}>
                    <Image
                      source={require('../../assets/images/avatar_placeholder.png')}
                      style={styles.avatar}
                    />
                    <View style={styles.profileText}>
                      <Text style={styles.nameText}>{profile.name}</Text>
                      <Text style={styles.emailText}>{profile.email}</Text>
                      <View style={styles.pointWrapper}>
                        <Text style={styles.pointLabel}>Poin Reward:</Text>
                        <Text style={styles.pointValue}>{profile.point}</Text>
                      </View>
                    </View>
                  </View>
                )
              )}
            </View>

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
                >
                  {loadingTx ? (
                    <ActivityIndicator color={Colors.TEXT_LIGHT} />
                  ) : (
                    <Text style={styles.filterButtonText}>
                      Terapkan Filter
                    </Text>
                  )}
                </TouchableOpacity>
              </Card.Content>
            </Card>

            <Text style={{ marginHorizontal: 16, fontSize: 14, color: '#555' }}>
              Jumlah transaksi: {transactions.length}
            </Text>

            <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
            {loadingTx && transactions.length === 0 && (
              <ActivityIndicator size="small" color={Colors.BUTTON_PRIMARY} />
            )}
            {!loadingTx && errorTx.length > 0 && (
              <Text style={styles.errorText}>Error: {errorTx}</Text>
            )}
            {!loadingTx && transactions.length === 0 && (
              <Text style={styles.noDataText}>
                Belum ada transaksi di periode ini.
              </Text>
            )}
          </>
        }
        data={transactions}
        keyExtractor={(item) =>
          item.ID_TRANSAKSI_PEMBELIAN.toString()
        }
        renderItem={renderTransactionItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // === Profil Section ===
  profileContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.GRAY,
  },
  profileText: {
    marginLeft: 16,
    flex: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.TEXT_DARK,
  },
  emailText: {
    fontSize: 14,
    color: Colors.GRAY,
    marginTop: 4,
  },
  pointWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  pointLabel: {
    fontSize: 14,
    color: Colors.TEXT_DARK,
    marginRight: 4,
  },
  pointValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BUTTON_PRIMARY,
  },

  // === Filter Section ===
  filterCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: Colors.WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.TEXT_DARK,
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  dateInputText: {
    fontSize: 14,
    color: Colors.TEXT_DARK,
  },
  filterButton: {
    marginTop: 16,
    backgroundColor: Colors.BUTTON_PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonText: {
    color: Colors.TEXT_LIGHT,
    fontSize: 14,
    fontWeight: '600',
  },

  // === Section Title & Pesan ===
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 12,
    color: Colors.TEXT_DARK,
  },
  noDataText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: Colors.GRAY,
    marginBottom: 16,
  },
  errorText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: 'red',
    marginBottom: 16,
  },

  // === Transaction Items ===
  txCard: {
    borderRadius: 12,
    backgroundColor: Colors.WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txDate: {
    fontSize: 14,
    color: Colors.GRAY,
  },
  txTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BUTTON_PRIMARY,
  },
  txStatus: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.TEXT_DARK,
  },
  txDivider: {
    marginVertical: 8,
    backgroundColor: Colors.GRAY + '33',
  },
  txItemCount: {
    fontSize: 14,
    color: Colors.GRAY,
    marginTop: 4,
  },
});
