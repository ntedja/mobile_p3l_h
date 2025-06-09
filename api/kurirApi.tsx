// api/kurirApi.tsx

import axios from "axios";
import { getToken } from "./apiAuth";

const API_BASE_URL = "http://192.168.18.73:8000/api";

const kurirApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor sinkron — pakai token yang sudah di-cache di apiAuth.tsx
kurirApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export type KurirProfile = {
  ID_PEGAWAI: number;
  NAMA_PEGAWAI: string;
  EMAIL_PEGAWAI: string;
  NO_TELP_PEGAWAI: string;
  KOMISI_PEGAWAI: number;
  jabatans: {
    NAMA_JABATAN: string;
  };
};

// Tipe tugas pengiriman (pastikan sesuai schema backend)
export type TugasPengiriman = {
  ID_TRANSAKSI_PEMBELIAN: number;
  STATUS_TRANSAKSI: string;
  DELIVERY_METHOD: string;
  created_at: string;
  // tambahkan field lain jika dibutuhkan
};

// Fetch profil kurir
export async function fetchKurirProfile(id: number): Promise<KurirProfile> {
  const response = await kurirApi.get<KurirProfile>(`/pegawai/${id}/profile`);
  return response.data;
}

// Fetch daftar tugas pengiriman
export async function fetchKurirHistory(
  id: number
): Promise<TugasPengiriman[]> {
  const response = await kurirApi.get<TugasPengiriman[]>(
    `/pegawai/${id}/tugas`
  );
  return response.data;
}

// Update status pengiriman
export async function updateStatusPengiriman(id: number): Promise<void> {
  await kurirApi.patch(`/pegawai/tugas/${id}/selesai`);
}

export async function fetchKurirHistorySelesai(
  id: number
): Promise<TugasPengiriman[]> {
  const response = await kurirApi.get<TugasPengiriman[]>(
    `/pegawai/${id}/tugas-history`
  );
  return response.data;
}

// Default export
export default kurirApi;
