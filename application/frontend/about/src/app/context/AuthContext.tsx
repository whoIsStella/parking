"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://52.52.40.129:8000/api";

export type User = {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  refreshAccessToken: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const ACCESS_TOKEN_KEY = "access_token";
  const REFRESH_TOKEN_KEY = "refresh_token";
  const USER_KEY = "user_data";

  useEffect(() => {
    const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedAccess && storedRefresh && storedUser) {
      setUserState(JSON.parse(storedUser));
      setAccessTokenState(storedAccess);
      setRefreshTokenState(storedRefresh);
    } else {
      setUserState(null);
      setAccessTokenState(null);
      setRefreshTokenState(null);
    }
    setIsLoading(false);
  }, []);

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  }, []);

  const setRefreshToken = useCallback((token: string | null) => {
    setRefreshTokenState(token);
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const setUserContext = useCallback((u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }, []);

  const signup: AuthContextType["signup"] = async (data) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API}/register/`, data);
      setAccessToken(res.data.access);
      setRefreshToken(res.data.refresh);
      setUserContext(res.data.user);
      return null;
    } catch (err: any) {
      return (
        err?.response?.data?.detail ||
        err?.response?.data?.email?.[0] ||
        "Signup failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const login: AuthContextType["login"] = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API}/login/`, { email, password });
      setAccessToken(res.data.access);
      setRefreshToken(res.data.refresh);
      setUserContext(res.data.user);
      router.push("/");
      return null;
    } catch (err: any) {
      return err?.response?.data?.detail || "Login failed";
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUserState(null);
    setAccessTokenState(null);
    setRefreshTokenState(null);
    router.push("/login");
  }, [router]);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      logout();
      return null;
    }
    try {
      const res = await axios.post(`${API}/token/refresh/`, {
        refresh: refreshToken,
      });
      if (res.data.access) {
        setAccessToken(res.data.access);
        return res.data.access;
      }
      logout();
      return null;
    } catch (err) {
      logout();
      return null;
    }
  }, [refreshToken, logout, setAccessToken]);
//line 164 - 180 was added to handle inactivity timeout. coment out if not needed
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
      }, 15 * 60 * 1000); // 15 minutes
    };
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        setAccessToken,
        setRefreshToken,
        setUser: setUserContext,
        isLoading,
        login,
        signup,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
