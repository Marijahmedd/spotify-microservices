// src/api/setupInterceptors.ts
import type { AxiosInstance } from "axios";
import { useUserStore } from "@/store/useUserStore";
import { usersApi } from "./usersApi";

let refreshPromise: Promise<string> | null = null;

export const setupInterceptors = (api: AxiosInstance) => {
  api.interceptors.request.use((config) => {
    const token = useUserStore.getState().accessToken;
    if (config.headers?.skipAuth) {
      delete config.headers.skipAuth;
      delete config.headers.Authorization;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 errors with token refresh logic
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Check if we have a refresh token (assuming it's stored in httpOnly cookie)
        // If no access token exists, don't attempt refresh
        if (!useUserStore.getState().accessToken) {
          useUserStore.getState().logout();
          return Promise.reject(error);
        }

        // Attempt token refresh
        if (!refreshPromise) {
          refreshPromise = (async () => {
            try {
              const response = await usersApi.post(`/refresh-token`, null, {
                withCredentials: true,
                headers: { skipAuth: true }, // Skip auth for refresh request
              });

              const newToken = response.data.accessToken;
              useUserStore.setState((s) => ({ ...s, accessToken: newToken }));
              return newToken;
            } catch (err) {
              // Only logout if refresh fails
              useUserStore.getState().logout();
              throw err;
            } finally {
              refreshPromise = null;
            }
          })();
        }

        try {
          const newToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (err) {
          // Refresh failed, user will be logged out by the refresh promise
          return Promise.reject(err);
        }
      }

      // For other errors, just reject
      return Promise.reject(error);
    }
  );
};
