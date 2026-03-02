import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../api/authApi.ts";
import type { LoginPayload } from "../api/authApi.ts";
import { loginRes } from "../metadata/metadata.ts";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      if (import.meta.env.VITE_USE_MOCK === "true") {
        return loginRes;
      }
      return loginApi(payload);
    },
  });
};