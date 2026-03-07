import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/authApi";
import { setAuthToken } from "../api/httpClient";
import { tokenStorage } from "../storage/tokenStorage";
import type { AuthCredentials, RegisterPayload } from "../types/auth";

type AuthContextValue = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  signIn: (payload: AuthCredentials) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const token = await tokenStorage.getToken();
        if (isMounted) {
          setIsAuthenticated(Boolean(token));
          setAuthToken(token);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isAuthLoading,
      signIn: async (payload: AuthCredentials) => {
        const { token } = await authApi.login(payload);
        await tokenStorage.setToken(token);
        setAuthToken(token);
        setIsAuthenticated(true);
      },
      signUp: async (payload: RegisterPayload) => {
        const { token } = await authApi.register(payload);
        await tokenStorage.setToken(token);
        setAuthToken(token);
        setIsAuthenticated(true);
      },
      signOut: async () => {
        await tokenStorage.clearToken();
        setAuthToken(null);
        setIsAuthenticated(false);
      }
    }),
    [isAuthenticated, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
