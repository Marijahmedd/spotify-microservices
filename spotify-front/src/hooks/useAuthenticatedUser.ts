// src/hooks/useAuthenticatedUser.ts
import { useEffect, useState } from "react";
import { usersApi } from "@/api/usersApi";
import { AxiosError } from "axios";

export interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
}

interface UseAuthenticatedUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  refetch: () => Promise<void>;
}

export const useAuthenticatedUser = (): UseAuthenticatedUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUser = async (showRefreshing = false) => {
    try {
      setError(null);
      if (showRefreshing) setIsRefreshing(true);

      const res = await usersApi.get("/check-auth");
      setUser(res.data.user);
    } catch (err) {
      console.error("❌ Failed to fetch user:", err);

      const axiosError = err as AxiosError;
      if (axiosError.response?.status === 401) {
        // Token might be refreshing, wait before showing error
        if (!showRefreshing) {
          setIsRefreshing(true);

          // Give token refresh some time
          await new Promise((resolve) => setTimeout(resolve, 1500));

          try {
            const retryRes = await usersApi.get("/check-auth");
            setUser(retryRes.data.user);
          } catch (retryErr) {
            setError("Session expired. Please log in again.");
          }
        } else {
          setError("Session expired. Please log in again.");
        }
      } else {
        setError("Failed to load user data.");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetch = () => fetchUser(true);

  return { user, loading, error, isRefreshing, refetch };
};

// Updated Dashboard Component
// src/components/pages/DashboardPage.tsx
