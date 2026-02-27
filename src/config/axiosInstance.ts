import axios from "axios";

export const api = axios.create({
  baseURL: 'http://localhost:8700',
  withCredentials: true, // 🔑 REQUIRED for cookies
  timeout: 10000,
});

export const setupAuthInterceptor = () => {
  api.interceptors.request.use(
    (config) => {

    //   if (token) {
    //     config.headers.Authorization = `Bearer ${token}`;
    //   }

      return config;
    },
    (error) => Promise.reject(error)
  );
};

