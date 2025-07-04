// src/api/usersApi.ts
import axios from "axios";
import { setupInterceptors } from "./setupInterceptors";

export const songsApi = axios.create({
  baseURL: import.meta.env.VITE_SONG_SERVICE_URL,
  withCredentials: true,
});
setupInterceptors(songsApi);
