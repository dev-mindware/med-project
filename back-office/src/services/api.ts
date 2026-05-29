import axios from "axios";
import { getAccessToken } from "@/actions/token";

let accessTokenCache: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

export const resetAccessTokenCache = () => {
  accessTokenCache = null;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const url = config.url || "";

  // Public auth routes
  const isPublicAuthRoute =
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password");

  if (!isPublicAuthRoute) {
    if (!accessTokenCache) {
      accessTokenCache = await getAccessToken();
    }

    if (accessTokenCache) {
      config.headers.Authorization = `Bearer ${accessTokenCache}`;
    }
  }

  return config;
});

const refreshAxios = axios.create({
  baseURL: "/", // Calls the Next.js routes
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Avoid retrying auth routes or already retried requests
    if (
      original.url.includes("/auth/login") ||
      original.url.includes("/auth/logout") ||
      original.url.includes("/api/auth/refresh") ||
      original._retry
    ) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = "Bearer " + token;
            return api(original);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const response = await refreshAxios.post("/api/auth/refresh");
        const newToken = response.data?.accessToken;
        const userData = response.data?.user;

        if (newToken) {
          accessTokenCache = newToken;
          
          if (userData && typeof window !== "undefined") {
            localStorage.setItem("medproject.user", JSON.stringify(userData));
          }

          processQueue(null, newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        } else {
          throw new Error("No token received");
        }
      } catch (refreshError) {
        resetAccessTokenCache();
        processQueue(refreshError, null);
        
        // Only redirect if we are in the browser
        if (typeof window !== "undefined") {
          window.location.replace("/auth/login");
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;
