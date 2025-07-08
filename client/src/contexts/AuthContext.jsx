import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";

const AuthContext = createContext({});

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userType, setUserType] = useState(localStorage.getItem("userType"));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUserType = localStorage.getItem("userType");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUserType && storedUser) {
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

        let userData;
        try {
          userData = JSON.parse(storedUser);
        } catch (parseError) {
          console.error("Failed to parse stored user data:", parseError);
          logout();
          return;
        }

        setToken(storedToken);
        setUserType(storedUserType);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials, role) => {
    try {
      setLoading(true);

      const endpoint =
        role === "admin" ? "/admin/login" : "/employee/auth/login";
      const response = await api.post(endpoint, credentials);

      const { user: userData, token: authToken } = response.data;

      localStorage.setItem("token", authToken);
      localStorage.setItem("userType", role);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(authToken);
      setUserType(role);
      setUser(userData);
      setIsAuthenticated(true);

      api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      toast.success("Login successful!");
      return { success: true, user: userData, token: authToken };
    } catch (error) {
      const message = error.response?.data?.error || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        const endpoint =
          userType === "admin" ? "/admin/logout" : "/employee/auth/logout";
        await api.post(endpoint);
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      localStorage.removeItem("user");

      setToken(null);
      setUserType(null);
      setUser(null);
      setIsAuthenticated(false);

      delete api.defaults.headers.common["Authorization"];

      toast.info("Logged out successfully");
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const changePassword = async (passwordData) => {
    try {
      const endpoint =
        userType === "admin"
          ? "/admin/password/change"
          : "/employee/auth/change-password";

      const response = await api.patch(endpoint, passwordData);

      if (response.data.token) {
        const newToken = response.data.token;
        localStorage.setItem("token", newToken);
        setToken(newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      }

      toast.success("Password changed successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Password change failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email, role) => {
    try {
      const endpoint =
        role === "admin"
          ? "/admin/password/forgot"
          : "/employee/auth/forgot-password";

      const response = await api.post(endpoint, { email });
      toast.success("Password reset code sent to your email!");
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to send reset code";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyResetCode = async (email, code, role) => {
    try {
      const endpoint =
        role === "admin"
          ? "/admin/verify/otp"
          : "/employee/auth/verify-reset-code";

      await api.post(endpoint, { email, code });
      toast.success("Reset code verified!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Invalid reset code";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email, code, newPassword, role) => {
    try {
      const endpoint =
        role === "admin"
          ? "/admin/password/reset"
          : "/employee/auth/reset-password";

      const response = await api.post(endpoint, {
        email,
        code,
        newPassword,
      });

      toast.success("Password reset successful!");
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || "Password reset failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    userType,
    loading,
    isAuthenticated,

    login,
    logout,
    updateUser,
    changePassword,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
