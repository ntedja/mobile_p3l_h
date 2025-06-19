// api/apiAuth.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosRequestHeaders } from "axios"; // ✅ impor tipe header

interface LoginResponse {
  token: string;
  role: string;
  user: any;
  jabatan?: string;
}

const API_BASE_URL = "http://172.16.98.54:8000/api";

const apiAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let tokenValue: string | null = null;

// ✅ Fungsi untuk menginisialisasi token saat app mulai
export const initToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    tokenValue = token;
    if (token) {
      apiAuth.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("Gagal membaca token dari AsyncStorage", e);
  }
};

export const getToken = () => tokenValue;

// ✅ Interceptor untuk menyisipkan token
apiAuth.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {} as AxiosRequestHeaders;
  }
  if (tokenValue) {
    config.headers.Authorization = `Bearer ${tokenValue}`;
  }
  return config;
});

// ✅ Fungsi login
export const login = async (email: string, password: string) => {
  try {
    const response = await apiAuth.post<LoginResponse>("/login", {
      email,
      password,
    });

    const { token, role, user, jabatan } = response.data;

    tokenValue = token;

    // Simpan ke AsyncStorage
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("role", role);
    await AsyncStorage.setItem("jabatan", jabatan ?? "");

    // Simpan ID pegawai jika ada
    if (role === "pegawai" && user?.ID_PEGAWAI) {
      await AsyncStorage.setItem("pegawai_id", user.ID_PEGAWAI.toString());
    }

    // Set token ke header default
    apiAuth.defaults.headers.common.Authorization = `Bearer ${token}`;

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login gagal");
  }
};

// ✅ Fungsi logout
export const logout = async () => {
  tokenValue = null;
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("role");
  await AsyncStorage.removeItem("jabatan");
};

export default apiAuth;
