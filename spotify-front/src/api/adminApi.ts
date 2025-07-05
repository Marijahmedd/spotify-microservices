// src/api/usersApi.ts
import axios from "axios";
import { setupInterceptors } from "./setupInterceptors";

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_SERVICE_URL,
  withCredentials: true,
});
setupInterceptors(adminApi);
