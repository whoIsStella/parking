// "use client";
// import React, { useContext, createContext, useMemo, useRef } from "react";
// import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
// import { useAuth } from "./AuthContext";

// interface APIContextType {
//   api: AxiosInstance;
//   get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
//   post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
//   patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
//   put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
//   delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
// }

// const APIContext = createContext<APIContextType | undefined>(undefined);

// export const APIProvider = ({ children }: { children: React.ReactNode }) => {
//   const { setAccessToken, logout, refreshAccessToken: authRefreshAccessToken } = useAuth() as any;

//   const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://52.52.40.129:8000/api";
//   const axiosInstanceRef = useRef<AxiosInstance | null>(null);

//   if (!axiosInstanceRef.current) {
//     const instance = axios.create({
//       baseURL,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     instance.interceptors.request.use(
//       config => {
//         const token = localStorage.getItem("access_token");
//         if (token) {
//           config.headers = config.headers || {};
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       error => Promise.reject(error)
//     );

//     instance.interceptors.response.use(
//       response => response,
//       async error => {
//         const originalRequest = error.config;

//         if (originalRequest.url && originalRequest.url.includes('/token/refresh/')) {
//             return Promise.reject(error);
//         }

//         if (
//           error.response &&
//           error.response.status === 401 &&
//           !originalRequest._retry
//         ) {
//           originalRequest._retry = true;

//           const newAccess = await authRefreshAccessToken();

//           if (newAccess) {
//             originalRequest.headers = {
//               ...originalRequest.headers,
//               Authorization: `Bearer ${newAccess}`,
//             };
//             return instance(originalRequest);
//           } else {
//             logout && logout();
//           }
//         }
//         return Promise.reject(error);
//       }
//     );

//     axiosInstanceRef.current = instance;
//   }

//   const api = axiosInstanceRef.current;

//   const value: APIContextType = useMemo(() => ({
//     api: api!,
//     get: (url, config) => api!.get(url, config),
//     post: (url, data, config) => api!.post(url, data, config),
//     patch: (url, data, config) => api!.patch(url, data, config),
//     put: (url, data, config) => api!.put(url, data, config),
//     delete: (url, config) => api!.delete(url, config),
//   }), [api]);

//   return <APIContext.Provider value={value}>{children}</APIContext.Provider>;
// };

// export function useAPI() {
//   const ctx = useContext(APIContext);
//   if (!ctx) throw new Error("useAPI must be used within an APIProvider");
//   return ctx;
// }

// "use client"; //Best one
// import React, { useContext, createContext, useMemo } from "react";
// import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
// import { useAuth } from "./AuthContext";

// interface APIContextType {
//   api: AxiosInstance;
//   get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
//   post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
//   patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
//   put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
//   delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
// }

// const APIContext = createContext<APIContextType | undefined>(undefined);

// export const APIProvider = ({ children }: { children: React.ReactNode }) => {
//   const { accessToken, setAccessToken, logout } = useAuth() as any;
//   const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://52.52.40.129:8000/api";

//   const refreshAccessToken = async () => {
//     const refresh = localStorage.getItem("refresh_token");
//     if (!refresh) {
//       logout && logout();
//       return null;
//     }
//     try {
//       const response = await axios.post(`${baseURL}/token/refresh/`, { refresh });
//       const newAccess = response.data.access;
//       setAccessToken(newAccess);
//       localStorage.setItem("access_token", newAccess);
//       return newAccess;
//     } catch (err) {
//       logout && logout();
//       return null;
//     }
//   };

//   const api = useMemo(() => {
//     const instance = axios.create({
//       baseURL,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     instance.interceptors.request.use(
//       config => {
//         const token = accessToken || localStorage.getItem("access_token");
//         if (token) {
//           config.headers = config.headers || {};
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       error => Promise.reject(error)
//     );

