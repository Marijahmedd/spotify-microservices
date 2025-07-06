import { songsApi } from "@/api/songsApi";
import type { Album, FullAlbum, Song, Stats } from "@/types";
import { create } from "zustand";
const numberOfFeaturedSongs = 6;
const numberOfTrendingSongs = 4;
const numberOfMadeForYouSongs = 4;
interface MusicStore {
  songs: Song[];
  albums: Album[];

  isLoading: boolean;
  error: string | null;
  currentAlbum: FullAlbum | null;
  featuredSongs: Song[];
  madeForYouSongs: Song[];
  trendingSongs: Song[];
  stats: Stats;

  fetchAlbums: () => Promise<void>;
  fetchAlbumById: (id: string) => Promise<void>;
  fetchFeaturedSongs: () => Promise<void>;
  fetchMadeForYouSongs: () => Promise<void>;
  fetchTrendingSongs: () => Promise<void>;
  fetchSongs: () => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  albums: [],
  songs: [],
  isLoading: false,
  error: null,
  currentAlbum: null,
  madeForYouSongs: [],
  featuredSongs: [],
  trendingSongs: [],
  stats: {
    totalSongs: 0,
    totalAlbums: 0,
    totalUsers: 0,
    totalArtists: 0,
  },

  fetchSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await songsApi.get("/");
      set({ songs: response.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAlbums: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await songsApi.get("/album");
      const albums = Array.isArray(response.data.albums)
        ? response.data.albums
        : [];
      set({ albums });
    } catch (error: any) {
      set({ error: error?.response?.data?.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAlbumById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await songsApi.get(`/album/${id}`);
      const album = {
        ...response.data.album,
        songs: response.data.songs,
      };
      set({ currentAlbum: album });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFeaturedSongs: async () => {
    const songs = get().songs;
    if (!songs || songs.length === 0) {
      await get().fetchSongs();
    }
    const allSongs = get().songs;
    const shuffled = [...allSongs].sort(() => 0.5 - Math.random());
    set({ featuredSongs: shuffled.slice(0, numberOfFeaturedSongs) });
  },

  fetchMadeForYouSongs: async () => {
    const songs = get().songs;
    if (!songs || songs.length === 0) {
      await get().fetchSongs();
    }
    const allSongs = get().songs;
    const shuffled = [...allSongs].sort(() => 0.5 - Math.random());
    set({ madeForYouSongs: shuffled.slice(0, numberOfMadeForYouSongs) });
  },

  fetchTrendingSongs: async () => {
    const songs = get().songs;
    if (!songs || songs.length === 0) {
      await get().fetchSongs();
    }
    const allSongs = get().songs;
    const shuffled = [...allSongs].sort(() => 0.5 - Math.random());
    set({ trendingSongs: shuffled.slice(0, numberOfTrendingSongs) });
  },
}));
