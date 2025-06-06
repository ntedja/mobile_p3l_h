import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "http://172.16.20.141:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Pasang interceptor untuk melihat header dan URL (opsional debugging)
api.interceptors.request.use((config) => {
  console.log("✉️ Request ke:", config.url);
  console.log("   → Header Authorization:", config.headers?.Authorization);
  return config;
});

(async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("Gagal membaca token dari AsyncStorage", e);
  }
})();

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  point: number;
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await api.get<UserProfile>("/user/profile");
  return response.data;
}

export interface TransactionDetail {
  ID_DETAIL_TRANSAKSI: number;
  JUMLAH: number;
  HARGA_SATUAN: number;
  barang: { NAMA_BARANG: string };
}

export interface TransactionItem {
  ID_TRANSAKSI_PEMBELIAN: number;
  TGL_PESAN_PEMBELIAN: string;
  TOT_HARGA_PEMBELIAN: number;
  STATUS_PEMBAYARAN: string;
  detail: TransactionDetail[];
}

export interface TransactionListResponse {
  data: TransactionItem[];
}

export async function fetchUserTransactions(
  startDate: string,
  endDate: string
): Promise<TransactionListResponse> {
  const response = await api.get<TransactionListResponse>(
    "/user/transactions",
    { params: { start_date: startDate, end_date: endDate } }
  );
  return response.data;
}
