import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "http://172.16.33.96:8000/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Interceptor async: baca token langsung dari AsyncStorage pada tiap request
 */
api.interceptors.request.use(
  async (config: any) => {
    const tok = await AsyncStorage.getItem("token");
    if (tok) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${tok}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Profil Penitip */
export interface PenitipProfile {
  id: number; // ID_PENITIP
  name: string; // NAMA_PENITIP
  email: string; // EMAIL_PENITIP
  saldo: number; // SALDO_PENITIP
  point: number; // POINT_LOYALITAS_PENITIP
}

/** Satu record riwayat titipan */
export interface Titipan {
  id: number; // ID_TRANSAKSI_PENITIPAN
  kode: string; // NO_NOTA_TRANSAKSI_TITIPAN
  tanggal: string; // TGL_MASUK_TITIPAN
  status: string; // “Masuk” atau “Keluar”
  jumlah: number; // jumlah barang
  nilai: number; // nilai total titipan
  items: {
    // detail tiap barang
    id: number;
    nama: string;
    jumlah: number;
    harga_satuan: number;
  }[];
}

/**
 * Ambil profil Penitip
 * GET /api/penitip/me
 */
export async function fetchPenitipProfile(): Promise<PenitipProfile> {
  const res = await api.get<ApiResponse<any>>("/penitip/me");
  console.log("DEBUG /penitip/me:", res.data);

  if (res.data.success) {
    const raw = res.data.data;
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      saldo: raw.saldo ?? 0,
      point: raw.point ?? 0,
    };
  }
  throw new Error(res.data.message || "Gagal mengambil profil Penitip");
}

/**
 * Ambil riwayat titipan antara dua tanggal
 * GET /api/penitip/me/transactions?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
export async function fetchRiwayatTitipan(
  from: Date,
  to: Date
): Promise<Titipan[]> {
  const start = from.toISOString().slice(0, 10);
  const end = to.toISOString().slice(0, 10);
  const res = await api.get<ApiResponse<any[]>>(
    `/penitip/me/transactions?start=${start}&end=${end}`
  );
  if (res.data.success && Array.isArray(res.data.data)) {
    return res.data.data.map((raw) => ({
      id: raw.ID_TRANSAKSI_PENITIPAN,
      kode: raw.NO_NOTA_TRANSAKSI_TITIPAN,
      tanggal: raw.TGL_MASUK_TITIPAN,
      status: raw.TGL_KELUAR_TITIPAN ? "Keluar" : "Masuk",
      jumlah: raw.detailTransaksiPenitipans?.length ?? 0,
      nilai: raw.nilai_total ?? 0,
      items: (raw.detailTransaksiPenitipans ?? []).map((d: any) => ({
        id: d.ID_DETAIL_TRANSAKSI_PENITIPAN,
        nama: d.barang?.NAMA_BARANG ?? "-",
        jumlah: d.JUMLAH,
        harga_satuan: d.HARGA_SATUAN,
      })),
    }));
  }
  throw new Error(res.data.message || "Gagal mengambil riwayat titipan");
}