import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.ADMIN.GET_ME);
      setAdminUser(res.data);
    } catch {
      setAdminUser(null);
    } finally {
      setAdminLoading(false);
    }
  };

  const adminLogin = (data) => setAdminUser(data);

  const adminLogout = async () => {
    try {
      await axiosInstance.post(API_PATHS.ADMIN.LOGOUT);
    } catch {}
    setAdminUser(null);
    window.location.href = "/";
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, adminLoading, adminLogin, adminLogout, checkAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