//     instance.interceptors.response.use(
//       response => response,
//       async error => {
//         const originalRequest = error.config;
//         if (
//           error.response &&
//           error.response.status === 401 &&
//           !originalRequest._retry
//         ) {
//           originalRequest._retry = true;
//           const newAccess = await refreshAccessToken();
//           if (newAccess) {
//             originalRequest.headers = {
//               ...originalRequest.headers,
//               Authorization: `Bearer ${newAccess}`,
//             };
//             return instance(originalRequest);
//           }
//         }
//         return Promise.reject(error);
//       }
//     );

//     return instance;

//  }, [baseURL, accessToken, logout]);

//   const value: APIContextType = useMemo(() => {
//     const get = (url: string, config?: AxiosRequestConfig) => api.get(url, config);
//     const post = (url: string, data?: any, config?: AxiosRequestConfig) => api.post(url, data, config);
//     const patch = (url: string, data?: any, config?: AxiosRequestConfig) => api.patch(url, data, config);
//     const put = (url: string, data?: any, config?: AxiosRequestConfig) => api.put(url, data, config);
//     const del = (url: string, config?: AxiosRequestConfig) => api.delete(url, config);
//     return { api, get, post, patch, put, delete: del };
//   }, [api]);

//   return <APIContext.Provider value={value}>{children}</APIContext.Provider>;
//   // }, [baseURL, accessToken]);

//   // const get = (url: string, config?: AxiosRequestConfig) => api.get(url, config);
//   // const post = (url: string, data?: any, config?: AxiosRequestConfig) => api.post(url, data, config);
//   // const patch = (url: string, data?: any, config?: AxiosRequestConfig) => api.patch(url, data, config);
//   // const put = (url: string, data?: any, config?: AxiosRequestConfig) => api.put(url, data, config);
//   // const del = (url: string, config?: AxiosRequestConfig) => api.delete(url, config);

//   // const value: APIContextType = { api, get, post, patch, put, delete: del };

//   // return <APIContext.Provider value={value}>{children}</APIContext.Provider>;
// };

// export function useAPI() {
//   const ctx = useContext(APIContext);
//   if (!ctx) throw new Error("useAPI must be used within an APIProvider");
//   return ctx;
// }

"use client";
import React, { useContext, createContext, useMemo, useRef } from "react";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { useAuth } from "./AuthContext";

export interface APIContextType {
  api: AxiosInstance;
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ) => Promise<AxiosResponse<T>>;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

export const APIProvider = ({ children }: { children: React.ReactNode }) => {
  const { logout, refreshAccessToken: authRefreshAccessToken } =
    useAuth() as any;

  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://52.52.40.129:8000/api";
  const axiosInstanceRef = useRef<AxiosInstance | null>(null);

  if (!axiosInstanceRef.current) {
    const instance = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          originalRequest.url &&
          originalRequest.url.includes("/token/refresh/")
        ) {
          return Promise.reject(error);
        }

        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          const newAccess = await authRefreshAccessToken();

          if (newAccess) {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            instance.defaults.headers.common["Authorization"] =
              `Bearer ${newAccess}`;
            return instance(originalRequest);
          } else {
            logout && logout();
          }
        }
        return Promise.reject(error);
      },
    );

    axiosInstanceRef.current = instance;
  }

  const api = axiosInstanceRef.current;

  const value: APIContextType = useMemo(
    () => ({
      api: api!,
      get: (url, config) => api!.get(url, config),
      post: (url, data, config) => api!.post(url, data, config),
      patch: (url, data, config) => api!.patch(url, data, config),
      put: (url, data, config) => api!.put(url, data, config),
      delete: (url, config) => api!.delete(url, config),
    }),
    [api],
  );

  return <APIContext.Provider value={value}>{children}</APIContext.Provider>;
};

export function useAPI() {
  const ctx = useContext(APIContext);
  if (!ctx) throw new Error("useAPI must be used within an APIProvider");
  return ctx;
}
