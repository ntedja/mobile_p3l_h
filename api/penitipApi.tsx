import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "http://172.16.33.96:8000/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

/**
 * Interceptor async: baca token langsung dari AsyncStorage pada tiap request
 */
api.interceptors.request.use(
  async (config: any) => {
    const tok = await AsyncStorage.getItem("token");
    console.log("DEBUG token:", tok);
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

// Tangani 401 Unauthorized: redirect atau logout
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized: token mungkin kedaluwarsa');
      // TODO: navigasi ke layar login atau hapus token
      AsyncStorage.removeItem('token');
      // misal: navigation.replace('Login');
    }
    return Promise.reject(error);
  }
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

/** Satu record riwayat barang penitipan */
export interface BarangHistory {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  tgl_masuk: string;
  tgl_keluar?: string;
  status: string;
}

/**
 * Ambil profil Penitip
 * GET /api/penitip/me
 */
export async function fetchPenitipProfile(): Promise<PenitipProfile> {
  const res = await api.get<ApiResponse<any>>("/penitip/me");
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
 * Ambil riwayat barang penitipan langsung dari tabel barangs
 * GET /api/penitip/me/barangs
 */
export async function fetchRiwayatBarangs(): Promise<BarangHistory[]> {
  const res = await api.get<ApiResponse<any[]>>('/penitip/me/barangs');
  if (res.data.success && Array.isArray(res.data.data)) {
    return res.data.data.map(raw => ({
      id: raw.id,
      nama: raw.nama,
      kategori: raw.kategori,
      harga: raw.harga,
      tgl_masuk: raw.tgl_masuk,
      tgl_keluar: raw.tgl_keluar,
      status: raw.status,
    }));
  }
  throw new Error(res.data.message || 'Gagal mengambil riwayat barang');
}
