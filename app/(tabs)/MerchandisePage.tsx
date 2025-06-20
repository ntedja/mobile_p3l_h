import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE_URL = "http://172.16.49.37:8000/api";

export type Merchandise = {
  ID_MERCHANDISE: number;
  NAMA_MERCHANDISE: string;
  POIN_DIBUTUHKAN: number;
  JUMLAH: number;
  GAMBAR: string | null;
};

interface PembeliData {
  ID_PEMBELI: string;
  NAMA_PEMBELI: string;
  POINT_LOYALITAS_PEMBELI: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface KlaimMerchandiseResponse {
  ID_KLAIM: number;
  ID_MERCHANDISE: number;
  ID_PEMBELI: string;
  TGL_KLAIM: string;
  TGL_PENGAMBILAN: string | null;
  merchandise: Merchandise;
}

export default function MerchandisePage() {
  const router = useRouter();
  const [merchandises, setMerchandises] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    id?: string;
    role?: string;
    points?: number;
  }>({});
  const [claimHistory, setClaimHistory] = useState<KlaimMerchandiseResponse[]>(
    []
  );
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");
      setIsLoggedIn(!!token);

      if (token && role === "pembeli") {
        const userResponse = await axios.get<ApiResponse<PembeliData>>(
          `${API_BASE_URL}/pembeli/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (userResponse.data.success && userResponse.data.data) {
          const pembeliData = userResponse.data.data;
          setUserData({
            id: pembeliData.ID_PEMBELI,
            role,
            points: pembeliData.POINT_LOYALITAS_PEMBELI,
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return false;
    }
  };

  const fetchMerchandises = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await axios.get<ApiResponse<Merchandise[]>>(
        `${API_BASE_URL}/merchandises`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMerchandises(response.data.data);
      } else {
        console.error("Failed to fetch merchandises:", response.data.message);
      }
    } catch (error) {
      if (!(axios.isAxiosError(error) && error.response?.status === 401)) {
        console.error("Failed to fetch merchandises:", error);
      }
    }
  };

  const fetchClaimHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");
      if (!token || role !== "pembeli" || !userData.id) return;

      const response = await axios.get<KlaimMerchandiseResponse[]>(
        `${API_BASE_URL}/klaim-merchandise`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { ID_PEMBELI: userData.id },
        }
      );

      setClaimHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch claim history:", error);
      if (error instanceof AxiosError) {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to load claim history"
        );
      }
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userDataLoaded = await fetchUserData();

      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");

      if (token && role === "pembeli" && userDataLoaded) {
        await Promise.all([fetchMerchandises(), fetchClaimHistory()]);
      }
    } catch (err) {
      if (!(axios.isAxiosError(err) && err.response?.status === 401)) {
        setError("Failed to load data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const userDataLoaded = await fetchUserData();
      if (userDataLoaded) {
        await Promise.all([fetchMerchandises(), fetchClaimHistory()]);
      }
      setLoading(false);
    };

    initializeData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [userData.id])
  );

  const retryFetch = async () => {
    try {
      setError(null);
      setLoading(true);
      await fetchData();
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. Please try again later.");
      setLoading(false);
    }
  };

  const handleClaimMerchandise = async (merchandise: Merchandise) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");

      if (!token || role !== "pembeli") {
        Alert.alert(
          "Login Required",
          "You need to login as a buyer to claim merchandise",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Login", onPress: () => router.push("/login") },
          ]
        );
        return;
      }

      if (merchandise.JUMLAH <= 0) {
        Alert.alert(
          "Out of Stock",
          "This merchandise is currently out of stock"
        );
        return;
      }

      if (
        userData.points === undefined ||
        userData.points < merchandise.POIN_DIBUTUHKAN
      ) {
        Alert.alert(
          "Point Tidak Cukup",
          `Kamu harus memiliki ${merchandise.POIN_DIBUTUHKAN} point untuk klaim merchandise ini. Kamu memiliki ${userData.points} point.`
        );
        return;
      }

      Alert.alert(
        "Konfrimasi Klaim",
        `Apa kamu yakin ingin mengklaim merchandise ${merchandise.NAMA_MERCHANDISE} dengan ${merchandise.POIN_DIBUTUHKAN} point?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Claim",
            onPress: async () => {
              try {
                setIsClaiming(true);
                const response = await axios.post<KlaimMerchandiseResponse>(
                  `${API_BASE_URL}/klaim-merchandise`,
                  {
                    ID_MERCHANDISE: merchandise.ID_MERCHANDISE,
                    ID_PEMBELI: userData.id,
                    TGL_KLAIM: new Date().toISOString().split("T")[0],
                  },
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );

                if (response.status === 201) {
                  Alert.alert(
                    "Berhasil!",
                    `Kamu berhasil klaim merchandise ${merchandise.NAMA_MERCHANDISE}!`
                  );
                  await fetchData();
                }
              } catch (error) {
                console.error("Claim error:", error);
                let errorMessage = "Failed to claim merchandise";
                if (error instanceof AxiosError) {
                  errorMessage = error.response?.data?.message || errorMessage;
                }
                Alert.alert("Error", errorMessage);
              } finally {
                setIsClaiming(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error in handleClaimMerchandise:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.notLoggedInContainer}>
        <Text style={styles.notLoggedInText}>
          Anda belum login. Silakan login untuk melihat merchandise.
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={retryFetch}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Merchandise Catalog</Text>

        {userData.role === "pembeli" && (
          <Text style={styles.pointsText}>
            Your Points: {userData.points || 0}
          </Text>
        )}

        {merchandises.length === 0 ? (
          <Text style={styles.emptyText}>No merchandises available</Text>
        ) : (
          <View style={styles.grid}>
            {merchandises.map((merch) => (
              <TouchableOpacity
                key={merch.ID_MERCHANDISE}
                style={styles.card}
                onPress={() => !isClaiming && handleClaimMerchandise(merch)}
                activeOpacity={0.7}
                disabled={isClaiming}
              >
                {merch.GAMBAR ? (
                  <Image
                    source={{ uri: merch.GAMBAR }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.image, styles.noImage]}>
                    <Text>No Image</Text>
                  </View>
                )}
                <Text style={styles.name}>{merch.NAMA_MERCHANDISE}</Text>
                <Text style={styles.points}>
                  {merch.POIN_DIBUTUHKAN} points
                </Text>
                <Text style={styles.stock}>
                  {merch.JUMLAH > 0 ? `Stock: ${merch.JUMLAH}` : "Out of stock"}
                </Text>
                {isClaiming ? (
                  <ActivityIndicator size="small" color="#4CAF50" />
                ) : userData.role === "pembeli" ? (
                  <Text
                    style={[
                      styles.claimText,
                      (userData.points || 0) >= merch.POIN_DIBUTUHKAN &&
                      merch.JUMLAH > 0
                        ? styles.claimable
                        : styles.notClaimable,
                    ]}
                  >
                    {(userData.points || 0) >= merch.POIN_DIBUTUHKAN &&
                    merch.JUMLAH > 0
                      ? "Tap untuk Klaim"
                      : "Tidak bisa Klaim"}
                  </Text>
                ) : (
                  <Text style={[styles.claimText, styles.notClaimable]}>
                    Login to Claim
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {userData.role === "pembeli" && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setHistoryModalVisible(true)}
          activeOpacity={0.7}
          disabled={isClaiming}
        >
          <Ionicons name="time-outline" size={24} color="white" />
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Claim History</Text>
            <ScrollView>
              {claimHistory.length === 0 ? (
                <Text style={styles.emptyText}>No claim history available</Text>
              ) : (
                <View style={styles.historyGrid}>
                  {claimHistory.map((claim) => (
                    <View key={claim.ID_KLAIM} style={styles.historyCard}>
                      {claim.merchandise.GAMBAR ? (
                        <Image
                          source={{ uri: claim.merchandise.GAMBAR }}
                          style={styles.historyImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.historyImage, styles.noImage]}>
                          <Text>No Image</Text>
                        </View>
                      )}
                      <Text style={styles.historyName}>
                        {claim.merchandise.NAMA_MERCHANDISE}
                      </Text>
                      <Text style={styles.historyDate}>
                        Claimed: {formatDate(claim.TGL_KLAIM)}
                      </Text>
                      <Text
                        style={[
                          styles.historyStatus,
                          claim.TGL_PENGAMBILAN
                            ? styles.statusPicked
                            : styles.statusNotPicked,
                        ]}
                      >
                        {claim.TGL_PENGAMBILAN
                          ? "Sudah Diambil"
                          : "Belum Diambil"}
                      </Text>
                      {claim.TGL_PENGAMBILAN && (
                        <Text style={styles.historyPickedDate}>
                          Diambil: {formatDate(claim.TGL_PENGAMBILAN)}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setHistoryModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF7E2",
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF7E2",
  },
  notLoggedInText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#4CAF50",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 6,
    marginBottom: 8,
  },
  noImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  points: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "500",
    marginBottom: 4,
  },
  stock: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  claimText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  claimable: {
    backgroundColor: "#4CAF50",
    color: "white",
  },
  notClaimable: {
    backgroundColor: "#9E9E9E",
    color: "white",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  retryText: {
    color: "blue",
    textAlign: "center",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  historyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  historyCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyImage: {
    width: "100%",
    height: 100,
    borderRadius: 6,
    marginBottom: 8,
  },
  historyName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusPicked: {
    backgroundColor: "#4CAF50",
    color: "white",
  },
  statusNotPicked: {
    backgroundColor: "#F44336",
    color: "white",
  },
  historyPickedDate: {
    fontSize: 12,
    color: "#666",
  },
  closeButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
