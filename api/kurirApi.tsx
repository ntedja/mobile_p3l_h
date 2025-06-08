import axios from "axios";

const API_BASE_URL = "http://172.16.37.21:8000/api";

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

export type TugasPengiriman = {
  id: number;
  kode: string;
  tanggal: string;
  status: string;
  metode_pengiriman: string;
};

export async function fetchKurirProfile(
  id: number,
  token: string
): Promise<KurirProfile> {
  const response = await axios.get<KurirProfile>(
    `${API_BASE_URL}/pegawai/${id}/profile`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function fetchKurirHistory(
  id: number,
  token: string
): Promise<TugasPengiriman[]> {
  const response = await axios.get<TugasPengiriman[]>(
    `${API_BASE_URL}/pegawai/${id}/tugas`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function updateStatusPengiriman(
  id: number,
  token: string
): Promise<void> {
  await axios.patch(
    `${API_BASE_URL}/pegawai/tugas/${id}/selesai`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
