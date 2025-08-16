import api from "./axios";
import type { User } from "../types/user";

export async function login(email: string, password: string) {
  const { data } = await api.post<{ access_token: string }>("/auth/login", {
    email,
    password,
  });

  const token = data?.access_token;
  if (!token) throw new Error("Token manquant");

  localStorage.setItem("token", token);

  const me = await api.get<User>("/auth/me");
  localStorage.setItem("user", JSON.stringify(me.data));
  localStorage.setItem("role", (me.data as any).role);

  return me.data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
}
