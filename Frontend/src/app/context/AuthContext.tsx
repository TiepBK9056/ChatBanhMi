'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface User {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const refreshToken = useCallback(async () => {
    if (typeof window === "undefined") {
      setIsLoggedIn(false);
      setUser(null);
      return;
    }
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem("cart");
      localStorage.removeItem("isCartMerged");
      localStorage.removeItem("lastSyncedCart");
      return;
    }

    try {
      const response = await fetch("http://localhost:5130/api/auth/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("tokenExpiry", (Date.now() + data.expiresIn * 1000).toString());

        const userResponse = await fetch("http://localhost:5130/api/auth/me", {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setIsLoggedIn(true);
          setUser({
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            avatarUrl: userData.avatarUrl || "https://example.com/default-avatar.png",
          });
        } else {
          throw new Error("Failed to fetch user data after refresh");
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tokenExpiry");
        localStorage.removeItem("isCartMerged");
        localStorage.removeItem("cart");
        localStorage.removeItem("lastSyncedCart");
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Refresh token error:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("isCartMerged");
      localStorage.removeItem("cart");
      localStorage.removeItem("lastSyncedCart");
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const fetchUserData = useCallback(
    async (accessToken: string) => {
      try {
        const response = await fetch("http://localhost:5130/api/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setIsLoggedIn(true);
          setUser({
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            avatarUrl: userData.avatarUrl || "https://example.com/default-avatar.png",
          });
        } else if (response.status === 401) {
          await refreshToken();
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        await refreshToken();
      }
    },
    [refreshToken]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const tokenExpiry = localStorage.getItem("tokenExpiry");

      if (accessToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        await fetchUserData(accessToken);
      } else if (accessToken) {
        await refreshToken();
      } else {
        localStorage.removeItem("cart");
        localStorage.removeItem("isCartMerged");
        localStorage.removeItem("lastSyncedCart");
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuth();

    const tokenExpiry = localStorage.getItem("tokenExpiry");
    if (tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
      const timeout = parseInt(tokenExpiry) - Date.now() - 60000;
      const timer = setTimeout(() => refreshToken(), timeout > 0 ? timeout : 0);
      return () => clearTimeout(timer);
    }
  }, [fetchUserData, refreshToken]);

  const login = async (email: string, password: string) => {
    if (typeof window === "undefined") throw new Error("Cannot login on server-side");
    try {
      const response = await fetch("http://localhost:5130/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("tokenExpiry", (Date.now() + data.expiresIn * 1000).toString());

      await fetchUserData(data.accessToken);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (typeof window === "undefined") return;
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await fetch("http://localhost:5130/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("cart");
    localStorage.removeItem("isCartMerged");
    localStorage.removeItem("lastSyncedCart");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};