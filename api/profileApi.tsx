// api/profileApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Ganti dengan IP/port backend Laravel Anda
const API_BASE_URL = "http://192.168.100.93:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Saat modul pertama kali di‐import, ambil token (jika ada) dari AsyncStorage
(async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      api.defaults.headers.common.Accept = "application/json";
    }
  } catch (e) {
    console.warn("Gagal membaca token dari AsyncStorage", e);
  }
})();

/**
 * Interface data profil user yang backend kembalikan:
 * {
 *   id: number,
 *   name: string,
 *   email: string,
 *   point: number
 * }
 */
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  point: number;
}

/**
 * Fetch data profil user:
 * GET /api/user/profile
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await api.get<UserProfile>("/user/profile");
  return response.data;
}

/**
 * Interface TransactionDetail: satu detail baris di dalam transaksi
 * Field‐field ini wajib sama persis dengan JSON:
 * - ID_DETAIL_TRANSAKSI   (primary key detail)
 * - JUMLAH
 * - HARGA_SATUAN
 * - barang: { NAMA_BARANG: string, … }
 */
export interface TransactionDetail {
  ID_DETAIL_TRANSAKSI: number;
  JUMLAH: number;
  HARGA_SATUAN: number;
  barang: {
    NAMA_BARANG: string;
    // jika butuh kolom tambahan misalnya ID_BARANG, tambahkan di sini
  };
}

/**
 * Interface TransactionItem: satu entri transaksi (list view)
 * - ID_TRANSAKSI_PEMBELIAN
 * - TGL_PESAN_PEMBELIAN
 * - TOT_HARGA_PEMBELIAN
 * - STATUS_PEMBAYARAN
 * - detailTransaksiPembelians: TransactionDetail[]
 */
export interface TransactionItem {
  ID_TRANSAKSI_PEMBELIAN: number;
  TGL_PESAN_PEMBELIAN: string;
  TOT_HARGA_PEMBELIAN: number;
  STATUS_PEMBAYARAN: string;
  detailTransaksiPembelians: TransactionDetail[];
}

/**
 * Response ketika memanggil GET /api/user/transactions?start_date=…&end_date=…
 * Bentuknya: { data: TransactionItem[] }
 */
export interface TransactionListResponse {
  data: TransactionItem[];
}

/**
 * Fetch daftar transaksi user dengan rentang tanggal:
 */
export async function fetchUserTransactions(
  startDate: string,
  endDate: string
): Promise<TransactionListResponse> {
  const response = await api.get<TransactionListResponse>(
    "/user/transactions",
    {
      params: { start_date: startDate, end_date: endDate },
    }
  );
  return response.data;
}

/**
 * Interface TransactionDetailResponse:
 * Sama seperti di atas, tetapi bisa menambahkan field lain jika endpoint detail mengembalikan tambahan.
 */
export interface TransactionDetailResponse {
  ID_TRANSAKSI_PEMBELIAN: number;
  TGL_PESAN_PEMBELIAN: string;
  TOT_HARGA_PEMBELIAN: number;
  STATUS_PEMBAYARAN: string;
  detailTransaksiPembelians: TransactionDetail[];
  // Tambahkan field lain jika endpoint detail mengembalikan misalnya KODE_TRANSAKSI, ALAMAT, dll.
}

/**
 * Fetch detail sebuah transaksi berdasar ID:
 * GET /api/user/transactions/{id}
 */
export async function fetchTransactionDetail(
  id: number
): Promise<TransactionDetailResponse> {
  const response = await api.get<TransactionDetailResponse>(
    `/user/transactions/${id}`
  );
  return response.data;
}
