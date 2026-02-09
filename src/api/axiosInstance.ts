import axios from "axios";
import { getCookie } from "./cookie";

export const api = axios.create({
  baseURL: 'http://localhost:8080/v1',
  withCredentials: true, // 🔑 REQUIRED for cookies
  timeout: 10000,
});

export const setupAuthInterceptor = () => {
  api.interceptors.request.use(
    (config) => {
      const token = getCookie("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
};

