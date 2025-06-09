import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "http://10.31.240.42:8000/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// simpan token di variabel module-scope (optional)
let authToken: string | null = null;
AsyncStorage.getItem("token")
  .then((tok) => {
    authToken = tok;
    if (tok) {
      api.defaults.headers.common.Authorization = `Bearer ${tok}`;
      api.defaults.headers.common.Accept = "application/json";
    }
  })
  .catch((e) => console.warn("Gagal baca token", e));

// interceptor async: baca token langsung dari AsyncStorage pada tiap request
// → we type everything as `any` so TS won’t force you to return a fully-shaped AxiosXHRConfig
api.interceptors.request.use(
  async (config: any): Promise<any> => {
    const tok = await AsyncStorage.getItem("token");
    if (tok) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${tok}`,
        Accept: "application/json",
      };
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Generic untuk response API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
//  Struktur Data API
// =====================

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  point: number;
}

export interface PesananItem {
  id: number;
  nama_produk: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}

export interface Pesanan {
  id: number;
  kode: string;
  tanggal: string;
  status_transaksi: string;
  total: number;
  item_count: number;
}

export interface PesananDetail {
  id: number;
  kode: string;
  tanggal: string;
  status_transaksi: string;
  total: number;
  alamat_pengiriman?: string;
  metode_pembayaran?: string;
  delivery_method?: string;
  status_bukti_transfer?: string;
  poin_didapat?: number;
  poin_potongan?: number;
  items: PesananItem[];
}

// =====================
//  API Functions
// =====================

/**
 * Ambil profil user (termasuk poin reward)
 * GET /api/user/profile
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await api.get<UserProfile>("/user/profile");
  return res.data;
}

/**
 * Ambil riwayat pesanan user di antara dua tanggal (opsional)
 * GET /api/pesanan?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
export async function fetchRiwayatPesanan(
  start?: Date,
  end?: Date
): Promise<Pesanan[]> {
  const qs: string[] = [];
  if (start) {
    qs.push(`start=${start.toISOString().split("T")[0]}`);
  }
  if (end) {
    qs.push(`end=${end.toISOString().split("T")[0]}`);
  }
  const query = qs.length ? `?${qs.join("&")}` : "";

  const res = await api.get<ApiResponse<any[]>>(`/pesanan${query}`);
  const p = res.data;
  if (p.success && Array.isArray(p.data)) {
    return p.data.map((raw: any) => ({
      id: raw.id,
      kode: raw.kode,
      tanggal: raw.tgl_pesan_pembelian,
      status_transaksi: raw.status_transaksi,
      total: raw.total ?? 0,
      item_count: raw.item_count ?? 0,
    }));
  }
  throw new Error(p.message || "Gagal mengambil riwayat pesanan");
}

/**
 * Ambil detail satu pesanan berdasarkan ID
 * GET /api/pesanan/{id}
 */
export async function fetchPesananDetail(id: number): Promise<PesananDetail> {
  const res = await api.get<ApiResponse<any>>(`/pesanan/${id}`);
  const p = res.data;
  if (p.success && p.data) {
    const raw = p.data;
    let items: PesananItem[] = [];
    if (Array.isArray(raw.detail_transaksi) && raw.detail_transaksi.length) {
      items = raw.detail_transaksi.map((d: any) => ({
        id: d.ID_BARANG,
        nama_produk: d.barang?.NAMA_BARANG || "-",
        jumlah: d.JUMLAH,
        harga_satuan: d.HARGA_SATUAN,
        subtotal: d.JUMLAH * d.HARGA_SATUAN,
      }));
    } else if (raw.barang) {
      items = [
        {
          id: raw.barang.id,
          nama_produk: raw.barang.nama,
          jumlah: 1,
          harga_satuan: raw.barang.harga,
          subtotal: raw.barang.harga,
        },
      ];
    }

    return {
      id: raw.id,
      kode: raw.kode,
      tanggal: raw.tgl_pesan_pembelian,
      status_transaksi: raw.status_transaksi,
      total: raw.total_bayar,
      alamat_pengiriman: raw.alamat_pengiriman,
      metode_pembayaran: raw.metode_pembayaran,
      delivery_method: raw.delivery_method,
      status_bukti_transfer: raw.status_bukti_transfer,
      poin_didapat: raw.poin_didapat,
      poin_potongan: raw.poin_potongan,
      items,
    };
  }
  throw new Error(p.message || `Gagal mengambil detail pesanan #${id}`);
}

/**
 * Kirim rating untuk satu barang
 * POST /api/barang/{id}/rating
 */
export async function submitRatingBarang(barangId: number, rating: number) {
  await api.post(`/barang/${barangId}/rating`, { rating });
}
