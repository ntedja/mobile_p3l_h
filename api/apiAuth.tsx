import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

interface LoginResponse {
  token: string;
  role: string;
  user: any;
  jabatan?: string;
}

const API_BASE_URL = "http://10.31.248.95:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let tokenValue: string | null = null;

// Ambil token sekali saat app mulai (atau saat module ini di-import)
(async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    tokenValue = token;
  } catch (e) {
    console.warn("Gagal membaca token dari AsyncStorage", e);
  }
})();

api.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {};
  }
  if (tokenValue) {
    config.headers.Authorization = `Bearer ${tokenValue}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post<LoginResponse>("/login", {
      email,
      password,
    });
    const { token, role, user, jabatan } = response.data;

    tokenValue = token; // update token di variabel global

    await AsyncStorage.setItem("token", token);

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login gagal");
  }
};

export const logout = async () => {
  tokenValue = null;
  await AsyncStorage.removeItem("token");
};
