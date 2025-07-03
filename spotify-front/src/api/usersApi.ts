// src/api/usersApi.ts
import axios from "axios";
import { setupInterceptors } from "./setupInterceptors";

export const usersApi = axios.create({
  baseURL: import.meta.env.VITE_USER_SERVICE_URL,
  withCredentials: true,
});
setupInterceptors(usersApi);
