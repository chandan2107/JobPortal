import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Call the backend to verify the token/cookie and get current user
  const checkAuthStatus = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.AUTH.GET_ME);
      if (response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch {
      // Cookie/token missing or invalid — user is not logged in
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  // Called after successful login/register
  const login = (userData) => {
    if (userData?.token) {
      localStorage.setItem("token", userData.token);
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Call the backend logout endpoint to clear the HttpOnly cookie and localStorage
  const logout = async () => {
    try {
      await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
    } catch {
      // Ignore errors — clear local state regardless
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/";
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};