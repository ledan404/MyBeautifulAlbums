import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@nextui-org/spinner";

import { getJwtToken, refreshJwtToken } from "@/api/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getJwtToken();

      if (token) {
        try {
          await refreshJwtToken();
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to refresh token:", error);
          setIsAuthenticated(false);
          localStorage.removeItem("tokenData");
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token: string) => {
    localStorage.setItem(
      "tokenData",
      JSON.stringify({ jwt_access_token: token }),
    );

    setIsAuthenticated(true);
    router.push("/profile");
    window.location.reload(); // Reload the page after login
  };

  const logout = () => {
    localStorage.removeItem("tokenData");
    setIsAuthenticated(false);
    router.push("/");
    window.location.reload(); // Reload the page after logout
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
