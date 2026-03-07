import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tokenStorage } from "../storage/tokenStorage";

type AuthContextValue = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  signIn: () => Promise<void>;
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
      signIn: async () => {
        await tokenStorage.setToken("demo-token");
        setIsAuthenticated(true);
      },
      signOut: async () => {
        await tokenStorage.clearToken();
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
