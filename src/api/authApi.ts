import { api } from "../config/axiosInstance";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  name: string;
  email: string;
  role: string;
  message: string;
}

export const loginApi = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", payload);
  return res.data;
};