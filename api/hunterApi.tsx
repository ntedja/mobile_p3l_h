// api/hunterApi.tsx

import axios from "axios";
import { getToken } from "./apiAuth";

const API_BASE_URL = "https://dashboard.reusemart.site/api";

const hunterApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor sinkron — pakai token dari cache (tanpa ganti object header)
hunterApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["Accept"] = "application/json";
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ✅ Tipe untuk profil pegawai (hunter)
export type HunterProfile = {
  ID_PEGAWAI: number;
  NAMA_PEGAWAI: string;
  EMAIL_PEGAWAI: string;
  NO_TELP_PEGAWAI: string;
  KOMISI_PEGAWAI: number;
  jabatans: {
    NAMA_JABATAN: string;
  };
};

// ✅ Tipe untuk detail komisi
export type KomisiDetail = {
  ID_KOMISI: number;
  JENIS_KOMISI: string;
  NOMINAL_KOMISI: number;
  ID_TRANSAKSI_PEMBELIAN: number;
  created_at: string;
  STATUS_BARANG?: string;
};

// ✅ Ambil profil hunter berdasarkan ID
export async function fetchHunterProfile(id: number): Promise<HunterProfile> {
  const response = await hunterApi.get<HunterProfile>(`/pegawai/${id}/profile`);
  return response.data;
}

// ✅ Ambil daftar riwayat komisi hunter
export async function fetchHunterKomisi(id: number): Promise<KomisiDetail[]> {
  const response = await hunterApi.get<KomisiDetail[]>(`/pegawai/${id}/komisi`);
  return response.data;
}

export default hunterApi;
