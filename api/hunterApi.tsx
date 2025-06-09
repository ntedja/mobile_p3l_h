import axios from "axios";
import { getToken } from "./apiAuth";

const API_BASE_URL = "http://10.31.240.42:8000/api";

const hunterApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

hunterApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log("Using token:", token);
    if (token) {
      config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

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

export type KomisiDetail = {
  ID_KOMISI: number;
  JENIS_KOMISI: string;
  NOMINAL_KOMISI: number;
  ID_TRANSAKSI_PEMBELIAN: number;
  created_at: string;
};

// Fetch profile
export async function fetchHunterProfile(id: number): Promise<HunterProfile> {
  const response = await hunterApi.get<HunterProfile>(`/pegawai/${id}/profile`);
  return response.data;
}

// Fetch komisi history
export async function fetchHunterKomisi(id: number): Promise<KomisiDetail[]> {
  const response = await hunterApi.get<KomisiDetail[]>(`/pegawai/${id}/komisi`);
  return response.data;
}

export default hunterApi;
