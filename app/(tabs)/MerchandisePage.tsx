// app/(tabs)/MerchandisePage.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";

const API_BASE_URL = "http://172.16.36.88:8000/api";

export type Merchandise = {
  ID_MERCHANDISE: number;
  NAMA_MERCHANDISE: string;
  POIN_DIBUTUHKAN: number;
  JUMLAH: number;
  GAMBAR: string | null;
};

export default function MerchandisePage() {
  const [merchandises, setMerchandises] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchandises = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await AsyncStorage.getItem("token");

        const response = await axios.get<Merchandise[]>(
          `${API_BASE_URL}/merchandises`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );

        if (response.status === 200) {
          setMerchandises(response.data);
        } else {
          throw new Error(`Unexpected status code: ${response.status}`);
        }
      } catch (err: any) {
        let errorMessage =
          "Failed to load merchandises. Please try again later.";

        if (err.response) {
          // Server responded with a status other than 2xx
          console.error("Server error:", err.response.data);
          errorMessage = `Server error: ${err.response.status}`;

          if (err.response.status === 500) {
            errorMessage =
              "Server is currently unavailable. Please try again later.";
          }
        } else if (err.request) {
          // Request was made but no response received
          console.error("No response received:", err.request);
          errorMessage =
            "No response from server. Check your network connection.";
        } else {
          // Something happened in setting up the request
          console.error("Request setup error:", err.message);
          errorMessage = "Request failed to setup.";
        }

        setError(errorMessage);
        Alert.alert("Error", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchandises();
  }, []);

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    useEffect(() => {
      const fetchMerchandises = async () => {
        try {
          const token = await AsyncStorage.getItem("token");

          const response = await axios.get<Merchandise[]>(
            `${API_BASE_URL}/merchandises`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            }
          );

          setMerchandises(response.data);
          setLoading(false);
        } catch (err) {
          console.error("Failed to fetch merchandises:", err);
          setError("Failed to load merchandises. Please try again later.");
          setLoading(false);
        }
      };

      fetchMerchandises();
    }, []);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading merchandises...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={retryFetch}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Merchandise Catalog</Text>

      {merchandises.length === 0 ? (
        <Text style={styles.emptyText}>No merchandises available</Text>
      ) : (
        <View style={styles.grid}>
          {merchandises.map((merch) => (
            <View key={merch.ID_MERCHANDISE} style={styles.card}>
              // Di MerchandisePage.tsx
              {merch.GAMBAR ? (
                <Image
                  source={{ uri: merch.GAMBAR }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={(e) =>
                    console.log("Image failed to load:", e.nativeEvent.error)
                  }
                />
              ) : (
                <View style={[styles.image, styles.noImage]}>
                  <Text>No Image</Text>
                </View>
              )}
              <Text style={styles.name}>{merch.NAMA_MERCHANDISE}</Text>
              <Text style={styles.points}>{merch.POIN_DIBUTUHKAN} points</Text>
              <Text style={styles.stock}>
                {merch.JUMLAH > 0 ? `Stock: ${merch.JUMLAH}` : "Out of stock"}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF7E2",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
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
});
