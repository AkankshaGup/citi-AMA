import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../api/authApi.ts";
import type { LoginPayload } from "../api/authApi.ts";

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginApi(payload),
  });
};