"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/lib/services/api-client";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Expedition Director" | "Operations Manager" | "Guide Coordinator" | string;
  avatarUrl?: string;
  token?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await apiClient.get<AdminUser>("/admin/auth/me");
        if (res.success && res.data && res.data.id) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const response = await apiClient.post<AdminUser>("/admin/auth/login", {
        email,
        password: pass,
      });

      if (response.success && response.data) {
        setUser(response.data);
        return true;
      }
    } catch (err: any) {
      console.error("Admin login error:", err);
      throw err;
    }

    setUser(null);
    return false;
  };

  const logout = () => {
    setUser(null);
    apiClient.post("/admin/auth/logout").catch(() => {});
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
