import { create } from "zustand";
import { persist } from "zustand/middleware";
import { usersApi } from "../api/usersApi";

interface User {
  // name: string;
  email: string;
  role: "admin" | "user" | string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

export const useUserStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,

      login: async (email, password) => {
        try {
          const res = await usersApi.post("/login", {
            email,
            password,
          });

          const token = res.data.accessToken;
          set({ accessToken: token });

          const authCheck = await usersApi.get("/check-auth", {
            withCredentials: true,
          });

          const user = authCheck.data.user as User;

          set({ user, isAuthenticated: true });
        } catch (err) {
          console.error("Login failed:", err);
          set({ user: null, isAuthenticated: false, accessToken: null });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, accessToken: null });
      },

      setAccessToken: (token) => {
        set({ accessToken: token });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    }
  )
);
